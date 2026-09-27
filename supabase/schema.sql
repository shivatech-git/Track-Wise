-- TrackWise schema. Run this in the Supabase SQL editor (Dashboard -> SQL Editor).
-- It enables pgvector, creates the tables, and locks every row to its owner
-- with Row Level Security so one user can never read another user's data.

-- 1. Extensions -------------------------------------------------------------
create extension if not exists vector;

-- 2. Resume: one row per user (their master resume + its embedding) ----------
create table if not exists resumes (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  raw_text    text not null,
  embedding   vector(384),                 -- all-MiniLM-L6-v2 output dimension
  updated_at  timestamptz not null default now()
);

-- 3. Applications: the core pipeline ----------------------------------------
create table if not exists applications (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  company         text not null,
  role            text not null,
  status          text not null default 'saved'
                    check (status in ('saved','applied','interviewing','offer','rejected')),
  job_description text,
  parsed          jsonb,                    -- { seniority, required_skills[], keywords[], salary }
  match_score     int check (match_score between 0 and 100),
  embedding       vector(384),
  source_url      text,
  notes           text,
  applied_at      timestamptz,
  created_at      timestamptz not null default now()
);

create index if not exists applications_user_idx on applications (user_id);
create index if not exists applications_status_idx on applications (user_id, status);

-- 4. Cover letters: one-to-many per application -----------------------------
create table if not exists cover_letters (
  id              uuid primary key default gen_random_uuid(),
  application_id  uuid not null references applications (id) on delete cascade,
  user_id         uuid not null references auth.users (id) on delete cascade,
  content         text not null,
  created_at      timestamptz not null default now()
);

create index if not exists cover_letters_app_idx on cover_letters (application_id);

-- 5. Row Level Security -----------------------------------------------------
alter table resumes       enable row level security;
alter table applications  enable row level security;
alter table cover_letters enable row level security;

-- Owner-only access. auth.uid() is the logged-in user's id.
create policy "own resume"        on resumes       for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own applications"  on applications  for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own cover letters" on cover_letters for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
