'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchVideos } from '@/lib/api'
import type { Video } from '@/types/database'

interface UseVideosFilters {
  creatorName?: string
  dateFrom?: string
  dateTo?: string
}

export function useVideos(filters: UseVideosFilters = {}) {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchVideos(filters)
      setVideos(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load videos')
      setVideos([])
    } finally {
      setLoading(false)
    }
  }, [filters.creatorName, filters.dateFrom, filters.dateTo])

  useEffect(() => {
    load()
  }, [load])

  return { videos, loading, error, refetch: load }
}
