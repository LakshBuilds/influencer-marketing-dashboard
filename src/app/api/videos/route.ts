import { NextRequest, NextResponse } from 'next/server'
import { supabaseInstagram, supabaseYouTube } from '@/lib/supabase'
import {
  fetchYouTubeFromSupabase,
  fetchInstagramFromSupabase,
} from '@/lib/supabase-fetch'
import {
  fetchVideosFromDb,
  fetchYouTubeFromDb,
  fetchInstagramFromDb,
} from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const creatorName = searchParams.get('creatorName') ?? undefined
    const dateFrom = searchParams.get('dateFrom') ?? undefined
    const dateTo = searchParams.get('dateTo') ?? undefined
    const filters = { creatorName, dateFrom, dateTo }

    const useDbYouTube = Boolean(process.env.DATABASE_URL_YOUTUBE)
    const useDbInstagram = Boolean(process.env.DATABASE_URL_INSTAGRAM)
    const useSupabaseYouTube = Boolean(supabaseYouTube)
    const useSupabaseInstagram = Boolean(supabaseInstagram)

    let youtubeVideos: Awaited<ReturnType<typeof fetchYouTubeFromDb>> = []
    let instagramVideos: Awaited<ReturnType<typeof fetchInstagramFromDb>> = []

    if (useDbYouTube) {
      try {
        youtubeVideos = await fetchYouTubeFromDb(filters)
      } catch (e) {
        console.error('[api/videos] YouTube DB error:', e)
      }
    } else if (useSupabaseYouTube) {
      try {
        youtubeVideos = await fetchYouTubeFromSupabase(filters)
      } catch (e) {
        console.error('[api/videos] YouTube Supabase error:', e)
      }
    }

    if (useDbInstagram) {
      try {
        instagramVideos = await fetchInstagramFromDb(filters)
      } catch (e) {
        console.error('[api/videos] Instagram DB error:', e)
      }
    } else if (useSupabaseInstagram) {
      try {
        instagramVideos = await fetchInstagramFromSupabase(filters)
      } catch (e) {
        console.error('[api/videos] Instagram Supabase error:', e)
      }
    }

    if (!useDbYouTube && !useSupabaseYouTube && !useDbInstagram && !useSupabaseInstagram) {
      const videos = await fetchVideosFromDb(filters)
      return NextResponse.json(videos)
    }

    const combined = [...youtubeVideos, ...instagramVideos].sort((a, b) => {
      const da = a.posted_at ? new Date(a.posted_at).getTime() : 0
      const db = b.posted_at ? new Date(b.posted_at).getTime() : 0
      return db - da
    })
    return NextResponse.json(combined)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to fetch videos'
    console.error('[api/videos]', e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
