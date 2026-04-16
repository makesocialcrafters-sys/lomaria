

## Fix: "permission denied for table users" after column-GRANT migration

### Root cause
The previous migration revoked broad `SELECT` on `public.users` and granted only safe columns. But:
1. **`auth_user_id` is NOT in the GRANT** — yet client code in 15+ places does `.from("users").select("id").eq("auth_user_id", user.id)`. Postgres rejects the WHERE clause because `auth_user_id` isn't selectable to `authenticated`.
2. **`INSERT`/`UPDATE` with implicit `RETURNING *`** (PostgREST default) needs SELECT on every column, including `email` and `auth_user_id`.
3. **Onboarding `.insert({ auth_user_id, email, ... })`** fails because PostgREST returns the inserted row by default.

This is why profile saving breaks immediately: the very first existence check (`select id where auth_user_id = ...`) errors out with "permission denied for table users".

### Why the column-GRANT approach can't hold
The codebase's entire data layer is built on the pattern "look up my internal `users.id` by `auth_user_id` from the client, then use it everywhere". Removing client SELECT on `auth_user_id` would require rewriting ~15 hooks/pages to route through an RPC for *every* operation — high-risk, large blast radius, easy to miss spots.

### Solution: revert the GRANT changes, keep the safe view + RPC
The view (`public.user_profiles`) already exposes only safe columns and is the only path used for cross-user reads. The owner-scoped RLS policy (`auth.uid() = auth_user_id`) ensures direct `users` access only ever returns the caller's own row. PII (email, birthyear, gender) is therefore only visible to the owner — exactly the protection we want.

**Migration steps:**
1. Restore broad `GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated`.
2. Drop the column-level GRANT.
3. **Keep** `public.user_profiles` view as-is (safe columns, used for cross-user reads).
4. **Keep** the `get_own_profile()` RPC (still useful, harmless).
5. **Keep** the linter finding for `0010_security_definer_view` marked as ignored — the documented justification (column allow-list at the view + owner-scoped RLS on the table) still holds without the column GRANT.
6. Update `security/security-memory.md` to reflect that defense is now: (a) view exposes only safe columns for cross-user reads, (b) owner-scoped RLS prevents seeing other users' rows directly.

### Migration SQL
```sql
-- Restore default privileges on public.users for authenticated role.
-- RLS policy "Users can view own profile" (auth.uid() = auth_user_id) still
-- prevents cross-user PII access via direct table reads.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;
```

(No need to explicitly drop column GRANTs — granting table-level SELECT supersedes them.)

### Code changes
None required. `useOwnProfile` keeps using the `get_own_profile()` RPC (works fine, no regression).

### Files Changed
- 1 new migration (one GRANT statement)
- `security/security-memory.md` updated to reflect the simpler, working defense model

### Verification
1. Onboarding save works again (no "permission denied").
2. Discover, Chats, Contacts, ProfileDetail still work.
3. Cross-user reads still go through `user_profiles` view (no PII columns exist there).
4. Direct `SELECT email FROM users` by user A still only returns user A's own row (owner-scoped RLS).

