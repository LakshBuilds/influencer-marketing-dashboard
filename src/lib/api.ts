import type { Video } from '@/types/database'

interface FetchVideosParams {
  creatorName?: string
  dateFrom?: string
  dateTo?: string
}

export interface VideosResponse {
  videos: Video[]
  snapshots: {
    instagram: number
    youtube: number
  }
  // Set when one or more upstream sources failed but the response is otherwise
  // usable. The client can surface this as a non-blocking banner.
  error?: string
}

export async function fetchVideos(params: FetchVideosParams = {}): Promise<VideosResponse> {
  const search = new URLSearchParams()
  if (params.creatorName) search.set('creatorName', params.creatorName)
  if (params.dateFrom) search.set('dateFrom', params.dateFrom)
  if (params.dateTo) search.set('dateTo', params.dateTo)
  const url = `/api/videos${search.toString() ? `?${search}` : ''}`
  const res = await fetch(url)
  const text = await res.text()

  if (!text || text.trim() === '') {
    if (!res.ok) throw new Error(`Server returned ${res.status} with empty body`)
    return { videos: [], snapshots: { instagram: 0, youtube: 0 } }
  }

  let body: unknown
  try {
    body = JSON.parse(text)
  } catch {
    // Truncated or malformed response — log and return safe fallback
    console.error('[fetchVideos] JSON parse failed. Response length:', text.length, '| First 200 chars:', text.slice(0, 200))
    throw new Error(`Unexpected response from server (${text.length} bytes, not valid JSON). Try refreshing.`)
  }

  if (!res.ok) {
    const err = (body as Record<string, unknown>)?.error
    throw new Error(typeof err === 'string' ? err : res.statusText || 'Failed to fetch videos')
  }

  return body as VideosResponse
}
