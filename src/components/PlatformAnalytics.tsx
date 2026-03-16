'use client'

interface PlatformData {
  count: number
  views: number
  payout: number
}

interface PlatformAnalyticsProps {
  instagram: PlatformData
  youtube: PlatformData
  loading?: boolean
}

export function PlatformAnalytics({ instagram, youtube, loading }: PlatformAnalyticsProps) {
  const formatNum = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : n
  const formatPayout = (n: number) => `₹${(n / 1_000).toFixed(1)}K`

  if (loading) {
    return (
      <section className="rounded-lg border border-border bg-surface-card p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-primary">Platform Analytics</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-32 animate-pulse rounded bg-surface-muted" />
          <div className="h-32 animate-pulse rounded bg-surface-muted" />
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-lg border border-border bg-surface-card p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-primary">Platform Analytics</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface-muted/30 p-4">
          <p className="text-sm font-medium text-muted">Instagram</p>
          <p className="mt-1 text-xl font-semibold text-primary">{instagram.count} videos</p>
          <p className="mt-0.5 text-sm text-primary">Views: {formatNum(instagram.views)}</p>
          <p className="text-sm text-primary">Payout: {formatPayout(instagram.payout)}</p>
        </div>
        <div className="rounded-lg border border-border bg-surface-muted/30 p-4">
          <p className="text-sm font-medium text-muted">YouTube</p>
          <p className="mt-1 text-xl font-semibold text-primary">{youtube.count} videos</p>
          <p className="mt-0.5 text-sm text-primary">Views: {formatNum(youtube.views)}</p>
          <p className="text-sm text-primary">Payout: {formatPayout(youtube.payout)}</p>
        </div>
      </div>
    </section>
  )
}
