-- Shared client record and the new module jobs.
-- Existing leads, bookings, quotes, and invoices are left in place.
-- A lead has no visit date, a booking time is not a renewal, a quote amount
-- is not a visit rhythm, and an invoice is not a visit count, so those rows
-- are not copied into the new tables.

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  email text,
  phone text,
  last_activity_on date,
  visit_count integer not null default 0,
  loyalty_status text not null default 'none' check (loyalty_status in ('none', 'loyal')),
  churn_status text not null default 'none' check (churn_status in ('none', 'at_risk')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint clients_name_not_blank check (char_length(trim(name)) > 0),
  constraint clients_visit_count_non_negative check (visit_count >= 0)
);

create unique index if not exists clients_org_email_idx
  on public.clients (organization_id, lower(email))
  where email is not null and char_length(trim(email)) > 0;

create index if not exists clients_org_idx on public.clients (organization_id);

drop trigger if exists clients_set_updated_at on public.clients;
create trigger clients_set_updated_at
before update on public.clients
for each row execute function public.set_updated_at();

alter table public.clients enable row level security;

drop policy if exists "members can view clients" on public.clients;
create policy "members can view clients" on public.clients for select
using (public.is_org_member(organization_id));
drop policy if exists "members can insert clients" on public.clients;
create policy "members can insert clients" on public.clients for insert
with check (public.is_org_member(organization_id));
drop policy if exists "members can update clients" on public.clients;
create policy "members can update clients" on public.clients for update
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));
drop policy if exists "members can delete clients" on public.clients;
create policy "members can delete clients" on public.clients for delete
using (public.is_org_member(organization_id));

grant select, insert, update, delete on public.clients to authenticated;

create table if not exists public.module_settings (
  organization_id uuid not null references public.organizations (id) on delete cascade,
  product text not null check (product in ('avyro', 'velto', 'rovyn', 'orvyn')),
  check_in_delay_days integer not null default 1,
  renewal_lead_days integer not null default 7,
  churn_margin_days integer not null default 7,
  loyalty_threshold integer not null default 3,
  send_thank_you boolean not null default true,
  primary key (organization_id, product),
  constraint module_settings_delay check (check_in_delay_days between 0 and 60),
  constraint module_settings_lead check (renewal_lead_days between 1 and 90),
  constraint module_settings_margin check (churn_margin_days between 0 and 180),
  constraint module_settings_threshold check (loyalty_threshold between 1 and 100)
);

alter table public.module_settings enable row level security;

drop policy if exists "members can view module settings" on public.module_settings;
create policy "members can view module settings" on public.module_settings for select
using (public.is_org_member(organization_id));
drop policy if exists "members can insert module settings" on public.module_settings;
create policy "members can insert module settings" on public.module_settings for insert
with check (public.is_org_member(organization_id));
drop policy if exists "members can update module settings" on public.module_settings;
create policy "members can update module settings" on public.module_settings for update
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

grant select, insert, update on public.module_settings to authenticated;

create table if not exists public.check_ins (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  served_on date not null,
  check_in_on date not null,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'sent', 'positive', 'neutral', 'negative')),
  reply_token uuid not null unique default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists check_ins_org_idx on public.check_ins (organization_id, check_in_on);
create index if not exists check_ins_client_idx on public.check_ins (client_id);

drop trigger if exists check_ins_set_updated_at on public.check_ins;
create trigger check_ins_set_updated_at
before update on public.check_ins
for each row execute function public.set_updated_at();

alter table public.check_ins enable row level security;
drop policy if exists "members can view check ins" on public.check_ins;
create policy "members can view check ins" on public.check_ins for select
using (public.is_org_member(organization_id));
drop policy if exists "members can insert check ins" on public.check_ins;
create policy "members can insert check ins" on public.check_ins for insert
with check (public.is_org_member(organization_id));
drop policy if exists "members can update check ins" on public.check_ins;
create policy "members can update check ins" on public.check_ins for update
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));
drop policy if exists "members can delete check ins" on public.check_ins;
create policy "members can delete check ins" on public.check_ins for delete
using (public.is_org_member(organization_id));
grant select, insert, update, delete on public.check_ins to authenticated;

create table if not exists public.renewals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  plan_name text not null,
  renews_on date not null,
  reminder_on date not null,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'reminded', 'renewed', 'lapsed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint renewals_plan_not_blank check (char_length(trim(plan_name)) > 0)
);

create index if not exists renewals_org_idx on public.renewals (organization_id, renews_on);

drop trigger if exists renewals_set_updated_at on public.renewals;
create trigger renewals_set_updated_at
before update on public.renewals
for each row execute function public.set_updated_at();

alter table public.renewals enable row level security;
drop policy if exists "members can view renewals" on public.renewals;
create policy "members can view renewals" on public.renewals for select
using (public.is_org_member(organization_id));
drop policy if exists "members can insert renewals" on public.renewals;
create policy "members can insert renewals" on public.renewals for insert
with check (public.is_org_member(organization_id));
drop policy if exists "members can update renewals" on public.renewals;
create policy "members can update renewals" on public.renewals for update
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));
drop policy if exists "members can delete renewals" on public.renewals;
create policy "members can delete renewals" on public.renewals for delete
using (public.is_org_member(organization_id));
grant select, insert, update, delete on public.renewals to authenticated;

create table if not exists public.churn_watches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  frequency_days integer not null,
  last_activity_on date not null,
  status text not null default 'watching' check (status in ('watching', 'at_risk')),
  origin text not null default 'manual' check (origin in ('manual', 'velto')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint churn_watches_frequency check (frequency_days between 1 and 365),
  unique (organization_id, client_id)
);

create index if not exists churn_watches_org_idx on public.churn_watches (organization_id, status);

drop trigger if exists churn_watches_set_updated_at on public.churn_watches;
create trigger churn_watches_set_updated_at
before update on public.churn_watches
for each row execute function public.set_updated_at();

alter table public.churn_watches enable row level security;
drop policy if exists "members can view churn watches" on public.churn_watches;
create policy "members can view churn watches" on public.churn_watches for select
using (public.is_org_member(organization_id));
drop policy if exists "members can insert churn watches" on public.churn_watches;
create policy "members can insert churn watches" on public.churn_watches for insert
with check (public.is_org_member(organization_id));
drop policy if exists "members can update churn watches" on public.churn_watches;
create policy "members can update churn watches" on public.churn_watches for update
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));
drop policy if exists "members can delete churn watches" on public.churn_watches;
create policy "members can delete churn watches" on public.churn_watches for delete
using (public.is_org_member(organization_id));
grant select, insert, update, delete on public.churn_watches to authenticated;

create table if not exists public.loyalty_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  visit_count integer not null default 0,
  status text not null default 'tracking' check (status in ('tracking', 'loyal')),
  origin text not null default 'manual' check (origin in ('manual', 'avyro')),
  thank_you_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint loyalty_visit_count check (visit_count >= 0),
  unique (organization_id, client_id)
);

create index if not exists loyalty_records_org_idx on public.loyalty_records (organization_id, status);

drop trigger if exists loyalty_records_set_updated_at on public.loyalty_records;
create trigger loyalty_records_set_updated_at
before update on public.loyalty_records
for each row execute function public.set_updated_at();

alter table public.loyalty_records enable row level security;
drop policy if exists "members can view loyalty records" on public.loyalty_records;
create policy "members can view loyalty records" on public.loyalty_records for select
using (public.is_org_member(organization_id));
drop policy if exists "members can insert loyalty records" on public.loyalty_records;
create policy "members can insert loyalty records" on public.loyalty_records for insert
with check (public.is_org_member(organization_id));
drop policy if exists "members can update loyalty records" on public.loyalty_records;
create policy "members can update loyalty records" on public.loyalty_records for update
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));
drop policy if exists "members can delete loyalty records" on public.loyalty_records;
create policy "members can delete loyalty records" on public.loyalty_records for delete
using (public.is_org_member(organization_id));
grant select, insert, update, delete on public.loyalty_records to authenticated;

alter table public.reactivations
  add column if not exists origin text not null default 'manual',
  add column if not exists client_id uuid references public.clients (id) on delete set null;

alter table public.reactivations drop constraint if exists reactivations_origin_check;
alter table public.reactivations
  add constraint reactivations_origin_check check (origin in ('manual', 'rovyn', 'orvyn'));

alter table public.reviews
  add column if not exists origin text not null default 'manual',
  add column if not exists client_id uuid references public.clients (id) on delete set null;

alter table public.reviews drop constraint if exists reviews_origin_check;
alter table public.reviews
  add constraint reviews_origin_check check (origin in ('manual', 'avyro'));
