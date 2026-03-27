import { NextRequest, NextResponse } from 'next/server'
import {
  fetchInstagramFromSupabase,
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
      } else {
        current.weekly_views = 0
      }
    }
  }

  return videos
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const creatorName = searchParams.get('creatorName') ?? undefined
  const dateFrom = searchParams.get('dateFrom') ?? undefined
  const dateTo = searchParams.get('dateTo') ?? undefined

  const [youtubeVideos, instagramVideos] = await Promise.all([
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
  ])

  const combined = [...youtubeVideos, ...instagramVideos].sort((a, b) => {
    const da = a.posted_at ? new Date(a.posted_at).getTime() : 0
    const db = b.posted_at ? new Date(b.posted_at).getTime() : 0
    return db - da
  })

  const withWeeklyDelta = applyWeeklySnapshotDelta(combined)

  return NextResponse.json(withWeeklyDelta)
}

