-- Keep historical prices mapped for existing subscriptions while making the
-- whole-euro prices the only active choices for new checkouts.
update public.prices
set active = false
where stripe_price_id in (
  'price_1UGfwEV05bHNwI4Wgwd8IUTt',
  'price_1UGiKnV05bHNwI4WUPKCUXiG',
  'price_1UGlkJV05bHNwI4WyHW2P9WH',
  'price_1UGnkrV05bHNwI4W2UBrFrKc'
);

insert into public.prices (product_id, stripe_price_id, currency, unit_amount, interval, active)
select p.id, v.stripe_price_id, 'eur', v.unit_amount, 'month', true
from (
  values
    ('avyro', 'price_1UGoAcV05bHNwI4WhutfWSOT', 4900),
    ('velto', 'price_1UGoAdV05bHNwI4Wzx1Dr7pi', 4900),
    ('rovyn', 'price_1UGoBTV05bHNwI4WffhSPoXs', 8900),
    ('orvyn', 'price_1UGoAcV05bHNwI4W7qgb9GzE', 8900)
) as v(slug, stripe_price_id, unit_amount)
join public.products p on p.slug = v.slug
on conflict (stripe_price_id) do update
set product_id = excluded.product_id,
    currency = excluded.currency,
    unit_amount = excluded.unit_amount,
    interval = excluded.interval,
    active = excluded.active;
