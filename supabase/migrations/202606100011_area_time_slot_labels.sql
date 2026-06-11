alter table public.areas
  add column if not exists time_slot_label text;

update public.areas
set time_slot_label = case name
  when 'Ayala' then '11:00 AM - 1:00 PM'
  when 'SM City' then '2:00 PM - 5:00 PM'
  when 'Parkmall' then '1:00 PM'
  when 'Seaside' then '3:00 PM - 5:00 PM'
  when 'Island Central Mall (Lapu-Lapu)' then '10:00 AM - 1:00 PM'
  when 'SM Lacion' then '2:00 PM - 5:00 PM'
  else time_slot_label
end;
