import { NextResponse } from 'next/server'
import { isSupabaseConfigured, isInstagramConfigured, isYouTubeConfigured } from '@/lib/supabase'
import { getPools } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const dbInstagram = Boolean(process.env.DATABASE_URL_INSTAGRAM)
  const dbYouTube = Boolean(process.env.DATABASE_URL_YOUTUBE)
  const { poolInstagram, poolYouTube } = getPools()
  return NextResponse.json({
    ok: isSupabaseConfigured || dbInstagram || dbYouTube,
    supabase: {
      configured: isSupabaseConfigured,
      instagram: isInstagramConfigured,
      youtube: isYouTubeConfigured,
    },
    database: {
      instagram: Boolean(poolInstagram),
      youtube: Boolean(poolYouTube),
    },
  })
}
