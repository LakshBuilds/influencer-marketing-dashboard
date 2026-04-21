'use client'

import Image from 'next/image'
import { useState, useMemo } from 'react'
import { useVideos } from '@/hooks/useVideos'
import {
  fetchOverview,
  computeEmployeeStats,
  computeDateRangeStats,
  getPlatformComparison,
  getCPVPerEmployeeData,
  getEngagementTrendSeries,
} from '@/lib/queries'
import { OverviewCards } from '@/components/OverviewCards'
import { EmployeePerformanceTable } from '@/components/EmployeePerformanceTable'
import { PlatformAnalytics } from '@/components/PlatformAnalytics'
import { CreatorFilter } from '@/components/CreatorFilter'
import { DateRangeFilter } from '@/components/DateRangeFilter'
import { DateRangeStats } from '@/components/DateRangeStats'
import { PlatformSelector, type PlatformFilter } from '@/components/PlatformSelector'
import { ChartsSection } from '@/components/ChartsSection'
import { VideoTable } from '@/components/VideoTable'

export default function DashboardPage() {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [creatorFilter, setCreatorFilter] = useState('')
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('both')
  const [engagementRangeMonths, setEngagementRangeMonths] = useState<1 | 3 | 6>(3)

  const { videos, snapshots, loading, error } = useVideos({
    creatorName: creatorFilter.trim() || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  })

  const filteredVideos = useMemo(() => {
    if (platformFilter === 'both') return videos
    return videos.filter((v) => v.platform === platformFilter)
  }, [videos, platformFilter])

  const youtubeVideos = useMemo(
    () => videos.filter((v) => v.platform === 'youtube'),
    [videos]
  )
  const instagramVideos = useMemo(
    () => videos.filter((v) => v.platform === 'instagram'),
    [videos]
  )

  const overview = useMemo(() => fetchOverview(filteredVideos), [filteredVideos])
  const employeeStats = useMemo(() => computeEmployeeStats(filteredVideos), [filteredVideos])
  const dateRangeStats = useMemo(() => computeDateRangeStats(filteredVideos), [filteredVideos])
  const platformComparison = useMemo(() => getPlatformComparison(filteredVideos), [filteredVideos])
  const cpvPerEmployee = useMemo(() => getCPVPerEmployeeData(filteredVideos), [filteredVideos])
  const engagementTrend = useMemo(
    () => getEngagementTrendSeries(filteredVideos, engagementRangeMonths),
    [filteredVideos, engagementRangeMonths]
  )
  const platformChartData = useMemo(
    () => [
      { name: 'Instagram', value: platformComparison.instagram.count },
      { name: 'YouTube', value: platformComparison.youtube.count },
    ],
    [platformComparison]
  )

  const totalWeeklySnapshots = (snapshots.instagram || 0) + (snapshots.youtube || 0)

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-10 border-b border-border bg-surface-card/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Influencer Marketing Dashboard"
                width={28}
                height={28}
                className="rounded-lg"
                priority
              />
              <h1 className="text-xl font-semibold text-primary">Influencer Marketing Dashboard</h1>
            </div>
            <PlatformSelector value={platformFilter} onChange={setPlatformFilter} />
          </div>
          <p className="mt-0.5 text-sm text-muted">Campaign and creator performance</p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <CreatorFilter value={creatorFilter} onChange={setCreatorFilter} />
            <DateRangeFilter
              dateFrom={dateFrom}
              dateTo={dateTo}
              onDateFromChange={setDateFrom}
              onDateToChange={setDateTo}
            />
          </div>
        </div>

        <div className="mb-6">
          <DateRangeStats stats={dateRangeStats} loading={loading} />
        </div>

        <div className="space-y-8">
          <OverviewCards
            totalInstagramVideos={overview.totalInstagramVideos}
            totalYoutubeVideos={overview.totalYoutubeVideos}
            totalViews={overview.totalViews}
            totalWeeklyViews={totalWeeklySnapshots}
            totalPayout={overview.totalPayout}
            loading={loading}
          />

          {platformFilter === 'both' ? (
            <div className="space-y-8">
              <div className="flex justify-center">
                <div className="w-full max-w-3xl">
                  <PlatformAnalytics
                    instagram={platformComparison.instagram}
                    youtube={platformComparison.youtube}
                    loading={loading}
                  />
                </div>
              </div>
              <div className="grid gap-8 lg:grid-cols-2">
                <EmployeePerformanceTable
                  title="YouTube Employee Performance"
                  data={computeEmployeeStats(youtubeVideos)}
                  loading={loading}
                />
                <EmployeePerformanceTable
                  title="Instagram Employee Performance"
                  data={computeEmployeeStats(instagramVideos)}
                  loading={loading}
                />
              </div>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-2">
              <EmployeePerformanceTable data={employeeStats} loading={loading} />
              <PlatformAnalytics
                instagram={platformComparison.instagram}
                youtube={platformComparison.youtube}
                loading={loading}
              />
            </div>
          )}

          <ChartsSection
            cpvPerEmployee={cpvPerEmployee}
            engagementTrend={engagementTrend}
            engagementRangeMonths={engagementRangeMonths}
            onEngagementRangeMonthsChange={setEngagementRangeMonths}
            platformData={platformChartData}
            loading={loading}
          />

          <VideoTable videos={filteredVideos} loading={loading} />
        </div>
      </main>
    </div>
  )
}
