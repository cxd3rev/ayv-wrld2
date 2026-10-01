alter table public.organization_invites
  add column if not exists token uuid;

update public.organization_invites
set token = gen_random_uuid()
where token is null;

alter table public.organization_invites
  alter column token set default gen_random_uuid(),
  alter column token set not null;

create unique index if not exists organization_invites_token_idx
  on public.organization_invites (token);

drop policy if exists "admins can delete invites" on public.organization_invites;
create policy "admins can delete invites"
on public.organization_invites for delete
using (public.is_org_admin(organization_id));

create or replace function public.preview_organization_invite(invite_token uuid)
returns table (
  organization_name text,
  email text,
  role text
)
language sql
stable
security definer
set search_path = public
as $$
  select o.name, i.email, i.role
  from public.organization_invites i
  join public.organizations o on o.id = i.organization_id
  where i.token = invite_token;
$$;

revoke all on function public.preview_organization_invite(uuid) from public;
grant execute on function public.preview_organization_invite(uuid) to anon, authenticated;

create or replace function public.accept_organization_invite(invite_token uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  invite_row public.organization_invites%rowtype;
  caller_email text;
begin
  if auth.uid() is null then
    raise exception 'not_signed_in';
  end if;

  select u.email into caller_email
  from auth.users u
  where u.id = auth.uid();

  select * into invite_row
  from public.organization_invites
  where token = invite_token;

  if invite_row.id is null then
    raise exception 'invite_missing';
  end if;

  if caller_email is null or lower(invite_row.email) <> lower(caller_email) then
    raise exception 'invite_email_mismatch';
  end if;

  insert into public.organization_members (organization_id, user_id, role)
  values (invite_row.organization_id, auth.uid(), invite_row.role)
  on conflict (organization_id, user_id) do nothing;

  delete from public.organization_invites
  where id = invite_row.id;

  return invite_row.organization_id;
end;
$$;

revoke all on function public.accept_organization_invite(uuid) from public, anon;
grant execute on function public.accept_organization_invite(uuid) to authenticated;
