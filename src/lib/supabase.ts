import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Instagram project — use SUPABASE_* (server) or NEXT_PUBLIC_* (client)
const instagramUrl = process.env.SUPABASE_URL_INSTAGRAM ?? process.env.NEXT_PUBLIC_SUPABASE_URL_INSTAGRAM ?? 'https://xzutldcwrlrfkzkqtjyn.supabase.co'
const instagramAnonKey = process.env.SUPABASE_ANON_KEY_INSTAGRAM ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_INSTAGRAM ?? ''

// YouTube project
const youtubeUrl = process.env.SUPABASE_URL_YOUTUBE ?? process.env.NEXT_PUBLIC_SUPABASE_URL_YOUTUBE ?? 'https://khksexwjcberpartxvom.supabase.co'
const youtubeAnonKey = process.env.SUPABASE_ANON_KEY_YOUTUBE ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_YOUTUBE ?? ''

export const isInstagramConfigured = Boolean(instagramAnonKey)
export const isYouTubeConfigured = Boolean(youtubeAnonKey)
export const isSupabaseConfigured = isInstagramConfigured || isYouTubeConfigured

export const supabaseInstagram: SupabaseClient<Database> | null = isInstagramConfigured
  ? createClient<Database>(instagramUrl, instagramAnonKey)
  : null

export const supabaseYouTube: SupabaseClient<Database> | null = isYouTubeConfigured
  ? createClient<Database>(youtubeUrl, youtubeAnonKey)
  : null

/** Single client for backwards compatibility; uses Instagram if available. */
export const supabase = supabaseInstagram ?? supabaseYouTube
