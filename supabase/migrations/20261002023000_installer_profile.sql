-- Installer profile collected at onboarding. Columns sit on organizations, which already has RLS.
alter table public.organizations
  add column if not exists vat_number text,
  add column if not exists municipality text,
  add column if not exists service_municipalities text[] not null default '{}';
