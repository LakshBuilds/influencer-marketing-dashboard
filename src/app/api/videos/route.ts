import { NextRequest, NextResponse } from 'next/server'
import {
  fetchInstagramFromSupabase,
  fetchInstagramWeeklyViewsDeltaFromSnapshots,
  fetchYouTubeFromSupabase,
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

    for (const [platform, list] of byPlatform.entries()) {
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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const creatorName = searchParams.get('creatorName') ?? undefined
  const dateFrom = searchParams.get('dateFrom') ?? undefined
  const dateTo = searchParams.get('dateTo') ?? undefined

  const [youtubeVideos, instagramVideos, instagramWeeklyDelta] = await Promise.all([
    fetchYouTubeFromSupabase({
      creatorName,
      dateFrom,
      dateTo,
    }),
    fetchInstagramFromSupabase({
      creatorName,
      dateFrom,
      dateTo,
    }),
    fetchInstagramWeeklyViewsDeltaFromSnapshots(),
  ])

  const combined = [...youtubeVideos, ...instagramVideos].sort((a, b) => {
    const da = a.posted_at ? new Date(a.posted_at).getTime() : 0
    const db = b.posted_at ? new Date(b.posted_at).getTime() : 0
    return db - da
  })

  const withWeeklyDelta = applyWeeklySnapshotDelta(combined)
  const instagramRows = withWeeklyDelta.filter((v) => v.platform === 'instagram')
  for (const row of instagramRows) row.weekly_views = 0
  if (instagramRows.length > 0) {
    instagramRows[0].weekly_views = instagramWeeklyDelta
  }

  return NextResponse.json(withWeeklyDelta)
}

