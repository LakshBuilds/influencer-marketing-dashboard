'use client'

import type { EmployeeStats } from '@/types/database'

interface EmployeePerformanceTableProps {
  data: EmployeeStats[]
  loading?: boolean
  title?: string
}

export function EmployeePerformanceTable({ data, loading, title = 'Employee Performance' }: EmployeePerformanceTableProps) {
  const formatNum = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : n
  const formatPayout = (n: number) => `₹${(n / 1_000).toFixed(1)}K`

  if (loading) {
    return (
      <section className="rounded-lg border border-border bg-surface-card p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-primary">{title}</h2>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="h-6 w-32 animate-pulse rounded bg-surface-muted" />
              <div className="h-6 w-16 animate-pulse rounded bg-surface-muted" />
              <div className="h-6 w-20 animate-pulse rounded bg-surface-muted" />
              <div className="h-6 w-20 animate-pulse rounded bg-surface-muted" />
            </div>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-surface-card shadow-sm">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-lg font-semibold text-primary">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted/50">
              <th className="px-5 py-3 font-medium text-muted">Employee Name</th>
              <th className="px-5 py-3 font-medium text-muted">Total Videos</th>
              <th className="px-5 py-3 font-medium text-muted">Total Views</th>
              <th className="px-5 py-3 font-medium text-muted">Total Payout</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-muted">
                  No data
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.employee_name} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-medium text-primary">{row.employee_name}</td>
                  <td className="px-5 py-3 tabular-nums text-primary">{row.total_videos}</td>
                  <td className="px-5 py-3 tabular-nums text-primary">
                    {formatNum(row.total_views)}
                  </td>
                  <td className="px-5 py-3 tabular-nums text-primary">
                    {formatPayout(row.total_payout)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
