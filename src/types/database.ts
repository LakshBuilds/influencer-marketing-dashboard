export type Platform = 'instagram' | 'youtube'

export interface Video {
  id: string
  platform: Platform
  video_url: string
  views: number
  weekly_views: number
  payout: number
  employee_name: string
  employee_email: string
  creator_name: string
  posted_at: string
}

/** Dashboard unified row; DB tables differ (YouTube: videos, Instagram: reels) */
export interface Database {
  public: {
    Tables: {
      videos: { Row: Record<string, unknown> }
      reels: { Row: Record<string, unknown> }
    }
  }
}

export interface EmployeeStats {
  employee_email: string
  total_videos: number
  total_views: number
  total_payout: number
}

export interface DateRangeStats {
  videos_count: number
  total_views: number
  total_payout: number
}
