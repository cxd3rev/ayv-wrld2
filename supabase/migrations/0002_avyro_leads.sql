-- Avyro lead conversion
-- Org-scoped leads so members only see their own workspace.

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  email text,
  phone text,
  status text not null default 'new' check (status in ('new', 'contacted', 'won', 'lost')),
  notes text,
  follow_up_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint leads_name_not_blank check (char_length(trim(name)) > 0)
);

create index if not exists leads_org_id_idx on public.leads (organization_id);
create index if not exists leads_org_status_idx on public.leads (organization_id, status);
create index if not exists leads_org_follow_up_idx on public.leads (organization_id, follow_up_on);

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

alter table public.leads enable row level security;

drop policy if exists "members can view leads" on public.leads;
create policy "members can view leads"
on public.leads for select
using (public.is_org_member(organization_id));

drop policy if exists "members can insert leads" on public.leads;
create policy "members can insert leads"
on public.leads for insert
with check (public.is_org_member(organization_id));

drop policy if exists "members can update leads" on public.leads;
create policy "members can update leads"
on public.leads for update
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

drop policy if exists "members can delete leads" on public.leads;
create policy "members can delete leads"
on public.leads for delete
using (public.is_org_member(organization_id));

grant select, insert, update, delete on table public.leads to authenticated;
