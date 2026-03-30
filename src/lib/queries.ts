import type { Video, EmployeeStats, DateRangeStats } from '@/types/database'

export function fetchOverview(videos: Video[]) {
  const instagram = videos.filter((v) => v.platform === 'instagram')
  const youtube = videos.filter((v) => v.platform === 'youtube')
  return {
    totalInstagramVideos: instagram.length,
    totalYoutubeVideos: youtube.length,
    totalViews: videos.reduce((s, v) => s + (v.views ?? 0), 0),
    totalWeeklyViews: videos.reduce((s, v) => s + (v.weekly_views ?? 0), 0),
    totalPayout: videos.reduce((s, v) => s + (v.payout ?? 0), 0),
  }
}

export function computeEmployeeStats(videos: Video[]): EmployeeStats[] {
  const map = new Map<string, { videos: number; views: number; payout: number }>()
  for (const v of videos) {
    const email = (v.employee_email || '').trim() || 'Unknown'
    const cur = map.get(email) ?? { videos: 0, views: 0, payout: 0 }
    map.set(email, {
      videos: cur.videos + 1,
      views: cur.views + (v.views ?? 0),
      payout: cur.payout + (v.payout ?? 0),
    })
  }
  return Array.from(map.entries()).map(([employee_email, s]) => ({
    employee_email,
    total_videos: s.videos,
    total_views: s.views,
    total_payout: s.payout,
  }))
}

export function computeDateRangeStats(videos: Video[]): DateRangeStats {
  return {
    videos_count: videos.length,
    total_views: videos.reduce((s, v) => s + (v.views ?? 0), 0),
    total_payout: videos.reduce((s, v) => s + (v.payout ?? 0), 0),
  }
}

export function getPlatformComparison(videos: Video[]) {
  const instagram = videos.filter((v) => v.platform === 'instagram')
  const youtube = videos.filter((v) => v.platform === 'youtube')
  return {
    instagram: {
      count: instagram.length,
      views: instagram.reduce((s, v) => s + (v.views ?? 0), 0),
      payout: instagram.reduce((s, v) => s + (v.payout ?? 0), 0),
    },
    youtube: {
      count: youtube.length,
      views: youtube.reduce((s, v) => s + (v.views ?? 0), 0),
      payout: youtube.reduce((s, v) => s + (v.payout ?? 0), 0),
    },
  }
}

export function getViewsPerWeekData(videos: Video[]) {
  const byWeek = new Map<string, number>()
  for (const v of videos) {
    if (!v.posted_at) continue
    const d = new Date(v.posted_at)
    const weekStart = new Date(d)
    weekStart.setDate(d.getDate() - d.getDay())
    const key = weekStart.toISOString().slice(0, 10)
    byWeek.set(key, (byWeek.get(key) ?? 0) + (v.weekly_views ?? 0))
  }
  return Array.from(byWeek.entries())
    .map(([week, views]) => ({ week, views }))
    .sort((a, b) => a.week.localeCompare(b.week))
}

export function getPayoutPerEmployeeData(videos: Video[]): { name: string; payout: number }[] {
  return computeEmployeeStats(videos).map((e) => ({
    name: e.employee_email,
    payout: e.total_payout,
  }))
}

/** CPV (Cost Per View): payout vs views per employee */
export function getCPVPerEmployeeData(videos: Video[]): { name: string; payout: number; views: number; cpv: number }[] {
  return computeEmployeeStats(videos).map((e) => {
    const cpv = e.total_views > 0 ? e.total_payout / e.total_views : 0
    return {
      name: e.employee_email,
      payout: e.total_payout,
      views: e.total_views,
      cpv: Math.round(cpv * 100) / 100,
    }
  })
}

export interface EngagementTrendPoint {
  date: string // YYYY-MM-DD
  avgViews: number
  videos: number
  totalViews: number
}

/** Google-trends style series: average views per video by posted date (daily) */
export function getEngagementTrendSeries(
  videos: Video[],
  months: 1 | 3 | 6
): EngagementTrendPoint[] {
  const now = new Date()
  const from = new Date(now)
  from.setMonth(from.getMonth() - months)

  const byDay = new Map<string, { totalViews: number; videos: number }>()
  for (const v of videos) {
    if (!v.posted_at) continue
    const d = new Date(v.posted_at)
    if (Number.isNaN(d.getTime())) continue
    if (d < from) continue
    const key = d.toISOString().slice(0, 10)
    const cur = byDay.get(key) ?? { totalViews: 0, videos: 0 }
    byDay.set(key, {
      totalViews: cur.totalViews + (v.views ?? 0),
      videos: cur.videos + 1,
    })
  }

  return Array.from(byDay.entries())
    .map(([date, s]) => ({
      date,
      totalViews: s.totalViews,
      videos: s.videos,
      avgViews: s.videos > 0 ? Math.round(s.totalViews / s.videos) : 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}
