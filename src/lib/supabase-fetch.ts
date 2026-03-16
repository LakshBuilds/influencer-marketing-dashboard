import { supabaseInstagram, supabaseYouTube } from './supabase'
import type { Video } from '@/types/database'
import { mapYouTubeRow, mapReelsRow } from './map-rows'

interface Filters {
  creatorName?: string
  dateFrom?: string
  dateTo?: string
}

/** YouTube: public.videos — select and filter by channel_name, published_at */
export async function fetchYouTubeFromSupabase(filters: Filters = {}): Promise<Video[]> {
  if (!supabaseYouTube) return []
  let q = supabaseYouTube
    .from('videos')
    .select('id, video_url, view_count, payout, channel_name, created_by_name, created_by_email, published_at')
    .order('published_at', { ascending: false })
  if (filters.creatorName) {
    q = q.ilike('channel_name', `%${filters.creatorName}%`)
  }
  if (filters.dateFrom) {
    q = q.gte('published_at', filters.dateFrom)
  }
  if (filters.dateTo) {
    q = q.lte('published_at', filters.dateTo)
  }
  const { data, error } = await q
  if (error) throw error
  return ((data ?? []) as Record<string, unknown>[]).map(mapYouTubeRow)
}

/** Instagram: public.reels — select and filter by ownerfullname/ownerusername, created_at */
export async function fetchInstagramFromSupabase(filters: Filters = {}): Promise<Video[]> {
  if (!supabaseInstagram) return []
  let q = supabaseInstagram
    .from('reels')
    .select('id, videourl, displayurl, url, videoviewcount, videoplaycount, payout, ownerusername, ownerfullname, created_by_name, created_by_email, takenat, timestamp, publishedtime, created_at')
    .order('created_at', { ascending: false })
  if (filters.creatorName) {
    const term = filters.creatorName.replace(/'/g, "''")
    q = q.or(`ownerfullname.ilike.%${term}%,ownerusername.ilike.%${term}%`)
  }
  if (filters.dateFrom) {
    q = q.gte('created_at', filters.dateFrom)
  }
  if (filters.dateTo) {
    q = q.lte('created_at', filters.dateTo)
  }
  const { data, error } = await q
  if (error) throw error
  return ((data ?? []) as Record<string, unknown>[]).map(mapReelsRow)
}

export async function fetchVideosFromSupabase(filters: Filters = {}): Promise<Video[]> {
  const tasks: Promise<Video[]>[] = []
  if (supabaseYouTube) tasks.push(fetchYouTubeFromSupabase(filters))
  if (supabaseInstagram) tasks.push(fetchInstagramFromSupabase(filters))

  if (tasks.length === 0) {
    throw new Error('Supabase not configured. Add API keys for Instagram and/or YouTube in .env.local')
  }

  const results = await Promise.allSettled(tasks)
  const combined: Video[] = []
  const names = [supabaseYouTube && 'youtube', supabaseInstagram && 'instagram'].filter(Boolean) as string[]
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') combined.push(...r.value)
    else console.error(`[supabase] ${names[i]} failed:`, r.reason?.message ?? r.reason)
  })

  combined.sort((a, b) => {
    const da = a.posted_at ? new Date(a.posted_at).getTime() : 0
    const db = b.posted_at ? new Date(b.posted_at).getTime() : 0
    return db - da
  })
  return combined
}
