# Supabase Setup

1. Create a Supabase project.
2. Run migrations in `supabase/migrations` in timestamp order.
3. Run `supabase/seed.sql`.
4. Enable Realtime for `appointments` and `activity_logs` if it is not already active.
5. Add the app environment variables from `.env.example`.

The app uses RLS for setter-owned rows. Checker access uses secure UUID public tokens through `SECURITY DEFINER` RPC functions that expose only checker-safe fields.
