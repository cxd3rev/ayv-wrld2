-- Contacts Nexro may email, and addresses that opted out of Nexro and Ravelo.

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  relationship text not null check (relationship in ('existing_customer', 'consent')),
  consent_source text,
  consent_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contacts_name_not_blank check (char_length(trim(name)) > 0),
  constraint contacts_email_lower check (email = lower(email) and char_length(trim(email)) > 0),
  constraint contacts_consent_details check (
    relationship = 'existing_customer'
    or (
      consent_source is not null
      and char_length(trim(consent_source)) > 0
      and consent_date is not null
    )
  )
);

create unique index if not exists contacts_org_email_key
  on public.contacts (organization_id, email);

drop trigger if exists contacts_set_updated_at on public.contacts;
create trigger contacts_set_updated_at
before update on public.contacts
for each row execute function public.set_updated_at();

alter table public.contacts enable row level security;

drop policy if exists "members can view contacts" on public.contacts;
create policy "members can view contacts" on public.contacts for select
using (public.is_org_member(organization_id));
drop policy if exists "members can insert contacts" on public.contacts;
create policy "members can insert contacts" on public.contacts for insert
with check (public.is_org_member(organization_id));
drop policy if exists "members can update contacts" on public.contacts;
create policy "members can update contacts" on public.contacts for update
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));
drop policy if exists "members can delete contacts" on public.contacts;
create policy "members can delete contacts" on public.contacts for delete
using (public.is_org_member(organization_id));

revoke all on public.contacts from anon, authenticated;
grant select, insert, update, delete on public.contacts to authenticated;

create table if not exists public.suppression_list (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.organizations (id) on delete cascade,
  email text not null,
  reason text not null,
  created_at timestamptz not null default now(),
  constraint suppression_email_lower check (email = lower(email) and char_length(trim(email)) > 0),
  constraint suppression_reason_not_blank check (char_length(trim(reason)) > 0),
  unique (workspace_id, email)
);

create index if not exists suppression_list_workspace_email_idx
  on public.suppression_list (workspace_id, email);

alter table public.suppression_list enable row level security;

drop policy if exists "members can view suppression list" on public.suppression_list;
create policy "members can view suppression list" on public.suppression_list for select
using (public.is_org_member(workspace_id));

revoke all on public.suppression_list from anon, authenticated;
grant select on public.suppression_list to authenticated;
