import { supabaseInstagram, supabaseYouTube } from './supabase'
import type { Video } from '@/types/database'
import { mapReelsRow } from './map-rows'

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
  _filters: Filters = {}
): Promise<Video[]> {
  // TODO: Re-implement YouTube fetch logic as needed.
  if (!supabaseYouTube) return []
  return []
}

