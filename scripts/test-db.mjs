/**
 * Run: node scripts/test-db.mjs
 * Tests DB connection (loads .env.local via dotenv if needed)
 */
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { Pool } from 'pg'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

// Load .env.local
try {
  const envPath = join(root, '.env.local')
  const content = readFileSync(envPath, 'utf8')
  for (const line of content.split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/)
    if (m) {
      const key = m[1].trim()
      let val = m[2].trim()
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1)
      if (!process.env[key]) process.env[key] = val
    }
  }
} catch (e) {
  console.error('No .env.local:', e.message)
  process.exit(1)
}

const instagramUrl = process.env.DATABASE_URL_INSTAGRAM
const youtubeUrl = process.env.DATABASE_URL_YOUTUBE

console.log('Env check:', {
  hasInstagram: Boolean(instagramUrl),
  hasYouTube: Boolean(youtubeUrl),
})

if (!instagramUrl && !youtubeUrl) {
  console.error('No DATABASE_URL_* set')
  process.exit(1)
}

async function test(url, name) {
  if (!url?.startsWith('postgres')) return
  const cleanUrl = url.replace(/\?.*$/, '')
  const pool = new Pool({ connectionString: cleanUrl, ssl: { rejectUnauthorized: false } })
  try {
    const res = await pool.query('SELECT 1 as ok')
    console.log(name, 'connect:', res.rows[0].ok === 1 ? 'OK' : 'fail')
    const tbl = await pool.query(`SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'videos') as exists`)
    console.log(name, 'table public.videos:', tbl.rows[0].exists ? 'YES' : 'NO')
    if (tbl.rows[0].exists) {
      const count = await pool.query('SELECT COUNT(*) as c FROM public.videos')
      console.log(name, 'row count:', count.rows[0].c)
    }
  } catch (e) {
    console.error(name, 'error:', e.message)
  } finally {
    await pool.end()
  }
}

await test(instagramUrl, 'Instagram')
await test(youtubeUrl, 'YouTube')
console.log('Done')
