-- Client portal for feethedeveloper.com /portal.
--
-- Signed-in clients (Clerk) submit change requests, suggestions, website links,
-- and photo/video/file uploads. Every read and write goes through the site's
-- server routes with the Supabase secret key after Clerk has authenticated the
-- user, so anon/authenticated roles get no access to the tables or the bucket.
-- Browsers upload file bytes straight to Storage with a one-time signed upload
-- URL issued by the server; the bytes never pass through the Worker.

create table if not exists public.client_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null default 'fee-the-developer',
  clerk_user_id text not null,
  client_email text,
  client_name text,
  site_slug text,
  kind text not null,
  priority text not null default 'normal',
  title text not null,
  details text,
  website_url text,
  status text not null default 'new',
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint client_requests_tenant_check check (tenant_id = 'fee-the-developer'),
  constraint client_requests_kind_check
    check (kind in ('change', 'suggestion', 'website', 'assets')),
  constraint client_requests_priority_check check (priority in ('normal', 'urgent')),
  constraint client_requests_status_check
    check (status in ('new', 'in_review', 'in_progress', 'done', 'declined')),
  constraint client_requests_length_check check (
    char_length(clerk_user_id) between 1 and 100
    and char_length(title) between 1 and 160
    and (details is null or char_length(details) <= 5000)
    and (website_url is null or char_length(website_url) <= 2048)
    and (client_email is null or char_length(client_email) <= 320)
    and (client_name is null or char_length(client_name) <= 200)
    and (admin_note is null or char_length(admin_note) <= 2000)
    and (site_slug is null or char_length(site_slug) <= 80)
  )
);

create index if not exists client_requests_user_idx
  on public.client_requests (clerk_user_id, created_at desc);
create index if not exists client_requests_status_idx
  on public.client_requests (status, created_at desc);

create table if not exists public.client_files (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.client_requests (id) on delete cascade,
  clerk_user_id text not null,
  storage_path text not null unique,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  uploaded_at timestamptz,
  constraint client_files_status_check check (status in ('pending', 'uploaded')),
  constraint client_files_size_check check (size_bytes between 1 and 524288000),
  constraint client_files_length_check check (
    char_length(file_name) between 1 and 255
    and char_length(mime_type) between 1 and 120
    and char_length(storage_path) <= 600
  )
);

create index if not exists client_files_request_idx on public.client_files (request_id);

-- One shared folder per client (Dropbox / Google Drive / OneDrive link) for
-- large transfers in both directions. Set by Fee The Developer from
-- /portal/admin; the client sees it on /portal.
create table if not exists public.client_spaces (
  clerk_user_id text primary key,
  tenant_id text not null default 'fee-the-developer',
  client_email text,
  share_folder_url text,
  share_provider text,
  share_label text,
  updated_at timestamptz not null default now(),
  constraint client_spaces_tenant_check check (tenant_id = 'fee-the-developer'),
  constraint client_spaces_provider_check
    check (share_provider is null or share_provider in ('dropbox', 'google_drive', 'onedrive', 'other')),
  constraint client_spaces_length_check check (
    char_length(clerk_user_id) between 1 and 100
    and (share_folder_url is null or (char_length(share_folder_url) <= 2048 and share_folder_url like 'https://%'))
    and (share_label is null or char_length(share_label) <= 120)
    and (client_email is null or char_length(client_email) <= 320)
  )
);

alter table public.client_spaces enable row level security;
revoke all on table public.client_spaces from anon, authenticated;

alter table public.client_requests enable row level security;
alter table public.client_files enable row level security;
revoke all on table public.client_requests from anon, authenticated;
revoke all on table public.client_files from anon, authenticated;

-- Private bucket. 500 MB per file; the project-wide upload limit in
-- Storage settings must be at least this high or it wins.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'client-uploads',
  'client-uploads',
  false,
  524288000,
  array[
    'image/*',
    'video/*',
    'application/pdf',
    'application/zip',
    'application/x-zip-compressed',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
