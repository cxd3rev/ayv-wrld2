-- Per-product Stripe subscriptions (Avyro + Velto)
-- One Stripe subscription row per Stripe subscription id, so an org can buy both.
-- organization_products.enabled is the entitlement flag updated by the webhook.

alter table public.subscriptions
  add column if not exists stripe_price_id text;

create index if not exists subscriptions_org_product_idx
  on public.subscriptions (organization_id, product_id);

create index if not exists subscriptions_org_price_idx
  on public.subscriptions (organization_id, stripe_price_id);

update public.products
set status = 'active',
    description = 'Booking and reminder automation'
where slug = 'velto';

insert into public.prices (product_id, stripe_price_id, currency, unit_amount, interval, active)
select p.id, v.stripe_price_id, 'eur', 4999, 'month', true
from (
  values
    ('avyro', 'price_1UGfwEV05bHNwI4Wgwd8IUTt'),
    ('velto', 'price_1UGiKnV05bHNwI4WUPKCUXiG')
) as v(slug, stripe_price_id)
join public.products p on p.slug = v.slug
on conflict (stripe_price_id) do update
set product_id = excluded.product_id,
    currency = excluded.currency,
    unit_amount = excluded.unit_amount,
    interval = excluded.interval,
    active = excluded.active;

-- Entitlements stay member-readable; only the service role (webhook) writes them.
drop policy if exists "members can view org products" on public.organization_products;
create policy "members can view org products"
on public.organization_products for select
using (public.is_org_member(organization_id));

drop policy if exists "admins can write org products" on public.organization_products;
create policy "admins can write org products"
on public.organization_products for all
using (public.is_org_admin(organization_id))
with check (public.is_org_admin(organization_id));
