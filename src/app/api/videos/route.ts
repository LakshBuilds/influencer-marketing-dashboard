import { NextRequest, NextResponse } from 'next/server'
import {
  fetchInstagramFromSupabase,
  fetchInstagramWeeklyViewsDeltaFromSnapshots,
  fetchYouTubeFromSupabase,
  fetchYouTubeWeeklyViewsDeltaFromSnapshots,
} from '@/lib/supabase-fetch'
import type { Video } from '@/types/database'

function toMs(value: string): number {
  const t = value ? new Date(value).getTime() : 0
  return Number.isFinite(t) ? t : 0
}

/**
 * Weekly views = latest snapshot views - previous snapshot views
 * per platform + video key. Only latest snapshot carries weekly delta.
 */
function applyWeeklySnapshotDelta(videos: Video[]): Video[] {
  const byVideo = new Map<string, Video[]>()
  let hasAnyDelta = false

  for (const video of videos) {
    const key = `${video.platform}::${video.video_url || video.id}`
    const list = byVideo.get(key) ?? []
    list.push(video)
    byVideo.set(key, list)
  }

  for (const list of Array.from(byVideo.values())) {
    list.sort((a, b) => toMs(b.posted_at) - toMs(a.posted_at))

    for (let i = 0; i < list.length; i++) {
      const current = list[i]
      if (i === 0 && list.length > 1) {
        const previous = list[i + 1]
        current.weekly_views = Math.max((current.views ?? 0) - (previous.views ?? 0), 0)
        if ((current.weekly_views ?? 0) > 0) {
          hasAnyDelta = true
        }
      } else {
        current.weekly_views = 0
      }
    }
  }

  // Fallback: if per-video history isn't available, use platform-level
  // latest snapshot total minus previous snapshot total.
  if (!hasAnyDelta) {
    const byPlatform = new Map<string, Video[]>()
    for (const v of videos) {
      const list = byPlatform.get(v.platform) ?? []
      list.push(v)
      byPlatform.set(v.platform, list)
      v.weekly_views = 0
    }

    for (const [platform, list] of Array.from(byPlatform.entries())) {
      const totalsByDay = new Map<string, number>()
      for (const v of list) {
        const day = v.posted_at ? v.posted_at.slice(0, 10) : ''
        if (!day) continue
        totalsByDay.set(day, (totalsByDay.get(day) ?? 0) + (v.views ?? 0))
      }
      const snapshotDays = Array.from(totalsByDay.keys()).sort((a, b) =>
        b.localeCompare(a)
      )
      if (snapshotDays.length < 2) continue

      const latestTotal = totalsByDay.get(snapshotDays[0]) ?? 0
      const previousTotal = totalsByDay.get(snapshotDays[1]) ?? 0
      const platformDelta = Math.max(latestTotal - previousTotal, 0)

      const first = videos.find((v) => v.platform === platform)
      if (first) first.weekly_views = platformDelta
    }
  }

  return videos
}

export const dynamic = 'force-dynamic'

// Per-source failures should not blank the dashboard. Return whatever data we
// got, and surface the failed-source error messages alongside it so the client
// can show a banner instead of crashing on an empty 500 body.
async function settle<T>(
  label: string,
  p: Promise<T>,
  fallback: T,
  errors: string[]
): Promise<T> {
  try {
    return await p
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error(`[api/videos] ${label} failed:`, msg)
    errors.push(`${label}: ${msg}`)
    return fallback
  }
}

export async function GET(req: NextRequest) {
  try {
  const { searchParams } = new URL(req.url)

  const creatorName = searchParams.get('creatorName') ?? undefined
  const dateFrom = searchParams.get('dateFrom') ?? undefined
  const dateTo = searchParams.get('dateTo') ?? undefined

  const errors: string[] = []

  // Wrap each fetch with a hard 20s timeout so a dead upstream
  // (e.g. paused Supabase project) never causes a silent 500.
  function withTimeout<T>(p: Promise<T>, fallback: T, ms = 20000): Promise<T> {
    return Promise.race([
      p,
      new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
    ])
  }

  const [youtubeVideos, instagramVideos, instagramWeeklyDelta, youtubeWeeklyDelta] = await Promise.all([
    settle('youtube videos', withTimeout(fetchYouTubeFromSupabase({ creatorName, dateFrom, dateTo }), [] as Video[]), [] as Video[], errors),
    settle('instagram videos', withTimeout(fetchInstagramFromSupabase({ creatorName, dateFrom, dateTo }), [] as Video[]), [] as Video[], errors),
    settle('instagram weekly snapshots', withTimeout(fetchInstagramWeeklyViewsDeltaFromSnapshots(), 0), 0, errors),
    settle('youtube weekly snapshots', withTimeout(fetchYouTubeWeeklyViewsDeltaFromSnapshots(), 0), 0, errors),
  ])

  const combined = [...youtubeVideos, ...instagramVideos].sort((a, b) => {
    const da = a.posted_at ? new Date(a.posted_at).getTime() : 0
    const db = b.posted_at ? new Date(b.posted_at).getTime() : 0
    return db - da
  })

  const withWeeklyDelta = applyWeeklySnapshotDelta(combined)

  return NextResponse.json({
    videos: withWeeklyDelta,
    snapshots: {
      instagram: instagramWeeklyDelta,
      youtube: youtubeWeeklyDelta,
    },
    error: errors.length ? errors.join('; ') : undefined,
  })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[api/videos] unhandled error:', msg)
    return NextResponse.json({ error: msg, videos: [], snapshots: { instagram: 0, youtube: 0 } }, { status: 500 })
  }
}

