import { NextRequest, NextResponse } from 'next/server'
import {
  fetchInstagramFromSupabase,
  fetchYouTubeFromSupabase,
} from '@/lib/supabase-fetch'

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

  return NextResponse.json(combined)
}

