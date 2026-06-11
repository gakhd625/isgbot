alter table public.appointments
  add column if not exists area text;

update public.appointments
set area = coalesce(nullif(area, ''), nullif(source, ''), 'Unassigned')
where area is null or area = '';

alter table public.appointments
  alter column area set not null,
  add constraint appointments_area_length check (char_length(area) between 1 and 120);

alter table public.appointments
  drop column if exists email,
  drop column if exists source;

drop function if exists public.get_checker_appointment(uuid);
drop function if exists public.update_checker_appointment(uuid, text, public.appointment_status, text);

create or replace function public.get_checker_appointment(token uuid)
returns table (
  id uuid,
  public_token uuid,
  client_name text,
  phone_number text,
  area text,
  appointment_date date,
  appointment_time time,
  status public.appointment_status,
  remarks text,
  checked_by text,
  checked_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    a.id,
    a.public_token,
    a.client_name,
    a.phone_number,
    a.area,
    a.appointment_date,
    a.appointment_time,
    a.status,
    a.remarks,
    a.checked_by,
    a.checked_at
  from public.appointments a
  where a.public_token = token
  limit 1;
$$;

create or replace function public.update_checker_appointment(
  token uuid,
  checker_name text,
  new_status public.appointment_status,
  new_remark text
)
returns table (
  id uuid,
  client_name text,
  phone_number text,
  area text,
  appointment_date date,
  appointment_time time,
  old_status public.appointment_status,
  status public.appointment_status,
  remarks text,
  checked_by text,
  checked_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  appointment_row public.appointments%rowtype;
  previous_status public.appointment_status;
begin
  select a.* into appointment_row
  from public.appointments a
  where a.public_token = token
  for update;

  if not found then
    raise exception 'Appointment not found' using errcode = 'P0002';
  end if;

  if not exists (
    select 1 from public.checkers c
    where c.name = checker_name and c.active = true
  ) then
    raise exception 'Checker is not active' using errcode = '22023';
  end if;

  previous_status := appointment_row.status;

  update public.appointments a
  set
    status = new_status,
    remarks = nullif(new_remark, ''),
    checked_by = checker_name,
    checked_at = now()
  where a.public_token = token
  returning a.* into appointment_row;

  insert into public.activity_logs (
    appointment_id,
    checked_by,
    old_status,
    new_status,
    remark
  )
  values (
    appointment_row.id,
    checker_name,
    previous_status,
    new_status,
    nullif(new_remark, '')
  );

  return query
  select
    appointment_row.id,
    appointment_row.client_name,
    appointment_row.phone_number,
    appointment_row.area,
    appointment_row.appointment_date,
    appointment_row.appointment_time,
    previous_status,
    appointment_row.status,
    appointment_row.remarks,
    appointment_row.checked_by,
    appointment_row.checked_at,
    appointment_row.updated_at;
end;
$$;

grant execute on function public.get_checker_appointment(uuid) to anon, authenticated;
grant execute on function public.update_checker_appointment(uuid, text, public.appointment_status, text) to anon, authenticated;
