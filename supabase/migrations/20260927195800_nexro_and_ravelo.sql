-- Nexro reactivation and referral records, and Ravelo review requests.

create table if not exists public.reactivations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  customer_name text not null,
  email text,
  phone text,
  kind text not null check (kind in ('winback', 'referral')),
  status text not null default 'scheduled'
    check (status in ('scheduled', 'sent', 'replied', 'won', 'passed')),
  message text not null,
  incentive text,
  last_seen_on date,
  next_touch_on date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reactivations_customer_name_not_blank check (char_length(trim(customer_name)) > 0),
  constraint reactivations_message_not_blank check (char_length(trim(message)) > 0)
);

create index if not exists reactivations_org_status_idx
  on public.reactivations (organization_id, status);
create index if not exists reactivations_org_touch_idx
  on public.reactivations (organization_id, next_touch_on)
  where status in ('scheduled', 'sent') and next_touch_on is not null;

drop trigger if exists reactivations_set_updated_at on public.reactivations;
create trigger reactivations_set_updated_at
before update on public.reactivations
for each row execute function public.set_updated_at();

alter table public.reactivations enable row level security;

drop policy if exists "members can view reactivations" on public.reactivations;
create policy "members can view reactivations" on public.reactivations for select
using (public.is_org_member(organization_id));
drop policy if exists "members can insert reactivations" on public.reactivations;
create policy "members can insert reactivations" on public.reactivations for insert
with check (public.is_org_member(organization_id));
drop policy if exists "members can update reactivations" on public.reactivations;
create policy "members can update reactivations" on public.reactivations for update
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));
drop policy if exists "members can delete reactivations" on public.reactivations;
create policy "members can delete reactivations" on public.reactivations for delete
using (public.is_org_member(organization_id));

grant select, insert, update, delete on public.reactivations to authenticated;

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  customer_name text not null,
  email text,
  phone text,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'requested', 'public', 'private', 'responded')),
  channel text not null default 'google'
    check (channel in ('google', 'trustpilot', 'facebook', 'other', 'private')),
  rating smallint,
  feedback text,
  review_url text,
  requested_on date not null,
  next_follow_up_on date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reviews_customer_name_not_blank check (char_length(trim(customer_name)) > 0),
  constraint reviews_rating_range check (rating is null or (rating >= 1 and rating <= 5))
);

create index if not exists reviews_org_status_idx
  on public.reviews (organization_id, status);
create index if not exists reviews_org_follow_up_idx
  on public.reviews (organization_id, next_follow_up_on)
  where status in ('scheduled', 'requested', 'private') and next_follow_up_on is not null;

drop trigger if exists reviews_set_updated_at on public.reviews;
create trigger reviews_set_updated_at
before update on public.reviews
for each row execute function public.set_updated_at();

alter table public.reviews enable row level security;

drop policy if exists "members can view reviews" on public.reviews;
create policy "members can view reviews" on public.reviews for select
using (public.is_org_member(organization_id));
drop policy if exists "members can insert reviews" on public.reviews;
create policy "members can insert reviews" on public.reviews for insert
with check (public.is_org_member(organization_id));
drop policy if exists "members can update reviews" on public.reviews;
create policy "members can update reviews" on public.reviews for update
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));
drop policy if exists "members can delete reviews" on public.reviews;
create policy "members can delete reviews" on public.reviews for delete
using (public.is_org_member(organization_id));

grant select, insert, update, delete on public.reviews to authenticated;

insert into public.record_link_types (product, entity_table)
values
  ('nexro', 'reactivations'),
  ('ravelo', 'reviews')
on conflict (product) do update set entity_table = excluded.entity_table;

drop trigger if exists reactivations_cleanup_record_links on public.reactivations;
create trigger reactivations_cleanup_record_links
after delete on public.reactivations
for each row execute function public.cleanup_record_links('nexro');

drop trigger if exists reviews_cleanup_record_links on public.reviews;
create trigger reviews_cleanup_record_links
after delete on public.reviews
for each row execute function public.cleanup_record_links('ravelo');

update public.products
set status = 'active',
    name = 'Nexro',
    description = 'Customer reactivation and referral automation',
    accent = '#1E40AF'
where slug = 'nexro';

update public.products
set status = 'active',
    name = 'Ravelo',
    description = 'Review automation',
    accent = '#1D4ED8'
where slug = 'ravelo';

insert into public.prices (product_id, stripe_price_id, currency, unit_amount, interval, active)
select id, 'price_1UKMOWV05bHNwI4WpBB2w9mc', 'eur', 9000, 'month', true
from public.products
where slug = 'nexro'
on conflict (stripe_price_id) do update
set product_id = excluded.product_id,
    currency = excluded.currency,
    unit_amount = excluded.unit_amount,
    interval = excluded.interval,
    active = excluded.active;

insert into public.prices (product_id, stripe_price_id, currency, unit_amount, interval, active)
select id, 'price_1UKMOXV05bHNwI4Wwwxs33wT', 'eur', 9000, 'month', true
from public.products
where slug = 'ravelo'
on conflict (stripe_price_id) do update
set product_id = excluded.product_id,
    currency = excluded.currency,
    unit_amount = excluded.unit_amount,
    interval = excluded.interval,
    active = excluded.active;
