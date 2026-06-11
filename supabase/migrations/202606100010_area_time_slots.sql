alter table public.areas
  add column if not exists header_label text,
  add column if not exists default_appointment_time time,
  add column if not exists time_slot_label text;

insert into public.areas (
  name,
  active,
  display_order,
  header_label,
  default_appointment_time,
  time_slot_label,
  schedule_note,
  contact_name,
  contact_phone
)
values
  ('Ayala', true, 10, 'AYALA', '11:00', '11:00 AM - 1:00 PM', 'Monday-Saturday, 11:00 AM-1:00 PM', 'Shaira', '(0968) 503 5320'),
  ('SM City', true, 20, 'SM CITY', '14:00', '2:00 PM - 5:00 PM', 'Monday-Saturday, 2:00 PM-5:00 PM', 'Shaira', '(0968) 503 5320'),
  ('Parkmall', true, 30, 'PARKMALL', '13:00', '1:00 PM', 'Monday-Friday, 10:00 AM-2:00 PM; Sunday, 11:00 AM-1:00 PM', 'Twin / Gerlie', '(0985) 998 8699 / (0912) 879 0295'),
  ('Seaside', true, 40, 'SEASIDE', '15:00', '3:00 PM - 5:00 PM', 'Monday-Friday, 3:00 PM-5:00 PM; Sunday, 2:00 PM-5:00 PM', 'Twin / Gerlie', '(0985) 998 8699 / (0912) 879 0295'),
  ('Island Central Mall (Lapu-Lapu)', true, 50, 'ICM', '10:00', '10:00 AM - 1:00 PM', 'Monday-Saturday, 10:00 AM-1:00 PM', 'Sam', '(0920) 272 3629'),
  ('SM Lacion', true, 60, 'SM LACION', '14:00', '2:00 PM - 5:00 PM', 'Monday-Saturday, 2:00 PM-5:00 PM', 'Sam', '(0920) 272 3629')
on conflict (name) do update
set
  active = excluded.active,
  display_order = excluded.display_order,
  header_label = excluded.header_label,
  default_appointment_time = excluded.default_appointment_time,
  time_slot_label = excluded.time_slot_label,
  schedule_note = excluded.schedule_note,
  contact_name = excluded.contact_name,
  contact_phone = excluded.contact_phone;

update public.appointments a
set appointment_time = ar.default_appointment_time
from public.areas ar
where a.area = ar.name
  and ar.default_appointment_time is not null;
