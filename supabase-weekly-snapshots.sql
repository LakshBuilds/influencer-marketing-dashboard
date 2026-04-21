create table public.weekly_snapshots (
  id text not null default (extensions.uuid_generate_v4 ())::text,
  week_start_date date not null,
  total_views bigint null default 0,
  total_videos integer null default 0,
  total_likes bigint null default 0,
  total_comments bigint null default 0,
  total_payout numeric(10, 2) null default 0,
  created_at timestamp with time zone null default now(),
  constraint weekly_snapshots_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists idx_weekly_snapshots_week on public.weekly_snapshots using btree (week_start_date) TABLESPACE pg_default;
