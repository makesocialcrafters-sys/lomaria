# Security Memory

This document records security decisions and the reasoning behind them so future scans and agent loops do not re-flag accepted trade-offs.

## public.user_profiles view — intentionally SECURITY DEFINER

**Finding ignored:** Supabase linter `0010_security_definer_view` for `public.user_profiles`.

**Why this is safe:**

1. **Column allow-list at the view level.** `public.user_profiles` exposes only non-PII columns:
   `id, first_name, last_name, profile_image, age, study_program, study_phase, semester, focus, interests, intents, bio, tutoring_subject, tutoring_desc, tutoring_price, created_at, last_active_at`.
   It does **not** expose `email`, `auth_user_id`, `birthyear`, `gender`, `intent_details`, or `email_notifications_enabled`.

2. **Defense in depth on the underlying table.** `SELECT` on `public.users` is granted to the `authenticated` role only on the same safe column list (column-level `GRANT SELECT (...)`). Any direct query like `SELECT email FROM users` from the client is rejected by Postgres with a permission error.

3. **Owner-scoped RLS stays in place.** `public.users` keeps the policy `auth.uid() = auth_user_id` for SELECT/UPDATE/DELETE/INSERT. RLS still applies to direct reads on the table.

4. **Own full profile via RPC.** Each user reads their own full profile (incl. private fields) via the `SECURITY DEFINER` function `public.get_own_profile()`, which is restricted to `WHERE auth_user_id = auth.uid()` and only `EXECUTE`-able by the `authenticated` role.

**Why we cannot just flip `security_invoker = true`:** the underlying `public.users` table has owner-scoped RLS. With `security_invoker`, the view would only return the caller's own row, breaking Discover, Chats, ProfileDetail, and Contacts. A permissive `USING (true)` policy on `users` is explicitly forbidden because it would expose PII columns through direct table reads.

**Maintenance rule:** never add columns containing PII (email, auth IDs, birthyear, gender, raw notification settings, intent_details) to either the `user_profiles` view or the column-level GRANT on `public.users`.
