import type { Video } from '@/types/database'

interface FetchVideosParams {
  creatorName?: string
  dateFrom?: string
  dateTo?: string
}

export async function fetchVideos(params: FetchVideosParams = {}): Promise<Video[]> {
  const search = new URLSearchParams()
  if (params.creatorName) search.set('creatorName', params.creatorName)
  if (params.dateFrom) search.set('dateFrom', params.dateFrom)
  if (params.dateTo) search.set('dateTo', params.dateTo)
  const url = `/api/videos${search.toString() ? `?${search}` : ''}`
  const res = await fetch(url)
  const text = await res.text()
  if (!res.ok) {
    try {
      const body = JSON.parse(text)
      throw new Error(body?.error ?? res.statusText ?? 'Failed to fetch videos')
    } catch (e) {
      if (e instanceof Error && e.message !== 'Failed to fetch videos') throw e
      throw new Error(text || res.statusText || 'Failed to fetch videos')
    }
  }
  return text ? JSON.parse(text) : []
}
