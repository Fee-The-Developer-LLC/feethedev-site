-- Client portal for feethedeveloper.com /dashboard.
--
-- A client is attached to the portal by email. When a signed-in Clerk user has a
-- verified email that matches an active row in portal_clients, /dashboard shows
-- that client's projects, studio updates, change requests and shared files.
--
-- Every table is server-only: RLS is enabled and anon/authenticated access is
-- revoked. The site reads and writes with SUPABASE_SECRET_KEY after it has
-- checked the Clerk session, the same model as public.project_intakes.

create table if not exists public.portal_clients (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null default 'fee-the-developer'
    check (tenant_id = 'fee-the-developer'),
  email text not null check (email = lower(email) and char_length(email) between 3 and 320),
  display_name text not null check (char_length(display_name) between 1 and 200),
  company text check (company is null or char_length(company) <= 200),
  tier text not null default 'standard' check (tier in ('standard', 'premium')),
  clerk_user_id text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists portal_clients_email_key on public.portal_clients (email);

create table if not exists public.portal_projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.portal_clients (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 200),
  site_url text check (site_url is null or (site_url ~ '^https://' and char_length(site_url) <= 500)),
  status text not null default 'discovery'
    check (status in ('discovery', 'design', 'build', 'review', 'live', 'care')),
  summary text check (summary is null or char_length(summary) <= 2000),
  next_milestone text check (next_milestone is null or char_length(next_milestone) <= 200),
  next_milestone_due date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists portal_projects_client_idx on public.portal_projects (client_id);

create table if not exists public.portal_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.portal_projects (id) on delete cascade,
  kind text not null default 'update' check (kind in ('update', 'milestone', 'launch', 'note')),
  title text not null check (char_length(title) between 1 and 200),
  body text not null check (char_length(body) between 1 and 5000),
  created_at timestamptz not null default now()
);
create index if not exists portal_updates_project_idx on public.portal_updates (project_id, created_at desc);

create table if not exists public.portal_change_requests (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique,
  project_id uuid not null references public.portal_projects (id) on delete cascade,
  client_id uuid not null references public.portal_clients (id) on delete cascade,
  title text not null check (char_length(title) between 3 and 200),
  details text not null check (char_length(details) between 10 and 5000),
  page_url text check (page_url is null or char_length(page_url) <= 500),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  status text not null default 'submitted'
    check (status in ('submitted', 'in_review', 'scheduled', 'in_progress', 'done', 'declined')),
  studio_note text check (studio_note is null or char_length(studio_note) <= 2000),
  created_by_clerk_user_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists portal_change_requests_project_idx
  on public.portal_change_requests (project_id, created_at desc);
create index if not exists portal_change_requests_status_idx on public.portal_change_requests (status);

create table if not exists public.portal_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.portal_projects (id) on delete cascade,
  client_id uuid not null references public.portal_clients (id) on delete cascade,
  change_request_id uuid references public.portal_change_requests (id) on delete set null,
  storage_path text not null unique,
  file_name text not null check (char_length(file_name) between 1 and 200),
  content_type text not null,
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 26214400),
  note text check (note is null or char_length(note) <= 500),
  uploaded_by text not null check (uploaded_by in ('client', 'studio')),
  created_at timestamptz not null default now()
);
create index if not exists portal_files_project_idx on public.portal_files (project_id, created_at desc);

alter table public.portal_clients enable row level security;
alter table public.portal_projects enable row level security;
alter table public.portal_updates enable row level security;
alter table public.portal_change_requests enable row level security;
alter table public.portal_files enable row level security;

revoke all on table public.portal_clients from anon, authenticated;
revoke all on table public.portal_projects from anon, authenticated;
revoke all on table public.portal_updates from anon, authenticated;
revoke all on table public.portal_change_requests from anon, authenticated;
revoke all on table public.portal_files from anon, authenticated;

-- Private bucket for client uploads. Objects are only reachable through
-- short-lived signed URLs the server creates after checking ownership.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'client-uploads',
  'client-uploads',
  false,
  26214400,
  array[
    'image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml',
    'application/pdf', 'text/plain', 'text/csv',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip', 'video/mp4', 'video/quicktime'
  ]
)
on conflict (id) do nothing;
