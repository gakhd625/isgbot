alter table public.appointments
  add column if not exists telegram_chat_id text,
  add column if not exists telegram_message_id bigint;

alter table public.checkers
  add column if not exists telegram_user_id bigint unique,
  add column if not exists telegram_username text;

create or replace function public.get_checker_name_by_telegram_user_id(user_id bigint)
returns text
language sql
security definer
set search_path = public
as $$
  select c.name
  from public.checkers c
  where c.telegram_user_id = user_id
    and c.active = true
  limit 1;
$$;

grant execute on function public.get_checker_name_by_telegram_user_id(bigint) to anon, authenticated;

-- Example checker registration. Replace the IDs with real Telegram user IDs.
-- update public.checkers set telegram_user_id = 123456789, telegram_username = 'maria_username' where name = 'Maria';
-- update public.checkers set telegram_user_id = 987654321, telegram_username = 'john_username' where name = 'John';
