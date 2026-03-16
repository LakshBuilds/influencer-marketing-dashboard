'use client'

import type { DateRangeStats as DateRangeStatsType } from '@/types/database'

interface DateRangeStatsProps {
  stats: DateRangeStatsType
  loading?: boolean
}

export function DateRangeStats({ stats, loading }: DateRangeStatsProps) {
  const formatNum = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : n
  const formatPayout = (n: number) => `₹${(n / 1_000).toFixed(1)}K`

  if (loading) {
    return (
      <div className="flex flex-wrap gap-4 rounded-lg border border-border bg-surface-card px-4 py-3">
        <div className="h-6 w-24 animate-pulse rounded bg-surface-muted" />
        <div className="h-6 w-20 animate-pulse rounded bg-surface-muted" />
        <div className="h-6 w-24 animate-pulse rounded bg-surface-muted" />
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-6 rounded-lg border border-border bg-surface-card px-4 py-3 text-sm">
      <span className="text-muted">
        In selected range: <strong className="text-primary">{stats.videos_count}</strong> videos
      </span>
      <span className="text-muted">
        Total views: <strong className="text-primary">{formatNum(stats.total_views)}</strong>
      </span>
      <span className="text-muted">
        Total payout: <strong className="text-primary">{formatPayout(stats.total_payout)}</strong>
      </span>
    </div>
  )
}
