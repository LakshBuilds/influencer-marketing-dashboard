import type { Video } from '@/types/database'

export function mapReelsRow(row: Record<string, unknown>): Video {
  const views = Number(row.videoviewcount ?? row.videoplaycount ?? 0)

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
    employee_name: String(row.created_by_name ?? row.created_by_email ?? ''),
    creator_name: String(row.ownerfullname ?? row.ownerusername ?? ''),
    posted_at: postedAt,
  }
}
