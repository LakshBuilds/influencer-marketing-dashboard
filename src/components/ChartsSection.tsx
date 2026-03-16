'use client'

import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

interface CPVItem {
  name: string
  payout: number
  views: number
  cpv: number
}

interface EngagementTrendPoint {
  date: string
  avgViews: number
  videos: number
  totalViews: number
}

interface PlatformItem {
  name: string
  value: number
}

interface ChartsSectionProps {
  cpvPerEmployee: CPVItem[]
  engagementTrend: EngagementTrendPoint[]
  engagementRangeMonths: 1 | 3 | 6
  onEngagementRangeMonthsChange: (v: 1 | 3 | 6) => void
  platformData: PlatformItem[]
  loading?: boolean
}

const CHART_COLORS = ['#0a0a0a', '#525252', '#a3a3a3', '#d4d4d4']

export function ChartsSection({
  cpvPerEmployee,
  engagementTrend,
  engagementRangeMonths,
  onEngagementRangeMonthsChange,
  platformData,
  loading = false,
}: ChartsSectionProps) {
  if (loading) {
    return (
      <section className="space-y-6">
        <h2 className="text-lg font-semibold text-primary">Charts</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-64 animate-pulse rounded-lg border border-border bg-surface-card" />
          <div className="h-64 animate-pulse rounded-lg border border-border bg-surface-card" />
        </div>
        <div className="h-64 animate-pulse rounded-lg border border-border bg-surface-card" />
      </section>
    )
  }

  const formatViews = (v: number): string => {
    if (!Number.isFinite(v)) return '0'
    return v >= 1_000_000
      ? `${(v / 1_000_000).toFixed(1)}M`
      : v >= 1_000
      ? `${(v / 1_000).toFixed(1)}K`
      : v.toLocaleString()
  }
  const formatDate = (d: string) => {
    // d is YYYY-MM-DD
    const dt = new Date(d)
    if (Number.isNaN(dt.getTime())) return d
    return dt.toLocaleDateString()
  }

  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold text-primary">Charts</h2>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface-card p-4 shadow-sm">
          <h3 className="mb-4 text-sm font-medium text-muted">CPV — Payout vs Views per employee</h3>
          <p className="mb-2 text-xs text-muted">Cost Per View in tooltip</p>
          <div style={{ minHeight: 280, height: Math.max(280, cpvPerEmployee.length * 32) }}>
            {cpvPerEmployee.length === 0 ? (
              <div className="flex h-full min-h-[200px] items-center justify-center text-muted">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={cpvPerEmployee}
                  layout="vertical"
                  margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
                >
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v.toFixed(2)}`} />
                  <YAxis type="category" dataKey="name" width={180} tick={{ fontSize: 11 }} interval={0} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      const d = payload[0].payload as CPVItem
                      return (
                        <div className="rounded border border-border bg-surface-card px-3 py-2 text-xs shadow">
                          <div className="font-medium text-primary">{d.name}</div>
                          <div>Payout: ₹{(d.payout / 1000).toFixed(1)}K</div>
                          <div>Views: {d.views.toLocaleString()}</div>
                          <div className="mt-1 font-medium text-primary">
                            CPV: ₹{d.cpv.toFixed(2)} per view
                          </div>
                        </div>
                      )
                    }}
                  />
                  <Bar dataKey="cpv" fill="#0a0a0a" name="CPV (₹/view)" radius={[0, 2, 2, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-surface-card p-4 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-medium text-muted">Engagement trend (avg views per video)</h3>
              <p className="mt-1 text-xs text-muted">Based on posted date (daily)</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => onEngagementRangeMonthsChange(1)}
                className={`rounded border px-2 py-1 ${
                  engagementRangeMonths === 1
                    ? 'border-primary bg-surface-muted text-primary'
                    : 'border-border bg-surface-card text-muted'
                }`}
              >
                1 month
              </button>
              <button
                type="button"
                onClick={() => onEngagementRangeMonthsChange(3)}
                className={`rounded border px-2 py-1 ${
                  engagementRangeMonths === 3
                    ? 'border-primary bg-surface-muted text-primary'
                    : 'border-border bg-surface-card text-muted'
                }`}
              >
                3 months
              </button>
              <button
                type="button"
                onClick={() => onEngagementRangeMonthsChange(6)}
                className={`rounded border px-2 py-1 ${
                  engagementRangeMonths === 6
                    ? 'border-primary bg-surface-muted text-primary'
                    : 'border-border bg-surface-card text-muted'
                }`}
              >
                6 months
              </button>
            </div>
          </div>
          <div className="h-64">
            {engagementTrend.length === 0 ? (
              <div className="flex h-full items-center justify-center text-muted">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={engagementTrend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#e5e5e5" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    tickFormatter={formatDate}
                    minTickGap={18}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value: number) => formatViews(Number(value))}
                  />
                  <Tooltip
                    labelFormatter={(label) => formatDate(String(label))}
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null
                      const d = payload[0].payload as EngagementTrendPoint
                      return (
                        <div className="rounded border border-border bg-surface-card px-3 py-2 text-xs shadow">
                          <div className="font-medium text-primary">{formatDate(String(label))}</div>
                          <div>Avg views/video: {d.avgViews.toLocaleString()}</div>
                          <div>Videos: {d.videos}</div>
                          <div>Total views: {d.totalViews.toLocaleString()}</div>
                        </div>
                      )
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgViews"
                    stroke="#0a0a0a"
                    strokeWidth={2}
                    dot={{ r: 2, strokeWidth: 2 }}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-border bg-surface-card p-4 shadow-sm">
        <h3 className="mb-4 text-sm font-medium text-muted">Platform comparison (videos)</h3>
        <div className="h-64">
          {platformData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {platformData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [v, 'Videos']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </section>
  )
}
