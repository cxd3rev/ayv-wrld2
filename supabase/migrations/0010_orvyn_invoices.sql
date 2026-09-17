-- Orvyn payment and invoice follow-up.

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  customer_name text not null,
  email text,
  phone text,
  invoice_number text not null,
  description text not null,
  amount numeric(12, 2) not null,
  currency text not null default 'EUR',
  status text not null default 'sent'
    check (status in ('draft', 'sent', 'overdue', 'paid', 'void')),
  issued_on date not null,
  due_on date not null,
  next_reminder_on date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invoices_customer_name_not_blank check (char_length(trim(customer_name)) > 0),
  constraint invoices_number_not_blank check (char_length(trim(invoice_number)) > 0),
  constraint invoices_description_not_blank check (char_length(trim(description)) > 0),
  constraint invoices_amount_non_negative check (amount >= 0),
  constraint invoices_due_after_issue check (due_on >= issued_on),
  constraint invoices_org_number_unique unique (organization_id, invoice_number)
);

create index if not exists invoices_org_status_idx
  on public.invoices (organization_id, status);
create index if not exists invoices_org_due_idx
  on public.invoices (organization_id, due_on)
  where status in ('sent', 'overdue');
create index if not exists invoices_org_reminder_idx
  on public.invoices (organization_id, next_reminder_on)
  where status in ('sent', 'overdue') and next_reminder_on is not null;

drop trigger if exists invoices_set_updated_at on public.invoices;
create trigger invoices_set_updated_at
before update on public.invoices
for each row execute function public.set_updated_at();

alter table public.invoices enable row level security;

create policy "members can view invoices" on public.invoices for select
using (public.is_org_member(organization_id));
create policy "members can insert invoices" on public.invoices for insert
with check (public.is_org_member(organization_id));
create policy "members can update invoices" on public.invoices for update
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));
create policy "members can delete invoices" on public.invoices for delete
using (public.is_org_member(organization_id));

grant select, insert, update, delete on public.invoices to authenticated;

insert into public.record_link_types (product, entity_table)
values ('orvyn', 'invoices')
on conflict (product) do update set entity_table = excluded.entity_table;

drop trigger if exists invoices_cleanup_record_links on public.invoices;
create trigger invoices_cleanup_record_links
after delete on public.invoices
for each row execute function public.cleanup_record_links('orvyn');

update public.products
set status = 'active',
    name = 'Orvyn',
    description = 'Payment and invoice follow-up automation',
    accent = '#E10600'
where slug = 'orvyn';

insert into public.prices (product_id, stripe_price_id, currency, unit_amount, interval, active)
select id, 'price_1UGnkrV05bHNwI4W2UBrFrKc', 'eur', 8999, 'month', true
from public.products
where slug = 'orvyn'
on conflict (stripe_price_id) do update
set product_id = excluded.product_id,
    currency = excluded.currency,
    unit_amount = excluded.unit_amount,
    interval = excluded.interval,
    active = excluded.active;
