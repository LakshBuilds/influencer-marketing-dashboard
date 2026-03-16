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

  const { data, error } = await q.range(0, 1999)
  if (error) throw error

  return ((data ?? []) as Record<string, unknown>[]).map((row) =>
    mapReelsRow(row)
  )
}

export async function fetchYouTubeFromSupabase(): Promise<Video[]> {
  // TODO: Re-implement YouTube fetch logic as needed.
  if (!supabaseYouTube) return []
  return []
}

