'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Video } from '@/types/database'

type SortOption = 'date_desc' | 'views_desc' | 'views_asc'

interface VideoTableProps {
  videos: Video[]
  loading?: boolean
}

export function VideoTable({ videos, loading }: VideoTableProps) {
  const [pageSize, setPageSize] = useState(25)
  const [page, setPage] = useState(1)
  const [filterText, setFilterText] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('date_desc')

  const formatNum = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : n
  const formatPayout = (n: number) => `₹${(n / 1_000).toFixed(1)}K`
  const formatDate = (d: string) => (d ? new Date(d).toLocaleDateString() : '—')

  const processedVideos = useMemo(() => {
    const q = filterText.trim().toLowerCase()
    const filtered = q
      ? videos.filter((v) =>
          [v.creator_name, v.employee_name, v.employee_email, v.platform, v.video_url]
            .some((field) => (field ?? '').toString().toLowerCase().includes(q))
        )
      : videos

    const sorted = [...filtered]
    if (sortBy === 'views_desc') {
      sorted.sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
    } else if (sortBy === 'views_asc') {
      sorted.sort((a, b) => (a.views ?? 0) - (b.views ?? 0))
    } else {
      sorted.sort(
        (a, b) =>
          new Date(b.posted_at || 0).getTime() - new Date(a.posted_at || 0).getTime()
      )
    }
    return sorted
  }, [videos, filterText, sortBy])

  const total = processedVideos.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  useEffect(() => {
    // keep page in range when filters/pageSize change
    setPage(1)
  }, [pageSize, total, filterText, sortBy])

  const pageVideos = useMemo(() => {
    const start = (page - 1) * pageSize
    return processedVideos.slice(start, start + pageSize)
  }, [processedVideos, page, pageSize])

  const rangeText = useMemo(() => {
    if (total === 0) return '0'
    const start = (page - 1) * pageSize + 1
    const end = Math.min(total, page * pageSize)
    return `${start}-${end} of ${total}`
  }, [page, pageSize, total])

  if (loading) {
    return (
      <section className="overflow-hidden rounded-lg border border-border bg-surface-card shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-lg font-semibold text-primary">Videos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-muted/50">
                <th className="px-5 py-3 font-medium text-muted">Platform</th>
                <th className="px-5 py-3 font-medium text-muted">Video URL</th>
                <th className="px-5 py-3 font-medium text-muted">Creator</th>
                <th className="px-5 py-3 font-medium text-muted">Employee</th>
                <th className="px-5 py-3 font-medium text-muted">Views</th>
                <th className="px-5 py-3 font-medium text-muted">Weekly Views</th>
                <th className="px-5 py-3 font-medium text-muted">Payout</th>
                <th className="px-5 py-3 font-medium text-muted">Posted</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="border-b border-border">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="px-5 py-3">
                      <div className="h-5 w-20 animate-pulse rounded bg-surface-muted" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    )
  }

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-surface-card shadow-sm">
      <div className="border-b border-border px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-primary">Videos</h2>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Filter creator, employee, platform…"
              className="rounded border border-border bg-surface-card px-3 py-1.5 text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <label className="flex items-center gap-2 text-muted">
              Sort
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="rounded border border-border bg-surface-card px-2 py-1.5 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="date_desc">Latest date</option>
                <option value="views_desc">Views: High to Low</option>
                <option value="views_asc">Views: Low to High</option>
              </select>
            </label>
            <span className="text-muted tabular-nums">{rangeText}</span>
            <label className="flex items-center gap-2 text-muted">
              Rows
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="rounded border border-border bg-surface-card px-2 py-1.5 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded border border-border bg-surface-card px-2 py-1.5 text-sm text-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded border border-border bg-surface-card px-2 py-1.5 text-sm text-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted/50">
              <th className="px-5 py-3 font-medium text-muted">Platform</th>
              <th className="px-5 py-3 font-medium text-muted">Video URL</th>
              <th className="px-5 py-3 font-medium text-muted">Creator</th>
              <th className="px-5 py-3 font-medium text-muted">Employee</th>
              <th className="px-5 py-3 font-medium text-muted">Views</th>
              <th className="px-5 py-3 font-medium text-muted">Weekly Views</th>
              <th className="px-5 py-3 font-medium text-muted">Payout</th>
              <th className="px-5 py-3 font-medium text-muted">Posted</th>
            </tr>
          </thead>
          <tbody>
            {videos.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-muted">
                  No videos found
                </td>
              </tr>
            ) : (
              pageVideos.map((v) => (
                <tr key={v.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 capitalize text-primary">{v.platform}</td>
                  <td className="px-5 py-3">
                    <a
                      href={v.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline hover:no-underline"
                    >
                      Link
                    </a>
                  </td>
                  <td className="px-5 py-3 text-primary">{v.creator_name || '—'}</td>
                  <td className="px-5 py-3 text-primary">{v.employee_name || '—'}</td>
                  <td className="px-5 py-3 tabular-nums text-primary">
                    {formatNum(v.views ?? 0)}
                  </td>
                  <td className="px-5 py-3 tabular-nums text-primary">
                    {formatNum(v.weekly_views ?? 0)}
                  </td>
                  <td className="px-5 py-3 tabular-nums text-primary">
                    {formatPayout(v.payout ?? 0)}
                  </td>
                  <td className="px-5 py-3 text-primary">{formatDate(v.posted_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
