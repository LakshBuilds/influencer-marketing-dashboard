import { NextRequest, NextResponse } from 'next/server'
import { fetchYouTubeFromDb, fetchInstagramFromDb } from '@/lib/db'
import {
  fetchYouTubeFromSupabase,
  fetchInstagramFromSupabase,
} from '@/lib/supabase-fetch'
import { supabaseYouTube, supabaseInstagram } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const creatorName = searchParams.get('creatorName') ?? undefined
  const dateFrom = searchParams.get('dateFrom') ?? undefined
  const dateTo = searchParams.get('dateTo') ?? undefined
  const filters = { creatorName, dateFrom, dateTo }

  const result: any = {
    env: {
      DATABASE_URL_YOUTUBE: Boolean(process.env.DATABASE_URL_YOUTUBE),
      DATABASE_URL_INSTAGRAM: Boolean(process.env.DATABASE_URL_INSTAGRAM),
      SUPABASE_URL_YOUTUBE: Boolean(process.env.SUPABASE_URL_YOUTUBE),
      SUPABASE_URL_INSTAGRAM: Boolean(process.env.SUPABASE_URL_INSTAGRAM),
    },
    youtube: {
      db: { ok: false, count: 0, error: null as string | null },
      supabase: { ok: false, count: 0, error: null as string | null },
    },
    instagram: {
      db: { ok: false, count: 0, error: null as string | null },
      supabase: { ok: false, count: 0, error: null as string | null },
    },
  }

  // YouTube via PostgreSQL
  try {
    const rows = await fetchYouTubeFromDb(filters)
    result.youtube.db.ok = true
    result.youtube.db.count = rows.length
  } catch (e) {
    result.youtube.db.error = e instanceof Error ? e.message : String(e)
  }

  // Instagram via PostgreSQL
  try {
    const rows = await fetchInstagramFromDb(filters)
    result.instagram.db.ok = true
    result.instagram.db.count = rows.length
  } catch (e) {
    result.instagram.db.error = e instanceof Error ? e.message : String(e)
  }

  // YouTube via Supabase
  if (supabaseYouTube) {
    try {
      const rows = await fetchYouTubeFromSupabase(filters)
      result.youtube.supabase.ok = true
      result.youtube.supabase.count = rows.length
    } catch (e) {
      result.youtube.supabase.error = e instanceof Error ? e.message : String(e)
    }
  }

  // Instagram via Supabase
  if (supabaseInstagram) {
    try {
      const rows = await fetchInstagramFromSupabase(filters)
      result.instagram.supabase.ok = true
      result.instagram.supabase.count = rows.length
    } catch (e) {
      result.instagram.supabase.error = e instanceof Error ? e.message : String(e)
    }
  }

  return NextResponse.json(result)
}

