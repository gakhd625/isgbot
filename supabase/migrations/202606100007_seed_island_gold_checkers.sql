insert into public.checkers (name, active)
values
  ('Sam', true),
  ('Shaira', true),
  ('Twin', true),
  ('Gerlie', true)
on conflict (name) do update
set active = excluded.active;
