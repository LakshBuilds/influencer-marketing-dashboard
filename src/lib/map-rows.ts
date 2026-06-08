import type { Video } from '@/types/database'

/**
 * Canonical email aliases — any key maps to its value.
 * Add new aliases here whenever the same person uses multiple email variants.
 */
const EMAIL_ALIASES: Record<string, string> = {
  'gurnimarjit@buyhatke.com': 'gurnimar@buyhatke.com',
  'gurmar@buyhatke.com':      'gurnimar@buyhatke.com',
  // add more as needed: 'alias@buyhatke.com': 'canonical@buyhatke.com'
}

function normaliseEmail(raw: unknown): string {
  const email = String(raw ?? '').trim().toLowerCase()
  return EMAIL_ALIASES[email] ?? email
}

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
    employee_email: normaliseEmail(row.created_by_email),
    creator_name: String(row.ownerfullname ?? row.ownerusername ?? ''),
    posted_at: postedAt,
  }
}

export function mapYouTubeRow(row: Record<string, unknown>): Video {
  // YouTube table columns: viewcount, channelname, videourl, publishedat, payout, created_by_name, created_by_email
  const views = Number(row.viewcount ?? row.view_count ?? 0)

  const payoutRaw = row.payout
  const payout =
    typeof payoutRaw === 'number' ? payoutRaw : Number(payoutRaw ?? 0) || 0

  const postedAt = row.publishedat ?? row.published_at
    ? new Date(String(row.publishedat ?? row.published_at)).toISOString()
    : ''

  const videoUrl = String(row.videourl ?? row.video_url ?? '')

  return {
    id: String(row.id ?? ''),
    platform: 'youtube',
    video_url: videoUrl,
    views,
    weekly_views: views,
    payout,
    employee_name: String(row.created_by_name ?? ''),
    employee_email: normaliseEmail(row.created_by_email),
    creator_name: String(row.channelname ?? row.channel_name ?? ''),
    posted_at: postedAt,
  }
}
