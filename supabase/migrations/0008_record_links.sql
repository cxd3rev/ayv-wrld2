-- Org-scoped connections between any product records.
-- Future apps opt in by inserting into record_link_types and attaching
-- cleanup_record_links on their table. Do not add pairwise foreign keys.

create table if not exists public.record_link_types (
  product text primary key,
  entity_table text not null,
  constraint record_link_types_table_name
    check (entity_table ~ '^[a-z][a-z0-9_]*$')
);

insert into public.record_link_types (product, entity_table)
values
  ('avyro', 'leads'),
  ('velto', 'bookings'),
  ('rovyn', 'quotes')
on conflict (product) do update
set entity_table = excluded.entity_table;

create table if not exists public.record_links (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  from_product text not null references public.record_link_types (product),
  from_id uuid not null,
  to_product text not null references public.record_link_types (product),
  to_id uuid not null,
  created_at timestamptz not null default now(),
  constraint record_links_not_self check (
    from_product <> to_product or from_id <> to_id
  ),
  constraint record_links_canonical check (
    (from_product, from_id) < (to_product, to_id)
  ),
  constraint record_links_pair unique (
    organization_id, from_product, from_id, to_product, to_id
  )
);

create index if not exists record_links_org_idx
  on public.record_links (organization_id);
create index if not exists record_links_from_idx
  on public.record_links (organization_id, from_product, from_id);
create index if not exists record_links_to_idx
  on public.record_links (organization_id, to_product, to_id);

-- ---------------------------------------------------------------------------
-- Parent rows must exist in the same organization.
-- Table names come only from record_link_types (quoted identifiers).
-- ---------------------------------------------------------------------------
create or replace function public.record_parent_in_org(
  p_product text,
  p_id uuid,
  p_org uuid
)
returns boolean
language plpgsql
stable
set search_path = public
as $$
declare
  tbl text;
  found boolean := false;
begin
  select entity_table into tbl
  from public.record_link_types
  where product = p_product;

  if tbl is null or tbl !~ '^[a-z][a-z0-9_]*$' then
    return false;
  end if;

  execute format(
    'select exists (
       select 1 from public.%I
       where id = $1 and organization_id = $2
     )',
    tbl
  ) into found using p_id, p_org;

  return coalesce(found, false);
end;
$$;

create or replace function public.record_links_before_write()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  swap_product text;
  swap_id uuid;
begin
  if (new.from_product, new.from_id) > (new.to_product, new.to_id) then
    swap_product := new.from_product;
    swap_id := new.from_id;
    new.from_product := new.to_product;
    new.from_id := new.to_id;
    new.to_product := swap_product;
    new.to_id := swap_id;
  end if;

  if new.from_product = new.to_product and new.from_id = new.to_id then
    raise exception 'Cannot connect a record to itself'
      using errcode = '23514';
  end if;

  if not public.record_parent_in_org(new.from_product, new.from_id, new.organization_id) then
    raise exception 'Both records must belong to the same organization'
      using errcode = '23514';
  end if;

  if not public.record_parent_in_org(new.to_product, new.to_id, new.organization_id) then
    raise exception 'Both records must belong to the same organization'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists record_links_before_write on public.record_links;
create trigger record_links_before_write
before insert or update of organization_id, from_product, from_id, to_product, to_id
on public.record_links
for each row execute function public.record_links_before_write();

-- ---------------------------------------------------------------------------
-- Delete links when a parent row is removed. Future tables use TG_ARGV[0].
-- ---------------------------------------------------------------------------
create or replace function public.cleanup_record_links()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  product text := tg_argv[0];
begin
  delete from public.record_links
  where organization_id = old.organization_id
    and (
      (from_product = product and from_id = old.id)
      or (to_product = product and to_id = old.id)
    );
  return old;
end;
$$;

drop trigger if exists leads_cleanup_record_links on public.leads;
create trigger leads_cleanup_record_links
after delete on public.leads
for each row execute function public.cleanup_record_links('avyro');

drop trigger if exists bookings_cleanup_record_links on public.bookings;
create trigger bookings_cleanup_record_links
after delete on public.bookings
for each row execute function public.cleanup_record_links('velto');

drop trigger if exists quotes_cleanup_record_links on public.quotes;
create trigger quotes_cleanup_record_links
after delete on public.quotes
for each row execute function public.cleanup_record_links('rovyn');

-- ---------------------------------------------------------------------------
-- Keep bookings.lead_id in sync with the Avyro↔Velto link (one lead per booking).
-- ---------------------------------------------------------------------------
create or replace function public.bookings_sync_record_link()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_setting('ayv.syncing_record_links', true) = '1' then
    return new;
  end if;

  perform set_config('ayv.syncing_record_links', '1', true);

  delete from public.record_links
  where organization_id = new.organization_id
    and (
      (from_product = 'avyro' and to_product = 'velto' and to_id = new.id)
      or (from_product = 'velto' and from_id = new.id and to_product = 'avyro')
    );

  if new.lead_id is not null then
    insert into public.record_links (
      organization_id, from_product, from_id, to_product, to_id
    )
    values (
      new.organization_id, 'avyro', new.lead_id, 'velto', new.id
    )
    on conflict on constraint record_links_pair do nothing;
  end if;

  perform set_config('ayv.syncing_record_links', '', true);
  return new;
end;
$$;

drop trigger if exists bookings_sync_record_link on public.bookings;
create trigger bookings_sync_record_link
after insert or update of lead_id, organization_id on public.bookings
for each row execute function public.bookings_sync_record_link();

create or replace function public.record_links_sync_booking_lead()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_booking_id uuid;
  v_lead_id uuid;
  v_org_id uuid;
begin
  if current_setting('ayv.syncing_record_links', true) = '1' then
    return coalesce(new, old);
  end if;

  if tg_op = 'INSERT' then
    v_org_id := new.organization_id;
    if new.from_product = 'avyro' and new.to_product = 'velto' then
      v_lead_id := new.from_id;
      v_booking_id := new.to_id;
    elsif new.from_product = 'velto' and new.to_product = 'avyro' then
      v_lead_id := new.to_id;
      v_booking_id := new.from_id;
    else
      return new;
    end if;

    perform set_config('ayv.syncing_record_links', '1', true);

    delete from public.record_links
    where id <> new.id
      and organization_id = v_org_id
      and (
        (from_product = 'avyro' and to_product = 'velto' and to_id = v_booking_id)
        or (from_product = 'velto' and from_id = v_booking_id and to_product = 'avyro')
      );

    update public.bookings
    set lead_id = v_lead_id
    where id = v_booking_id
      and organization_id = v_org_id
      and lead_id is distinct from v_lead_id;

    perform set_config('ayv.syncing_record_links', '', true);
    return new;
  end if;

  v_org_id := old.organization_id;
  if old.from_product = 'avyro' and old.to_product = 'velto' then
    v_lead_id := old.from_id;
    v_booking_id := old.to_id;
  elsif old.from_product = 'velto' and old.to_product = 'avyro' then
    v_lead_id := old.to_id;
    v_booking_id := old.from_id;
  else
    return old;
  end if;

  perform set_config('ayv.syncing_record_links', '1', true);

  update public.bookings
  set lead_id = null
  where id = v_booking_id
    and organization_id = v_org_id
    and lead_id = v_lead_id;

  perform set_config('ayv.syncing_record_links', '', true);
  return old;
end;
$$;

drop trigger if exists record_links_sync_booking_lead on public.record_links;
create trigger record_links_sync_booking_lead
after insert or delete on public.record_links
for each row execute function public.record_links_sync_booking_lead();

-- Backfill existing Avyro↔Velto convenience FKs into the generic table.
insert into public.record_links (
  organization_id, from_product, from_id, to_product, to_id
)
select organization_id, 'avyro', lead_id, 'velto', id
from public.bookings
where lead_id is not null
on conflict on constraint record_links_pair do nothing;

alter table public.record_link_types enable row level security;
alter table public.record_links enable row level security;

drop policy if exists "authenticated can view record link types" on public.record_link_types;
create policy "authenticated can view record link types"
on public.record_link_types for select
to authenticated
using (true);

drop policy if exists "members can view record links" on public.record_links;
create policy "members can view record links"
on public.record_links for select
using (public.is_org_member(organization_id));

drop policy if exists "members can insert record links" on public.record_links;
create policy "members can insert record links"
on public.record_links for insert
with check (public.is_org_member(organization_id));

drop policy if exists "members can delete record links" on public.record_links;
create policy "members can delete record links"
on public.record_links for delete
using (public.is_org_member(organization_id));

grant select on table public.record_link_types to authenticated;
grant select, insert, delete on table public.record_links to authenticated;
grant execute on function public.record_parent_in_org(text, uuid, uuid) to authenticated;
