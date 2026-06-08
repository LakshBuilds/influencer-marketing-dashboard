import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Instagram project — use SUPABASE_* (server) or NEXT_PUBLIC_* (client)
const instagramUrl = process.env.SUPABASE_URL_INSTAGRAM ?? process.env.NEXT_PUBLIC_SUPABASE_URL_INSTAGRAM ?? 'https://xzutldcwrlrfkzkqtjyn.supabase.co'
const instagramAnonKey = process.env.SUPABASE_ANON_KEY_INSTAGRAM ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_INSTAGRAM ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6dXRsZGN3cmxyZmt6a3F0anluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2Mjg3MDUsImV4cCI6MjA3OTIwNDcwNX0.mRSVdOGhkqC-Gz1teYKWYDUDqjKZYca66rSkV-oW3fk'

// YouTube project — only enable if explicitly configured via env vars
// (the default project khksexwjcberpartxvom is paused, causing DNS timeouts)
const youtubeUrl = process.env.SUPABASE_URL_YOUTUBE ?? process.env.NEXT_PUBLIC_SUPABASE_URL_YOUTUBE ?? ''
const youtubeAnonKey = process.env.SUPABASE_ANON_KEY_YOUTUBE ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_YOUTUBE ?? ''

export const isInstagramConfigured = Boolean(instagramAnonKey)
export const isYouTubeConfigured = Boolean(youtubeAnonKey)
export const isSupabaseConfigured = isInstagramConfigured || isYouTubeConfigured

export const supabaseInstagram: SupabaseClient<Database> | null = isInstagramConfigured
  ? createClient<Database>(instagramUrl, instagramAnonKey, {
      global: { fetch: (url, opts) => fetch(url, { ...opts, signal: AbortSignal.timeout(25000) }) }
    })
  : null

export const supabaseYouTube: SupabaseClient<Database> | null = isYouTubeConfigured
  ? createClient<Database>(youtubeUrl, youtubeAnonKey, {
      global: { fetch: (url, opts) => fetch(url, { ...opts, signal: AbortSignal.timeout(25000) }) }
    })
  : null

/** Single client for backwards compatibility; uses Instagram if available. */
export const supabase = supabaseInstagram ?? supabaseYouTube
