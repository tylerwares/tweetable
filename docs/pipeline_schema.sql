-- Supabase schema for multi-stage pipeline storage and usage counters.

-- Stage outputs (stored as jsonb per session)
create table if not exists public.voice_profiles (
  session_id uuid primary key,
  user_id uuid references auth.users(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz default now()
);

create table if not exists public.idea_extractions (
  session_id uuid primary key,
  user_id uuid references auth.users(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz default now()
);

create table if not exists public.insight_angles (
  session_id uuid primary key,
  user_id uuid references auth.users(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz default now()
);

create table if not exists public.tweet_generations (
  session_id uuid primary key,
  user_id uuid references auth.users(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz default now()
);

create table if not exists public.shitposts (
  session_id uuid primary key,
  user_id uuid references auth.users(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz default now()
);

-- Usage table + increment function expected by backend/app/utils/usage.py
create table if not exists public.usage (
  user_id uuid references auth.users(id) on delete cascade,
  month text not null,
  uploads integer not null default 0,
  generations integer not null default 0,
  primary key (user_id, month)
);

create or replace function public.increment_usage(p_user_id uuid, p_month text, p_field text)
returns void
language plpgsql
as $$
begin
  insert into public.usage (user_id, month, uploads, generations)
  values (p_user_id, p_month, 0, 0)
  on conflict (user_id, month) do nothing;

  if p_field = 'uploads' then
    update public.usage set uploads = uploads + 1 where user_id = p_user_id and month = p_month;
  elsif p_field = 'generations' then
    update public.usage set generations = generations + 1 where user_id = p_user_id and month = p_month;
  end if;
end;
$$;
