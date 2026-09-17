-- Rovyn Stripe catalog price
-- Maps the test-mode monthly price so webhooks can attach subscriptions to Rovyn.

insert into public.prices (product_id, stripe_price_id, currency, unit_amount, interval, active)
select p.id, v.stripe_price_id, 'eur', 8999, 'month', true
from (
  values
    ('rovyn', 'price_1UGlkJV05bHNwI4WyHW2P9WH')
) as v(slug, stripe_price_id)
join public.products p on p.slug = v.slug
on conflict (stripe_price_id) do update
set product_id = excluded.product_id,
    currency = excluded.currency,
    unit_amount = excluded.unit_amount,
    interval = excluded.interval,
    active = excluded.active;

update public.products
set status = 'active',
    description = 'Quote follow-up automation'
where slug = 'rovyn';
