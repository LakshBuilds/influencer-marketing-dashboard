#!/usr/bin/env node
/**
 * Batch mobile-viewport screenshots + local OCR (no LLM tokens).
 * Uses Playwright + tesseract.js.
 *
 * Prereqs:
 *   npm install
 *   npx playwright install chromium
 *   (On Apple Silicon, Playwright must download arm64 browsers on your machine.)
 *
 * Usage:
 *   node scripts/capture-mobile-screenshots.mjs --input search-urls-useful.txt --out url-capture-output --limit 50 --delay 1200
 *   node scripts/capture-mobile-screenshots.mjs --langs eng+hin   # better for Hindi UI (first run downloads lang data)
 *
 * Resume: skips URLs that already have screenshots + json sidecar in output dir.
 */

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { createWorker } from 'tesseract.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

function arg(name, def) {
  const i = process.argv.indexOf(name)
  if (i === -1 || !process.argv[i + 1]) return def
  return process.argv[i + 1]
}

function hasFlag(name) {
  return process.argv.includes(name)
}

const inputFile = path.resolve(root, arg('--input', 'search-urls-useful.txt'))
const outDir = path.resolve(root, arg('--out', 'url-capture-output'))
const limit = parseInt(arg('--limit', '0'), 10) || Infinity
const delayMs = parseInt(arg('--delay', '1500'), 10)
const navTimeout = parseInt(arg('--timeout', '45000'), 10)
const startIndex = parseInt(arg('--start', '0'), 10)
const langs = arg('--langs', 'eng')

const shotsDir = path.join(outDir, 'screenshots')
const metaDir = path.join(outDir, 'meta')

function slugForUrl(url) {
  return crypto.createHash('sha256').update(url).digest('hex').slice(0, 20)
}

async function main() {
  if (!fs.existsSync(inputFile)) {
    console.error('Input file not found:', inputFile)
    console.error('Run: node scripts/filter-search-urls.mjs')
    process.exit(1)
  }

  const lines = fs
    .readFileSync(inputFile, 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  const slice = lines.slice(startIndex, startIndex + limit)

  fs.mkdirSync(shotsDir, { recursive: true })
  fs.mkdirSync(metaDir, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  })

  const page = await context.newPage()
  const worker = await createWorker(langs)

  const manifest = []
  let done = 0
  let skipped = 0
  let failed = 0

  for (const url of slice) {
    const id = slugForUrl(url)
    const pngPath = path.join(shotsDir, `${id}.png`)
    const jsonPath = path.join(metaDir, `${id}.json`)

    if (fs.existsSync(pngPath) && fs.existsSync(jsonPath) && !hasFlag('--force')) {
      try {
        const prev = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
        manifest.push(prev)
        skipped++
        continue
      } catch {
        /* re-capture */
      }
    }

    let ocrText = ''
    let error = null
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: navTimeout })
      await new Promise((r) => setTimeout(r, 800))
      await page.screenshot({ path: pngPath, fullPage: true })
      const {
        data: { text },
      } = await worker.recognize(pngPath)
      ocrText = (text || '').trim()
    } catch (e) {
      error = String(e.message || e)
      failed++
      console.warn('FAIL', url, error)
    }

    const record = {
      url,
      screenshot: path.relative(outDir, pngPath).replace(/\\/g, '/'),
      ocr_text: ocrText,
      captured_at: new Date().toISOString(),
      error,
    }

    fs.writeFileSync(jsonPath, JSON.stringify(record, null, 0), 'utf8')
    manifest.push(record)
    done++

    if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs))
  }

  await worker.terminate()
  await browser.close()

  const jsonlPath = path.join(outDir, 'training-corpus.jsonl')
  const failPath = path.join(outDir, 'capture-failures.jsonl')
  const mdPath = path.join(outDir, 'training-corpus.md')

  const linesOut = manifest
    .filter((r) => !r.error && r.ocr_text)
    .map((r) => JSON.stringify({ url: r.url, screenshot: r.screenshot, text: r.ocr_text }))
  fs.writeFileSync(jsonlPath, linesOut.join('\n') + (linesOut.length ? '\n' : ''), 'utf8')

  const failLines = manifest
    .filter((r) => r.error)
    .map((r) => JSON.stringify({ url: r.url, error: r.error }))
  fs.writeFileSync(failPath, failLines.join('\n') + (failLines.length ? '\n' : ''), 'utf8')

  const mdChunks = manifest
    .filter((r) => !r.error)
    .map(
      (r) =>
        `### ${r.url}\n\n![mobile](${r.screenshot})\n\n**OCR:**\n\n${r.ocr_text || '_(no text)_'}\n\n---\n`
    )
  fs.writeFileSync(mdPath, mdChunks.join('\n'), 'utf8')

  console.log('Done. captured:', done, 'skipped (resume):', skipped, 'failed:', failed)
  console.log('JSONL (url + screenshot path + OCR text):', path.relative(root, jsonlPath))
  console.log('Failures:', path.relative(root, failPath))
  console.log('Markdown:', path.relative(root, mdPath))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
