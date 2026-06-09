import type { Video } from '@/types/database'

/**
 * Canonical email aliases — any key maps to its value.
 * Add new aliases here whenever the same person uses multiple email variants.
 */
const EMAIL_ALIASES: Record<string, string> = {
  'gurnimarjit@buyhatke.com': 'gurnimar@buyhatke.com',
  'gurmar@buyhatke.com':      'gurnimar@buyhatke.com',
  'yash@buyhatke.com':        'yashmadaan@buyhatke.com',
}

/**
 * Canonical display names — keyed by canonical email.
 * After email normalisation, use this to get the consistent display name.
 */
const EMAIL_TO_NAME: Record<string, string> = {
  'gurnimar@buyhatke.com':    'Gurnimar',
  'yashmadaan@buyhatke.com':  'Yash Madaan',
}

function normaliseEmail(raw: unknown): string {
  const email = String(raw ?? '').trim().toLowerCase()
  return EMAIL_ALIASES[email] ?? email
}

function normaliseName(rawName: unknown, canonicalEmail: string): string {
  return EMAIL_TO_NAME[canonicalEmail] ?? String(rawName ?? '')
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

  const email = normaliseEmail(row.created_by_email)
  return {
    id: String(row.id ?? ''),
    platform: 'instagram',
    video_url: videoUrl,
    views,
    weekly_views: views,
    payout,
    employee_name: normaliseName(row.created_by_name, email),
    employee_email: email,
    creator_name: String(row.ownerfullname ?? row.ownerusername ?? ''),
    posted_at: postedAt,
  }
}

export function mapYouTubeRow(row: Record<string, unknown>): Video {
  // YouTube table columns: view_count, channel_name, video_url, published_at, payout, created_by_name, created_by_email
  const views = Number(row.view_count ?? row.viewcount ?? 0)

  const payoutRaw = row.payout
  const payout =
    typeof payoutRaw === 'number' ? payoutRaw : Number(payoutRaw ?? 0) || 0

  const dateRaw = row.published_at ?? row.publishedat
  const postedAt = dateRaw
    ? new Date(String(dateRaw)).toISOString()
    : ''

  const videoUrl = String(row.video_url ?? row.videourl ?? '')

  const email = normaliseEmail(row.created_by_email)
  return {
    id: String(row.id ?? ''),
    platform: 'youtube',
    video_url: videoUrl,
    views,
    weekly_views: views,
    payout,
    employee_name: normaliseName(row.created_by_name, email),
    employee_email: email,
    creator_name: String(row.channel_name ?? row.channelname ?? ''),
    posted_at: postedAt,
  }
}
