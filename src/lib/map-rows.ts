import type { Video } from '@/types/database'

/** Map YouTube public.videos row to dashboard Video */
export function mapYouTubeRow(row: Record<string, unknown>): Video {
  const published = row.published_at
  const postedAt = published
    ? new Date(published as string | number).toISOString()
    : ''
  return {
    id: String(row.id ?? ''),
    platform: 'youtube',
    video_url: String(row.video_url ?? ''),
    views: Number(row.view_count ?? 0),
    weekly_views: 0,
    payout: Number(row.payout ?? 0),
    employee_name: String(row.created_by_name ?? row.created_by_email ?? ''),
    creator_name: String(row.channel_name ?? ''),
    posted_at: postedAt,
  }
}

/** Map Instagram public.reels row to dashboard Video */
export function mapReelsRow(row: Record<string, unknown>): Video {
  const views = Number(row.videoviewcount ?? row.videoplaycount ?? 0)
  const payoutRaw = row.payout
  const payout = typeof payoutRaw === 'number' ? payoutRaw : Number(payoutRaw ?? 0) || 0
  const dateRaw = row.takenat ?? row.timestamp ?? row.publishedtime ?? row.created_at
  const postedAt = dateRaw
    ? new Date(dateRaw as string | number).toISOString()
    : ''
  const videoUrl = String(row.videourl ?? row.displayurl ?? row.url ?? '')
  return {
    id: String(row.id ?? ''),
    platform: 'instagram',
    video_url: videoUrl,
    views,
    weekly_views: views,
    payout,
    employee_name: String(row.created_by_name ?? row.created_by_email ?? ''),
    creator_name: String(row.ownerfullname ?? row.ownerusername ?? ''),
    posted_at: postedAt,
  }
}
