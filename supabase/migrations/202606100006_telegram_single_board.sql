create table if not exists public.app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;

create or replace function public.get_app_setting(setting_key text)
returns text
language sql
security definer
set search_path = public
as $$
  select s.value
  from public.app_settings s
  where s.key = setting_key
  limit 1;
$$;

create or replace function public.set_app_setting(setting_key text, setting_value text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.app_settings (key, value, updated_at)
  values (setting_key, setting_value, now())
  on conflict (key) do update
  set value = excluded.value,
      updated_at = excluded.updated_at;
$$;

grant execute on function public.get_app_setting(text) to anon, authenticated;
grant execute on function public.set_app_setting(text, text) to anon, authenticated;
