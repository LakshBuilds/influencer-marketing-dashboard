import { supabaseInstagram, supabaseYouTube } from './supabase'
import type { Video } from '@/types/database'
import { mapReelsRow, mapYouTubeRow } from './map-rows'

interface Filters {
  creatorName?: string
  dateFrom?: string
  dateTo?: string
}

export async function fetchInstagramFromSupabase(
  filters: Filters = {}
): Promise<Video[]> {
  if (!supabaseInstagram) return []

  const pageSize = 1000
  const allRows: Record<string, unknown>[] = []

  // Supabase caps responses at 1000 rows per request.
  // Paginate with range() to fetch all matching reels.
  for (let from = 0; ; from += pageSize) {
    let q = supabaseInstagram
      .from('reels')
      .select(`
        id,
        videourl,
        displayurl,
        url,
        videoviewcount,
        videoplaycount,
        payout,
        ownerusername,
        ownerfullname,
        created_by_name,
        created_by_email,
        takenat,
        timestamp,
        publishedtime,
        created_at
      `)
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

    const to = from + pageSize - 1
    const { data, error } = await q.range(from, to)
    if (error) throw error

    const batch = (data ?? []) as Record<string, unknown>[]
    allRows.push(...batch)

    if (batch.length < pageSize) {
      break
    }
  }

  return allRows.map((row) => mapReelsRow(row))
}

export async function fetchYouTubeFromSupabase(
  filters: Filters = {}
): Promise<Video[]> {
  if (!supabaseYouTube) return []

  const pageSize = 1000
  const allRows: Record<string, unknown>[] = []

  for (let from = 0; ; from += pageSize) {
    let q = supabaseYouTube
      .from('videos')
      .select(`
        id,
        video_url,
        view_count,
        payout,
        channel_name,
        created_by_name,
        created_by_email,
        published_at
      `)
      .order('published_at', { ascending: false })

    if (filters.creatorName) {
      const term = filters.creatorName.replace(/'/g, "''")
      q = q.ilike('channel_name', `%${term}%`)
    }
    if (filters.dateFrom) {
      q = q.gte('published_at', filters.dateFrom)
    }
    if (filters.dateTo) {
      q = q.lte('published_at', filters.dateTo)
    }

    const to = from + pageSize - 1
    const { data, error } = await q.range(from, to)
    if (error) throw error

    const batch = (data ?? []) as Record<string, unknown>[]
    allRows.push(...batch)

    if (batch.length < pageSize) {
      break
    }
  }

  return allRows.map((row) => mapYouTubeRow(row))
}

export async function fetchInstagramWeeklyViewsDeltaFromSnapshots(): Promise<number> {
  if (!supabaseInstagram) return 0

  const { data, error } = await supabaseInstagram
    .from('weekly_snapshots')
    .select('week_start_date,total_views')
    .order('week_start_date', { ascending: false })
    .limit(2)

  if (error) throw error

  const rows = (data ?? []) as Array<{ total_views?: number | string | null }>
  if (rows.length < 2) return 0

  const latest = Number(rows[0]?.total_views ?? 0)
  const previous = Number(rows[1]?.total_views ?? 0)
  return Math.max(latest - previous, 0)
}

export async function fetchYouTubeWeeklyViewsDeltaFromSnapshots(): Promise<number> {
  if (!supabaseYouTube) return 0

  const { data, error } = await supabaseYouTube
    .from('weekly_snapshots')
    .select('week_start_date,total_views')
    .order('week_start_date', { ascending: false })
    .limit(2)

  if (error) throw error

  const rows = (data ?? []) as Array<{ total_views?: number | string | null }>
  if (rows.length < 2) return 0

  const latest = Number(rows[0]?.total_views ?? 0)
  const previous = Number(rows[1]?.total_views ?? 0)
  return Math.max(latest - previous, 0)
}
