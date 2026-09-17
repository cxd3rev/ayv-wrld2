-- Velto booking + reminders
-- Org-scoped appointments so members only see their own workspace.

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  customer_name text not null,
  email text,
  phone text,
  service text not null,
  starts_on date not null,
  start_time time not null,
  status text not null default 'scheduled' check (
    status in ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')
  ),
  reminder_on date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bookings_customer_name_not_blank check (char_length(trim(customer_name)) > 0),
  constraint bookings_service_not_blank check (char_length(trim(service)) > 0)
);

create index if not exists bookings_org_id_idx on public.bookings (organization_id);
create index if not exists bookings_org_status_idx on public.bookings (organization_id, status);
create index if not exists bookings_org_starts_idx on public.bookings (organization_id, starts_on, start_time);
create index if not exists bookings_org_reminder_idx on public.bookings (organization_id, reminder_on);

drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at
before update on public.bookings
for each row execute function public.set_updated_at();

alter table public.bookings enable row level security;

drop policy if exists "members can view bookings" on public.bookings;
create policy "members can view bookings"
on public.bookings for select
using (public.is_org_member(organization_id));

drop policy if exists "members can insert bookings" on public.bookings;
create policy "members can insert bookings"
on public.bookings for insert
with check (public.is_org_member(organization_id));

drop policy if exists "members can update bookings" on public.bookings;
create policy "members can update bookings"
on public.bookings for update
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

drop policy if exists "members can delete bookings" on public.bookings;
create policy "members can delete bookings"
on public.bookings for delete
using (public.is_org_member(organization_id));

grant select, insert, update, delete on table public.bookings to authenticated;

update public.products
set status = 'active',
    name = 'Velto',
    description = 'Booking and reminder automation',
    accent = '#7C3AED'
where slug = 'velto';
