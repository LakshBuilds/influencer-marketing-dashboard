import type { Video } from '@/types/database'

export function mapReelsRow(row: Record<string, unknown>): Video {
  const views = Number(row.videoplaycount ?? row.videoviewcount ?? 0)

  const payoutRaw = row.payout
  const payout =
    typeof payoutRaw === 'number' ? payoutRaw : Number(payoutRaw ?? 0) || 0

  const dateRaw =
    row.created_at ??
    row.takenat ??
    row.timestamp ??
    row.publishedtime

  const postedAt = dateRaw
    ? new Date(String(dateRaw)).toISOString()
    : ''

  const videoUrl = String(row.videourl ?? row.displayurl ?? row.url ?? '')

  return {
    id: String(row.id ?? ''),
    platform: 'instagram',
    video_url: videoUrl,
    views,
    weekly_views: views,
    payout,
    employee_name: String(row.created_by_name ?? ''),
    employee_email: String(row.created_by_email ?? ''),
    creator_name: String(row.ownerfullname ?? row.ownerusername ?? ''),
    posted_at: postedAt,
  }
}

export function mapYouTubeRow(row: Record<string, unknown>): Video {
  const views = Number(row.view_count ?? 0)

  const payoutRaw = row.payout
  const payout =
    typeof payoutRaw === 'number' ? payoutRaw : Number(payoutRaw ?? 0) || 0

  const postedAt = row.published_at
    ? new Date(String(row.published_at)).toISOString()
    : ''

  const videoUrl = String(row.video_url ?? '')

  return {
    id: String(row.id ?? ''),
    platform: 'youtube',
    video_url: videoUrl,
    views,
    weekly_views: views,
    payout,
    employee_name: String(row.created_by_name ?? ''),
    employee_email: String(row.created_by_email ?? ''),
    creator_name: String(row.channel_name ?? ''),
    posted_at: postedAt,
  }
}
