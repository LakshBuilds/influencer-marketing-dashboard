'use client'

interface OverviewCardsProps {
  totalInstagramVideos: number
  totalYoutubeVideos: number
  totalViews: number
  totalWeeklyViews: number
  totalPayout: number
  loading?: boolean
}

function Card({
  label,
  value,
  loading,
}: {
  label: string
  value: string | number
  loading?: boolean
}) {
  return (
    <div className="rounded-lg border border-border bg-surface-card p-5 shadow-sm">
      <p className="text-sm font-medium text-muted">{label}</p>
      {loading ? (
        <div className="mt-2 h-8 w-24 animate-pulse rounded bg-surface-muted" />
      ) : (
        <p className="mt-1 text-2xl font-semibold tabular-nums text-primary">{value}</p>
      )}
    </div>
  )
}

export function OverviewCards({
  totalInstagramVideos,
  totalYoutubeVideos,
  totalViews,
  totalWeeklyViews,
  totalPayout,
  loading = false,
}: OverviewCardsProps) {
  const formatNum = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : n
  const formatPayout = (n: number) => `₹${(n / 1_000).toFixed(1)}K`

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-primary">Overview</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card label="Instagram Videos" value={totalInstagramVideos} loading={loading} />
        <Card label="YouTube Videos" value={totalYoutubeVideos} loading={loading} />
        <Card label="Total Views" value={formatNum(totalViews)} loading={loading} />
        <Card label="Weekly Views" value={formatNum(totalWeeklyViews)} loading={loading} />
        <Card label="Total Payout" value={formatPayout(totalPayout)} loading={loading} />
      </div>
    </section>
  )
}
