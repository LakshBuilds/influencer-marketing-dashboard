#!/usr/bin/env node
/**
 * Extracts HTTP(S) URLs from a messy dump (e.g. gau + terminal output),
 * keeps only likely HTML pages for buyhatke.com, drops static assets and junk.
 *
 * Usage: node scripts/filter-search-urls.mjs [input.txt] [output.txt]
 * Defaults: search.txt -> search-urls-useful.txt
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const inputPath = path.resolve(root, process.argv[2] || 'search.txt')
const outputPath = path.resolve(root, process.argv[3] || 'search-urls-useful.txt')

const URL_RE = /https?:\/\/[^\s"'<>\[\]()]+/gi

const STATIC_EXT = new Set([
  'jpg',
  'jpeg',
  'png',
  'gif',
  'webp',
  'svg',
  'ico',
  'bmp',
  'avif',
  'js',
  'mjs',
  'cjs',
  'css',
  'map',
  'woff',
  'woff2',
  'ttf',
  'otf',
  'eot',
  'mp4',
  'webm',
  'm3u8',
  'mp3',
  'wav',
  'pdf',
  'zip',
  'gz',
  'tar',
  'rar',
  '7z',
  'wasm',
])

const PATH_DENY = [
  '/_app/',
  '/_next/',
  '/static/chunks/',
  '/node_modules/',
  '/.well-known/',
  'favicon',
  '/immutable/',
  'service-worker',
  '/sw.js',
  '/workbox-',
  'manifest.json',
  'robots.txt',
  'sitemap.xml',
  '.htaccess',
]

function hostAllowed(host) {
  const h = host.toLowerCase().replace(/^www\./, '')
  return h === 'buyhatke.com' || h.endsWith('.buyhatke.com')
}

function pathExtJunk(pathname) {
  const seg = pathname.split('/').pop() || ''
  const base = seg.split('?')[0]
  const dot = base.lastIndexOf('.')
  if (dot === -1) return false
  const ext = base.slice(dot + 1).toLowerCase()
  if (ext.includes('/')) return false
  return STATIC_EXT.has(ext)
}

function pathPatternJunk(pathname) {
  const p = pathname.toLowerCase()
  return PATH_DENY.some((x) => p.includes(x.toLowerCase()))
}

function looksLikeGarbage(url) {
  if (url.length > 2000) return true
  if (url.includes('*') && !url.includes('%2A')) return true
  if (url.includes('\n') || url.includes('\r')) return true
  if (/%0a/i.test(url) && url.length < 80) return true
  return false
}

function pathOrQueryTooNoisy(parsed) {
  if (parsed.pathname.length > 280) return true
  if (parsed.search.length > 600) return true
  return false
}

function normalizeUrl(u) {
  let parsed
  try {
    parsed = new URL(u)
  } catch {
    return null
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) return null
  if (!hostAllowed(parsed.hostname)) return null
  if (looksLikeGarbage(parsed.href)) return null
  if (pathOrQueryTooNoisy(parsed)) return null
  if (pathExtJunk(parsed.pathname)) return null
  if (pathPatternJunk(parsed.pathname)) return null

  parsed.hash = ''
  if ((parsed.protocol === 'http:' && parsed.port === '80') || (parsed.protocol === 'https:' && parsed.port === '443')) {
    parsed.port = ''
  }
  if (parsed.protocol === 'http:' && parsed.port === '') {
    parsed.protocol = 'https:'
  }
  let out = parsed.toString()
  if (out.endsWith('/')) out = out.slice(0, -1) || parsed.origin + '/'
  return out
}

function main() {
  if (!fs.existsSync(inputPath)) {
    console.error('Missing input:', inputPath)
    process.exit(1)
  }
  const text = fs.readFileSync(inputPath, 'utf8')
  const raw = new Set()
  for (const m of text.matchAll(URL_RE)) {
    let s = m[0].replace(/[,;.)'"\]]+$/g, '')
    const n = normalizeUrl(s)
    if (n) raw.add(n)
  }

  const sorted = [...raw].sort()
  fs.writeFileSync(outputPath, sorted.join('\n') + '\n', 'utf8')
  console.log('Wrote', sorted.length, 'unique useful URLs ->', path.relative(root, outputPath))
}

main()
