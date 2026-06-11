create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'appointment_status') then
    create type public.appointment_status as enum (
      'Pending',
      'Confirmed',
      'Done',
      'Reschedule',
      'No Show',
      'Cancelled'
    );
  end if;
end $$;

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  public_token uuid not null unique default gen_random_uuid(),
  client_name text not null check (char_length(client_name) between 1 and 160),
  phone_number text not null check (char_length(phone_number) between 3 and 40),
  area text not null check (char_length(area) between 1 and 120),
  appointment_date date not null,
  appointment_time time not null,
  setter_id uuid not null references auth.users(id) on delete restrict,
  setter_name text not null,
  status public.appointment_status not null default 'Pending',
  remarks text,
  checked_by text,
  checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  checked_by text not null,
  old_status public.appointment_status not null,
  new_status public.appointment_status not null,
  remark text,
  created_at timestamptz not null default now()
);

create table if not exists public.checkers (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists appointments_setter_id_idx on public.appointments(setter_id);
create index if not exists appointments_public_token_idx on public.appointments(public_token);
create index if not exists appointments_status_idx on public.appointments(status);
create index if not exists appointments_date_idx on public.appointments(appointment_date);
create index if not exists appointments_phone_idx on public.appointments(phone_number);
create index if not exists activity_logs_appointment_id_idx on public.activity_logs(appointment_id);
create index if not exists activity_logs_created_at_idx on public.activity_logs(created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists appointments_set_updated_at on public.appointments;
create trigger appointments_set_updated_at
before update on public.appointments
for each row execute function public.set_updated_at();

do $$
begin
  alter publication supabase_realtime add table public.appointments;
exception when duplicate_object then
  null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.activity_logs;
exception when duplicate_object then
  null;
end $$;
