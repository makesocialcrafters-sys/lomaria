# Security Memory

This document records security decisions and the reasoning behind them so future scans and agent loops do not re-flag accepted trade-offs.

## public.user_profiles view — intentionally SECURITY DEFINER

**Finding ignored:** Supabase linter `0010_security_definer_view` for `public.user_profiles`.

**Why this is safe:**

1. **Column allow-list at the view level.** `public.user_profiles` exposes only non-PII columns:
   `id, first_name, last_name, profile_image, age, study_program, study_phase, semester, focus, interests, intents, bio, tutoring_subject, tutoring_desc, tutoring_price, created_at, last_active_at`.
   It does **not** expose `email`, `auth_user_id`, `birthyear`, `gender`, `intent_details`, or `email_notifications_enabled`.

2. **Owner-scoped RLS on the underlying table.** `public.users` has the policy `auth.uid() = auth_user_id` for SELECT/INSERT/UPDATE/DELETE. Any direct `SELECT ... FROM users` from the client only ever returns the caller's own row — so PII columns (`email`, `birthyear`, `gender`, `intent_details`, `email_notifications_enabled`) are visible only to their owner.

3. **Cross-user reads go exclusively through the view.** Discover, Chats, ProfileDetail, and Contacts read other users' profiles via `public.user_profiles`. Because the view's SELECT list excludes all PII columns, there is no path for an authenticated user to read another user's PII.

4. **Own full profile via RPC.** Each user reads their own full profile (incl. private fields like `email_notifications_enabled` and `intent_details`) via the `SECURITY DEFINER` function `public.get_own_profile()`, restricted to `WHERE auth_user_id = auth.uid()` and `EXECUTE`-able only by `authenticated`.

**Why we cannot flip `security_invoker = true`:** the underlying `public.users` table has owner-scoped RLS. With `security_invoker`, the view would only return the caller's own row, breaking Discover, Chats, ProfileDetail, and Contacts. A permissive `USING (true)` policy on `users` is explicitly forbidden because it would expose PII columns through direct table reads.

**Why we don't use column-level GRANTs on `public.users`:** tried and reverted. PostgREST's default `RETURNING *` on INSERT/UPDATE requires SELECT on every column, and client code throughout the app filters by `auth_user_id` (which would need to be in the GRANT). The owner-scoped RLS already provides equivalent protection — column-GRANT added breakage without security benefit.

**Maintenance rules:**
- Never add columns containing PII (email, auth IDs, birthyear, gender, raw notification settings, intent_details) to the `public.user_profiles` view.
- Never add a permissive (`USING (true)`) SELECT policy on `public.users`.
- Keep the owner-scoped RLS policy `auth.uid() = auth_user_id` on `public.users` intact.
