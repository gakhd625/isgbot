alter table public.appointments enable row level security;
alter table public.activity_logs enable row level security;
alter table public.checkers enable row level security;

drop policy if exists "setters_select_own_appointments" on public.appointments;
create policy "setters_select_own_appointments"
on public.appointments for select
to authenticated
using (setter_id = auth.uid());

drop policy if exists "setters_insert_own_appointments" on public.appointments;
create policy "setters_insert_own_appointments"
on public.appointments for insert
to authenticated
with check (setter_id = auth.uid());

drop policy if exists "setters_update_own_client_appointments" on public.appointments;
create policy "setters_update_own_client_appointments"
on public.appointments for update
to authenticated
using (setter_id = auth.uid())
with check (setter_id = auth.uid());

drop policy if exists "setters_read_activity_for_own_appointments" on public.activity_logs;
create policy "setters_read_activity_for_own_appointments"
on public.activity_logs for select
to authenticated
using (
  exists (
    select 1 from public.appointments a
    where a.id = activity_logs.appointment_id
      and a.setter_id = auth.uid()
  )
);

drop policy if exists "authenticated_read_checkers" on public.checkers;
create policy "authenticated_read_checkers"
on public.checkers for select
to authenticated
using (true);

drop policy if exists "anonymous_read_active_checkers" on public.checkers;
create policy "anonymous_read_active_checkers"
on public.checkers for select
to anon
using (active = true);

-- Checker access and server-side status updates are executed through SECURITY DEFINER RPCs.
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
  select * into appointment_row
  from public.appointments
  where public_token = token
  for update;

  if not found then
    raise exception 'Appointment not found' using errcode = 'P0002';
  end if;

  if not exists (
    select 1 from public.checkers
    where name = checker_name and active = true
  ) then
    raise exception 'Checker is not active' using errcode = '22023';
  end if;

  previous_status := appointment_row.status;

  update public.appointments
  set
    status = new_status,
    remarks = nullif(new_remark, ''),
    checked_by = checker_name,
    checked_at = now()
  where public_token = token
  returning * into appointment_row;

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
