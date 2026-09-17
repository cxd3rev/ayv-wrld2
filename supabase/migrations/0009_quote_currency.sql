-- Store each Rovyn quote's currency so pipeline totals remain honest.
-- Existing rows were entered through a euro-labelled field, so preserve
-- their meaning by backfilling them to EUR via the default.

alter table public.quotes
add column if not exists currency text not null default 'EUR';

alter table public.quotes
drop constraint if exists quotes_currency_iso_code;

alter table public.quotes
add constraint quotes_currency_iso_code
check (currency ~ '^[A-Z]{3}$');
