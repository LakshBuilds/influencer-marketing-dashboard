-- Run this in BOTH Supabase projects (Instagram + YouTube)
-- Dashboard → SQL Editor → New query → paste and Run

CREATE TABLE IF NOT EXISTS public.videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text,
  video_url text,
  views bigint DEFAULT 0,
  weekly_views bigint DEFAULT 0,
  payout numeric DEFAULT 0,
  employee_name text,
  creator_name text,
  posted_at timestamptz
);

-- Optional: allow read for anon (if using Supabase Auth later)
-- ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow read" ON public.videos FOR SELECT USING (true);
