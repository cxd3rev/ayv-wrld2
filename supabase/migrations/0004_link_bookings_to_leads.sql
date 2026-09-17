-- Link Velto bookings to Avyro leads
-- A booking may optionally reference one lead in the same organization.
-- A lead may have many bookings. Deleting a lead unlinks the booking.

alter table public.bookings
  add column if not exists lead_id uuid references public.leads (id) on delete set null;

create index if not exists bookings_lead_id_idx on public.bookings (lead_id);
create index if not exists bookings_org_lead_idx on public.bookings (organization_id, lead_id);

create or replace function public.bookings_lead_same_org()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.lead_id is null then
    return new;
  end if;

  if not exists (
    select 1
    from public.leads
    where id = new.lead_id
      and organization_id = new.organization_id
  ) then
    raise exception 'Lead must belong to the same organization as the booking'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists bookings_lead_same_org on public.bookings;
create trigger bookings_lead_same_org
before insert or update of lead_id, organization_id on public.bookings
for each row execute function public.bookings_lead_same_org();

drop policy if exists "members can insert bookings" on public.bookings;
create policy "members can insert bookings"
on public.bookings for insert
with check (
  public.is_org_member(organization_id)
  and (
    lead_id is null
    or exists (
      select 1
      from public.leads
      where leads.id = bookings.lead_id
        and leads.organization_id = bookings.organization_id
        and public.is_org_member(leads.organization_id)
    )
  )
);

drop policy if exists "members can update bookings" on public.bookings;
create policy "members can update bookings"
on public.bookings for update
using (public.is_org_member(organization_id))
with check (
  public.is_org_member(organization_id)
  and (
    lead_id is null
    or exists (
      select 1
      from public.leads
      where leads.id = bookings.lead_id
        and leads.organization_id = bookings.organization_id
        and public.is_org_member(leads.organization_id)
    )
  )
);
