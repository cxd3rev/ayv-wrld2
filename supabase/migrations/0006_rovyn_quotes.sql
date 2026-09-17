-- Rovyn quote follow-up
-- Org-scoped quotes so members only see their own workspace.

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  customer_name text not null,
  email text,
  phone text,
  title text not null,
  amount numeric(12, 2),
  status text not null default 'sent' check (
    status in ('sent', 'followed_up', 'won', 'lost')
  ),
  follow_up_on date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quotes_customer_name_not_blank check (char_length(trim(customer_name)) > 0),
  constraint quotes_title_not_blank check (char_length(trim(title)) > 0),
  constraint quotes_amount_non_negative check (amount is null or amount >= 0)
);

create index if not exists quotes_org_id_idx on public.quotes (organization_id);
create index if not exists quotes_org_status_idx on public.quotes (organization_id, status);
create index if not exists quotes_org_follow_up_idx on public.quotes (organization_id, follow_up_on);

drop trigger if exists quotes_set_updated_at on public.quotes;
create trigger quotes_set_updated_at
before update on public.quotes
for each row execute function public.set_updated_at();

alter table public.quotes enable row level security;

drop policy if exists "members can view quotes" on public.quotes;
create policy "members can view quotes"
on public.quotes for select
using (public.is_org_member(organization_id));

drop policy if exists "members can insert quotes" on public.quotes;
create policy "members can insert quotes"
on public.quotes for insert
with check (public.is_org_member(organization_id));

drop policy if exists "members can update quotes" on public.quotes;
create policy "members can update quotes"
on public.quotes for update
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

drop policy if exists "members can delete quotes" on public.quotes;
create policy "members can delete quotes"
on public.quotes for delete
using (public.is_org_member(organization_id));

grant select, insert, update, delete on table public.quotes to authenticated;

update public.products
set status = 'active',
    name = 'Rovyn',
    description = 'Quote follow-up automation',
    accent = '#00C853'
where slug = 'rovyn';
