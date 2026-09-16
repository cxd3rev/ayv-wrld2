-- AYV WRLD foundation schema
-- Run this in the Supabase SQL editor (or with the Supabase CLI).
-- It creates tables, indexes, Row Level Security, and helper functions.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Profiles: one row per auth user
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Organizations: a business using AYV WRLD
-- ---------------------------------------------------------------------------
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  website text,
  industry text,
  email text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Organization members + roles
-- ---------------------------------------------------------------------------
create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table if not exists public.organization_invites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  email text not null,
  role text not null check (role in ('admin', 'member')),
  invited_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (organization_id, email)
);

-- ---------------------------------------------------------------------------
-- Product catalog (Avyro, Velto, ...)
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  status text not null default 'coming_soon' check (status in ('active', 'coming_soon')),
  accent text,
  created_at timestamptz not null default now()
);

create table if not exists public.organization_products (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  enabled boolean not null default false,
  created_at timestamptz not null default now(),
  unique (organization_id, product_id)
);

create table if not exists public.prices (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  stripe_price_id text unique,
  currency text not null default 'usd',
  unit_amount integer,
  interval text check (interval in ('month', 'year')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Billing
-- ---------------------------------------------------------------------------
create table if not exists public.billing_customers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.organizations (id) on delete cascade,
  stripe_customer_id text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  billing_customer_id uuid references public.billing_customers (id) on delete set null,
  product_id uuid references public.products (id) on delete set null,
  price_id uuid references public.prices (id) on delete set null,
  stripe_subscription_id text unique,
  stripe_customer_id text,
  status text not null check (status in ('active', 'trialing', 'past_due', 'cancelled', 'incomplete')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Email log + notifications
-- ---------------------------------------------------------------------------
create table if not exists public.email_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id) on delete set null,
  user_id uuid references public.profiles (id) on delete set null,
  to_email text not null,
  template text not null,
  status text not null check (status in ('queued', 'sent', 'failed')),
  provider_id text,
  error text,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'info' check (type in ('info', 'success', 'warning', 'billing')),
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index if not exists organization_members_user_id_idx on public.organization_members (user_id);
create index if not exists organization_members_org_id_idx on public.organization_members (organization_id);
create index if not exists notifications_user_unread_idx on public.notifications (user_id, read);
create index if not exists subscriptions_org_id_idx on public.subscriptions (organization_id);
create index if not exists email_events_org_id_idx on public.email_events (organization_id);
create index if not exists organization_invites_email_idx on public.organization_invites (email);

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists organizations_set_updated_at on public.organizations;
create trigger organizations_set_updated_at
before update on public.organizations
for each row execute function public.set_updated_at();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- New user -> profile, then accept any pending invites
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name);

  insert into public.organization_members (organization_id, user_id, role)
  select organization_id, new.id, role
  from public.organization_invites
  where lower(email) = lower(new.email)
  on conflict (organization_id, user_id) do nothing;

  delete from public.organization_invites
  where lower(email) = lower(new.email);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Create org + owner membership in one trusted step (used by onboarding)
-- ---------------------------------------------------------------------------
create or replace function public.create_organization(
  org_name text,
  org_slug text,
  org_industry text default null,
  org_website text default null,
  org_email text default null,
  org_phone text default null
)
returns public.organizations
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org public.organizations;
  unique_slug text := org_slug;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if exists (select 1 from public.organizations where slug = unique_slug) then
    unique_slug := org_slug || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6);
  end if;

  insert into public.organizations (name, slug, industry, website, email, phone)
  values (org_name, unique_slug, org_industry, org_website, org_email, org_phone)
  returning * into new_org;

  insert into public.organization_members (organization_id, user_id, role)
  values (new_org.id, auth.uid(), 'owner');

  insert into public.organization_products (organization_id, product_id, enabled)
  select new_org.id, p.id, (p.slug = 'avyro')
  from public.products p;

  return new_org;
end;
$$;

grant execute on function public.create_organization(text, text, text, text, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- RLS helpers. SECURITY DEFINER avoids infinite recursion on member checks.
-- ---------------------------------------------------------------------------
create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members
    where organization_id = org_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.is_org_admin(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members
    where organization_id = org_id
      and user_id = auth.uid()
      and role in ('owner', 'admin')
  );
$$;

-- ---------------------------------------------------------------------------
-- Enable RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.organization_invites enable row level security;
alter table public.products enable row level security;
alter table public.organization_products enable row level security;
alter table public.prices enable row level security;
alter table public.billing_customers enable row level security;
alter table public.subscriptions enable row level security;
alter table public.email_events enable row level security;
alter table public.notifications enable row level security;

-- Profiles
drop policy if exists "users can view own profile" on public.profiles;
create policy "users can view own profile"
on public.profiles for select
using (id = auth.uid());

drop policy if exists "members can view teammate profiles" on public.profiles;
create policy "members can view teammate profiles"
on public.profiles for select
using (
  exists (
    select 1
    from public.organization_members mine
    join public.organization_members theirs
      on mine.organization_id = theirs.organization_id
    where mine.user_id = auth.uid()
      and theirs.user_id = profiles.id
  )
);

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

-- Organizations
drop policy if exists "members can view their organizations" on public.organizations;
create policy "members can view their organizations"
on public.organizations for select
using (public.is_org_member(id));

drop policy if exists "admins can update their organizations" on public.organizations;
create policy "admins can update their organizations"
on public.organizations for update
using (public.is_org_admin(id))
with check (public.is_org_admin(id));

-- Members
drop policy if exists "members can view roster" on public.organization_members;
create policy "members can view roster"
on public.organization_members for select
using (public.is_org_member(organization_id));

drop policy if exists "admins can insert members" on public.organization_members;
create policy "admins can insert members"
on public.organization_members for insert
with check (public.is_org_admin(organization_id));

drop policy if exists "owners can update members" on public.organization_members;
create policy "owners can update members"
on public.organization_members for update
using (
  exists (
    select 1 from public.organization_members owners
    where owners.organization_id = organization_members.organization_id
      and owners.user_id = auth.uid()
      and owners.role = 'owner'
  )
);

-- Invites
drop policy if exists "admins can view invites" on public.organization_invites;
create policy "admins can view invites"
on public.organization_invites for select
using (public.is_org_admin(organization_id));

drop policy if exists "admins can create invites" on public.organization_invites;
create policy "admins can create invites"
on public.organization_invites for insert
with check (public.is_org_admin(organization_id) and invited_by = auth.uid());

-- Product catalog is readable by signed-in users
drop policy if exists "authenticated can read products" on public.products;
create policy "authenticated can read products"
on public.products for select
to authenticated
using (true);

drop policy if exists "authenticated can read prices" on public.prices;
create policy "authenticated can read prices"
on public.prices for select
to authenticated
using (true);

drop policy if exists "members can view org products" on public.organization_products;
create policy "members can view org products"
on public.organization_products for select
using (public.is_org_member(organization_id));

drop policy if exists "members can view billing customers" on public.billing_customers;
create policy "members can view billing customers"
on public.billing_customers for select
using (public.is_org_member(organization_id));

drop policy if exists "admins can write billing customers" on public.billing_customers;
create policy "admins can write billing customers"
on public.billing_customers for all
using (public.is_org_admin(organization_id))
with check (public.is_org_admin(organization_id));

drop policy if exists "members can view subscriptions" on public.subscriptions;
create policy "members can view subscriptions"
on public.subscriptions for select
using (public.is_org_member(organization_id));

drop policy if exists "admins can write subscriptions" on public.subscriptions;
create policy "admins can write subscriptions"
on public.subscriptions for all
using (public.is_org_admin(organization_id))
with check (public.is_org_admin(organization_id));

drop policy if exists "members can view email events" on public.email_events;
create policy "members can view email events"
on public.email_events for select
using (organization_id is null or public.is_org_member(organization_id));

drop policy if exists "members can insert email events" on public.email_events;
create policy "members can insert email events"
on public.email_events for insert
with check (organization_id is null or public.is_org_member(organization_id));

drop policy if exists "users can view own notifications" on public.notifications;
create policy "users can view own notifications"
on public.notifications for select
using (user_id = auth.uid() and public.is_org_member(organization_id));

drop policy if exists "users can update own notifications" on public.notifications;
create policy "users can update own notifications"
on public.notifications for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "members can insert notifications" on public.notifications;
create policy "members can insert notifications"
on public.notifications for insert
with check (public.is_org_member(organization_id));

-- ---------------------------------------------------------------------------
-- Seed AYV WRLD products
-- ---------------------------------------------------------------------------
insert into public.products (slug, name, description, status, accent)
values
  ('avyro', 'Avyro', 'Lead conversion automation', 'active', '#F0A202'),
  ('velto', 'Velto', 'Booking and reminder automation', 'coming_soon', '#F97316'),
  ('rovyn', 'Rovyn', 'Quote follow-up automation', 'coming_soon', '#E8A317'),
  ('orvyn', 'Orvyn', 'Payment and invoice follow-up automation', 'coming_soon', '#FB923C'),
  ('nexro', 'Nexro', 'Customer reactivation and referral automation', 'coming_soon', '#F59E0B'),
  ('ravelo', 'Ravelo', 'Review automation', 'coming_soon', '#FBBF24')
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description,
    status = excluded.status,
    accent = excluded.accent;
