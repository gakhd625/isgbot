create table if not exists public.areas (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  active boolean not null default true,
  display_order integer not null default 100,
  header_label text,
  default_appointment_time time,
  schedule_note text,
  contact_name text,
  contact_phone text,
  created_at timestamptz not null default now()
);

alter table public.areas enable row level security;

drop policy if exists "authenticated_read_active_areas" on public.areas;
create policy "authenticated_read_active_areas"
on public.areas for select
to authenticated
using (active = true);

drop policy if exists "anonymous_read_active_areas" on public.areas;
create policy "anonymous_read_active_areas"
on public.areas for select
to anon
using (active = true);

insert into public.areas (
  name,
  active,
  display_order,
  header_label,
  default_appointment_time,
  schedule_note,
  contact_name,
  contact_phone
)
values
  ('Ayala', true, 10, 'AYALA', '11:00', 'Monday-Saturday, 11:00 AM-1:00 PM', 'Shaira', '(0968) 503 5320'),
  ('SM City', true, 20, 'SM CITY', '14:00', 'Monday-Saturday, 2:00 PM-5:00 PM', 'Shaira', '(0968) 503 5320'),
  ('Parkmall', true, 30, 'PARKMALL', '13:00', 'Monday-Friday, 10:00 AM-2:00 PM; Sunday, 11:00 AM-1:00 PM', 'Twin / Gerlie', '(0985) 998 8699 / (0912) 879 0295'),
  ('Seaside', true, 40, 'SEASIDE', '15:00', 'Monday-Friday, 3:00 PM-5:00 PM; Sunday, 2:00 PM-5:00 PM', 'Twin / Gerlie', '(0985) 998 8699 / (0912) 879 0295'),
  ('Island Central Mall (Lapu-Lapu)', true, 50, 'ICM', '10:00', 'Monday-Saturday, 10:00 AM-1:00 PM', 'Sam', '(0920) 272 3629'),
  ('SM Lacion', true, 60, 'SM LACION', '14:00', 'Monday-Saturday, 2:00 PM-5:00 PM', 'Sam', '(0920) 272 3629')
on conflict (name) do update
set
  active = excluded.active,
  display_order = excluded.display_order,
  header_label = excluded.header_label,
  default_appointment_time = excluded.default_appointment_time,
  schedule_note = excluded.schedule_note,
  contact_name = excluded.contact_name,
  contact_phone = excluded.contact_phone;

update public.appointments
set area = case
  when lower(area) in ('ayala', 'aya;a') then 'Ayala'
  when lower(area) in ('sm city', 'smcity') then 'SM City'
  when lower(area) in ('parkmall', 'parkmal') then 'Parkmall'
  when lower(area) in ('seaside') then 'Seaside'
  when lower(area) in ('icm', 'island central mall', 'island central mall (lapu-lapu)', 'island central mall (lapulapu)') then 'Island Central Mall (Lapu-Lapu)'
  when lower(area) in ('sm lacion', 'sm lacion 2pm', 'sm lacion @2pm', 'lacion') then 'SM Lacion'
  else area
end;
