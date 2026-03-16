/**
 * Read-only access to Supabase PostgreSQL.
 * YouTube: public.videos | Instagram: public.reels
 */
import { Pool } from 'pg'
import type { Video } from '@/types/database'
import { mapYouTubeRow, mapReelsRow } from './map-rows'

function poolFromUrl(url: string | undefined): Pool | null {
  if (!url?.startsWith('postgres')) return null
  return new Pool({
    connectionString: url.replace(/\?.*$/, ''),
    ssl: { rejectUnauthorized: false },
  })
}

let _poolInstagram: Pool | null = null
let _poolYouTube: Pool | null = null

export function getPools() {
  if (_poolInstagram === null && _poolYouTube === null) {
    const i = process.env.DATABASE_URL_INSTAGRAM
    const y = process.env.DATABASE_URL_YOUTUBE
    _poolInstagram = poolFromUrl(i ?? undefined)
    _poolYouTube = poolFromUrl(y ?? undefined)
  }
  return { poolInstagram: _poolInstagram, poolYouTube: _poolYouTube }
}

export const isConfigured = Boolean(
  process.env.DATABASE_URL_INSTAGRAM || process.env.DATABASE_URL_YOUTUBE
)

interface Filters {
  creatorName?: string
  dateFrom?: string
  dateTo?: string
}

/** YouTube: public.videos — channel_name, published_at, view_count, payout, etc. */
async function queryYouTube(
  pool: Pool,
  filters: Filters
): Promise<Video[]> {
  const conditions: string[] = []
  const params: unknown[] = []
  let i = 1
  if (filters.creatorName) {
    conditions.push(`channel_name ILIKE $${i}`)
    params.push(`%${filters.creatorName}%`)
    i++
  }
  if (filters.dateFrom) {
    conditions.push(`published_at >= $${i}::timestamptz`)
    params.push(filters.dateFrom)
    i++
  }
  if (filters.dateTo) {
    conditions.push(`published_at <= $${i}::timestamptz`)
    params.push(filters.dateTo)
    i++
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const sql = `SELECT id, video_url, view_count, payout, channel_name, created_by_name, created_by_email, published_at FROM public.videos ${where} ORDER BY published_at DESC NULLS LAST`
  const client = await pool.connect()
  try {
    const res = await client.query(sql, params)
    return (res.rows as Record<string, unknown>[]).map(mapYouTubeRow)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.includes('does not exist') || msg.includes('relation')) return []
    throw e
  } finally {
    client.release()
  }
}

/** Instagram: public.reels — ownerusername, ownerfullname, takenat, videoviewcount, payout, etc. */
async function queryReels(pool: Pool, filters: Filters): Promise<Video[]> {
  const conditions: string[] = []
  const params: unknown[] = []
  let i = 1
  if (filters.creatorName) {
    conditions.push(`(ownerfullname ILIKE $${i} OR ownerusername ILIKE $${i})`)
    params.push(`%${filters.creatorName}%`)
    i++
  }
  if (filters.dateFrom) {
    conditions.push(`created_at >= $${i}::timestamptz`)
    params.push(filters.dateFrom)
    i++
  }
  if (filters.dateTo) {
    conditions.push(`created_at <= $${i}::timestamptz`)
    params.push(filters.dateTo)
    i++
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const sql = `SELECT id, videourl, displayurl, url, videoviewcount, videoplaycount, payout, ownerusername, ownerfullname, created_by_name, created_by_email, takenat, timestamp, publishedtime, created_at FROM public.reels ${where} ORDER BY created_at DESC NULLS LAST, takenat DESC NULLS LAST`
  const client = await pool.connect()
  try {
    const res = await client.query(sql, params)
    return (res.rows as Record<string, unknown>[]).map(mapReelsRow)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.includes('does not exist') || msg.includes('relation')) return []
    throw e
  } finally {
    client.release()
  }
}

/** Fetch only YouTube videos from PostgreSQL */
export async function fetchYouTubeFromDb(filters: Filters = {}): Promise<Video[]> {
  const { poolYouTube } = getPools()
  if (!poolYouTube) return []
  try {
    return await queryYouTube(poolYouTube, filters)
  } catch (e) {
    console.error('[db] YouTube failed:', e instanceof Error ? e.message : e)
    throw e
  }
}

/** Fetch only Instagram reels from PostgreSQL */
export async function fetchInstagramFromDb(filters: Filters = {}): Promise<Video[]> {
  const { poolInstagram } = getPools()
  if (!poolInstagram) return []
  try {
    return await queryReels(poolInstagram, filters)
  } catch (e) {
    console.error('[db] Instagram failed:', e instanceof Error ? e.message : e)
    throw e
  }
}

export async function fetchVideosFromDb(filters: Filters = {}): Promise<Video[]> {
  const { poolInstagram, poolYouTube } = getPools()
  if (!poolInstagram && !poolYouTube) {
    throw new Error('No database configured. Set DATABASE_URL_INSTAGRAM and/or DATABASE_URL_YOUTUBE in .env.local')
  }
  const results = await Promise.allSettled([
    poolYouTube ? queryYouTube(poolYouTube, filters) : Promise.resolve([]),
    poolInstagram ? queryReels(poolInstagram, filters) : Promise.resolve([]),
  ])
  const combined: Video[] = []
  if (results[0].status === 'fulfilled') combined.push(...results[0].value)
  else if (poolYouTube) console.error('[db] YouTube failed:', results[0].reason?.message ?? results[0].reason)
  if (results[1].status === 'fulfilled') combined.push(...results[1].value)
  else if (poolInstagram) console.error('[db] Instagram failed:', results[1].reason?.message ?? results[1].reason)
  combined.sort((a, b) => {
    const da = a.posted_at ? new Date(a.posted_at).getTime() : 0
    const db = b.posted_at ? new Date(b.posted_at).getTime() : 0
    return db - da
  })
  return combined
}
