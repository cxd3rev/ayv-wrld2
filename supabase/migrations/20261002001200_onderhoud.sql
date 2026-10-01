-- AYV Onderhoud v1. Old module tables are left in place.

create table if not exists public.onderhoud_customers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  email text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, organization_id),
  constraint onderhoud_customers_email_check check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

create table if not exists public.onderhoud_addresses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  customer_id uuid not null,
  street text not null,
  postal_code text not null,
  municipality text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, organization_id),
  foreign key (customer_id, organization_id)
    references public.onderhoud_customers (id, organization_id) on delete cascade
);

create table if not exists public.onderhoud_boilers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  address_id uuid not null,
  fuel_type text not null check (fuel_type in ('gas', 'oil', 'solid_fuel', 'heat_pump')),
  power_kw numeric(6, 2) not null check (power_kw > 0 and power_kw <= 9999),
  brand text,
  model text,
  installed_on date not null,
  last_maintenance_on date,
  last_audit_on date,
  optional_interval_months integer check (
    optional_interval_months is null
    or (optional_interval_months >= 1 and optional_interval_months <= 60)
  ),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, organization_id),
  foreign key (address_id, organization_id)
    references public.onderhoud_addresses (id, organization_id) on delete cascade
);

create table if not exists public.onderhoud_settings (
  organization_id uuid primary key references public.organizations (id) on delete cascade,
  reminder_lead_days integer not null default 30 check (reminder_lead_days >= 1 and reminder_lead_days <= 90),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.onderhoud_slots (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, organization_id),
  check (ends_at > starts_at)
);

create table if not exists public.onderhoud_bookings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  slot_id uuid not null,
  customer_name text not null,
  email text not null,
  phone text,
  created_at timestamptz not null default now(),
  unique (slot_id),
  foreign key (slot_id, organization_id)
    references public.onderhoud_slots (id, organization_id) on delete cascade,
  constraint onderhoud_bookings_email_check check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

create table if not exists public.onderhoud_visits (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  boiler_id uuid not null,
  visited_on date not null,
  notes text,
  certificate_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (boiler_id, organization_id)
    references public.onderhoud_boilers (id, organization_id) on delete cascade
);

create index if not exists onderhoud_customers_org_idx on public.onderhoud_customers (organization_id);
create index if not exists onderhoud_addresses_org_idx on public.onderhoud_addresses (organization_id);
create index if not exists onderhoud_addresses_municipality_idx on public.onderhoud_addresses (organization_id, municipality);
create index if not exists onderhoud_boilers_org_idx on public.onderhoud_boilers (organization_id);
create index if not exists onderhoud_slots_org_idx on public.onderhoud_slots (organization_id, starts_at);
create index if not exists onderhoud_visits_boiler_idx on public.onderhoud_visits (boiler_id);

create or replace function public.touch_onderhoud_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists onderhoud_customers_touch on public.onderhoud_customers;
create trigger onderhoud_customers_touch before update on public.onderhoud_customers
for each row execute function public.touch_onderhoud_updated_at();

drop trigger if exists onderhoud_addresses_touch on public.onderhoud_addresses;
create trigger onderhoud_addresses_touch before update on public.onderhoud_addresses
for each row execute function public.touch_onderhoud_updated_at();

drop trigger if exists onderhoud_boilers_touch on public.onderhoud_boilers;
create trigger onderhoud_boilers_touch before update on public.onderhoud_boilers
for each row execute function public.touch_onderhoud_updated_at();

drop trigger if exists onderhoud_settings_touch on public.onderhoud_settings;
create trigger onderhoud_settings_touch before update on public.onderhoud_settings
for each row execute function public.touch_onderhoud_updated_at();

drop trigger if exists onderhoud_slots_touch on public.onderhoud_slots;
create trigger onderhoud_slots_touch before update on public.onderhoud_slots
for each row execute function public.touch_onderhoud_updated_at();

drop trigger if exists onderhoud_visits_touch on public.onderhoud_visits;
create trigger onderhoud_visits_touch before update on public.onderhoud_visits
for each row execute function public.touch_onderhoud_updated_at();

alter table public.onderhoud_customers enable row level security;
alter table public.onderhoud_addresses enable row level security;
alter table public.onderhoud_boilers enable row level security;
alter table public.onderhoud_settings enable row level security;
alter table public.onderhoud_slots enable row level security;
alter table public.onderhoud_bookings enable row level security;
alter table public.onderhoud_visits enable row level security;

do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'onderhoud_customers',
    'onderhoud_addresses',
    'onderhoud_boilers',
    'onderhoud_settings',
    'onderhoud_slots',
    'onderhoud_bookings',
    'onderhoud_visits'
  ]
  loop
    execute format('drop policy if exists "members select %1$s" on public.%1$s', tbl);
    execute format(
      'create policy "members select %1$s" on public.%1$s for select using (public.is_org_member(organization_id))',
      tbl
    );
    execute format('drop policy if exists "members insert %1$s" on public.%1$s', tbl);
    execute format(
      'create policy "members insert %1$s" on public.%1$s for insert with check (public.is_org_member(organization_id))',
      tbl
    );
    execute format('drop policy if exists "members update %1$s" on public.%1$s', tbl);
    execute format(
      'create policy "members update %1$s" on public.%1$s for update using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id))',
      tbl
    );
    execute format('drop policy if exists "members delete %1$s" on public.%1$s', tbl);
    execute format(
      'create policy "members delete %1$s" on public.%1$s for delete using (public.is_org_member(organization_id))',
      tbl
    );
    execute format('grant select, insert, update, delete on public.%1$s to authenticated', tbl);
  end loop;
end $$;

insert into storage.buckets (id, name, public)
values ('certificates', 'certificates', false)
on conflict (id) do update set public = false;

drop policy if exists "org members read certificates" on storage.objects;
create policy "org members read certificates"
on storage.objects for select to authenticated
using (
  bucket_id = 'certificates'
  and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  and public.is_org_member(((storage.foldername(name))[1])::uuid)
);

drop policy if exists "org members insert certificates" on storage.objects;
create policy "org members insert certificates"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'certificates'
  and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  and public.is_org_member(((storage.foldername(name))[1])::uuid)
);

drop policy if exists "org members update certificates" on storage.objects;
create policy "org members update certificates"
on storage.objects for update to authenticated
using (
  bucket_id = 'certificates'
  and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  and public.is_org_member(((storage.foldername(name))[1])::uuid)
)
with check (
  bucket_id = 'certificates'
  and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  and public.is_org_member(((storage.foldername(name))[1])::uuid)
);

drop policy if exists "org members delete certificates" on storage.objects;
create policy "org members delete certificates"
on storage.objects for delete to authenticated
using (
  bucket_id = 'certificates'
  and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  and public.is_org_member(((storage.foldername(name))[1])::uuid)
);
