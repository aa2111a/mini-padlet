create extension if not exists pgcrypto;

create table if not exists public.memos (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 80),
  content text not null check (char_length(content) between 1 and 2000),
  password_hash text not null,
  created_at timestamptz not null default now()
);

alter table public.memos enable row level security;

revoke all on table public.memos from anon, authenticated;
grant usage on schema public to anon, authenticated, service_role;
grant select (id, title, content, created_at) on public.memos to anon;
grant insert (title, content, password_hash) on public.memos to anon;
grant select (id, title, content, created_at) on public.memos to authenticated;
grant insert (title, content, password_hash) on public.memos to authenticated;
grant select, insert, delete on table public.memos to service_role;

drop policy if exists "Anyone can read memos" on public.memos;
create policy "Anyone can read memos"
on public.memos
for select
to anon, authenticated
using (true);

drop policy if exists "Anyone can create memos" on public.memos;
create policy "Anyone can create memos"
on public.memos
for insert
to anon, authenticated
with check (
  char_length(title) between 1 and 80
  and char_length(content) between 1 and 2000
  and password_hash ~ '^\$2[aby]\$12\$[./A-Za-z0-9]{53}$'
);

create index if not exists memos_created_at_idx
on public.memos (created_at desc);

-- No public UPDATE/DELETE policy. Deletion runs only through verified server APIs.
-- password_hash has no public SELECT grant, including via the Data API.

-- Atomic persistent rate limits, shared across Vercel instances.
create table if not exists public.request_limits (
  key text primary key,
  attempts integer not null,
  expires_at timestamptz not null
);
alter table public.request_limits enable row level security;
revoke all on public.request_limits from public, anon, authenticated;
grant select, insert, update, delete on public.request_limits to service_role;
create or replace function public.consume_request(bucket_key text, max_attempts integer)
returns boolean language plpgsql security definer set search_path = '' as $$
declare count_now integer;
begin
  delete from public.request_limits where expires_at < now();
  insert into public.request_limits as limits (key, attempts, expires_at)
  values (bucket_key, 1, now() + interval '15 minutes')
  on conflict (key) do update set attempts = limits.attempts + 1
  returning attempts into count_now;
  return count_now <= max_attempts;
end;
$$;
revoke all on function public.consume_request(text, integer) from public, anon, authenticated;
grant execute on function public.consume_request(text, integer) to service_role;
