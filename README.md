# Influencer Marketing Analytics Dashboard

Minimal, executive-friendly dashboard for campaign and creator performance. Built with Next.js 14, Tailwind CSS, PostgreSQL (Supabase), and Recharts.

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Database**

   The dashboard connects to two Supabase PostgreSQL databases (Instagram and YouTube). Ensure each project has a `videos` table. In each Supabase SQL Editor, run:

   ```sql
   create table if not exists public.videos (
     id uuid primary key default gen_random_uuid(),
     platform text,
     video_url text,
     views bigint default 0,
     weekly_views bigint default 0,
     payout numeric default 0,
     employee_name text,
     creator_name text,
     posted_at timestamptz
   );
   ```

3. **Environment**

   **Option A (recommended):** Set Supabase API keys so data loads via REST API. In each project: **Project Settings → API** → copy **Project URL** and **anon public** key. In `.env.local`: `SUPABASE_URL_INSTAGRAM`, `SUPABASE_ANON_KEY_INSTAGRAM`, `SUPABASE_URL_YOUTUBE`, `SUPABASE_ANON_KEY_YOUTUBE`.

   **Option B:** If API keys are empty, the app uses PostgreSQL URLs: `DATABASE_URL_INSTAGRAM`, `DATABASE_URL_YOUTUBE`  

   Use URL-encoding for special characters in the password (e.g. `@` → `%40`).  
   If one project uses a different password, set that project’s URL in `.env.local` with the correct password.

   **Tables:** YouTube project uses `public.videos`; Instagram project uses `public.reels`. Use `supabase-youtube-videos.sql` and `supabase-instagram-reels.sql` if you need to create them.

4. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Features

- **Overview** — Total Instagram/YouTube videos, total views, weekly views, total payout  
- **Employee performance** — Table by employee: total videos, views, payout  
- **Platform analytics** — Instagram vs YouTube comparison  
- **Creator filter** — Filter by creator name  
- **Date range filter** — Filter by posted date; shows video count, total views, total payout for the range  
- **Charts** — Views per week, payout per employee, platform comparison (pie)  
- **Video table** — All videos with platform, URL, creator, employee, views, weekly views, payout, posted date  

Data is fetched from both databases via the `/api/videos` route; filters (creator, date range) are applied server-side.
