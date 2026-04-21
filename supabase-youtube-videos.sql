create table public.videos (
  id text not null default (extensions.uuid_generate_v4 ())::text,
  video_id text null,
  channel_name text null,
  channel_id text null,
  title text null,
  description text null,
  published_at timestamp with time zone null,
  thumbnail_url text null,
  video_url text null,
  duration text null,
  duration_seconds integer null,
  view_count bigint null default 0,
  like_count bigint null default 0,
  dislike_count bigint null default 0,
  comment_count bigint null default 0,
  subscriber_count bigint null default 0,
  category text null,
  tags text[] null,
  language text null,
  is_short boolean null default false,
  is_live boolean null default false,
  is_archived boolean null default false,
  payout numeric(10, 2) null default 0,
  locationname text null,
  created_by_user_id text null,
  created_by_email text null,
  created_by_name text null,
  last_updated_at timestamp with time zone null default now(),
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  refresh_failed boolean null default false,
  decay_priority numeric null,
  last_refresh_at timestamp with time zone null,
  refresh_count integer null default 0,
  constraint videos_pkey primary key (id),
  constraint videos_video_id_key unique (video_id)
) TABLESPACE pg_default;

create index IF not exists idx_videos_video_id on public.videos using btree (video_id) TABLESPACE pg_default;
create index IF not exists idx_videos_channel_name on public.videos using btree (channel_name) TABLESPACE pg_default;
create index IF not exists idx_videos_created_by_email on public.videos using btree (created_by_email) TABLESPACE pg_default;
create index IF not exists idx_videos_published_at on public.videos using btree (published_at desc) TABLESPACE pg_default;
create index IF not exists idx_videos_is_archived on public.videos using btree (is_archived) TABLESPACE pg_default;
