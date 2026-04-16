-- Restore default table-level privileges on public.users for the authenticated role.
-- The previous migration's column-level GRANT broke client lookups by auth_user_id and
-- INSERT/UPDATE with PostgREST's default RETURNING *.
-- Owner-scoped RLS policy "Users can view own profile" (auth.uid() = auth_user_id)
-- continues to prevent cross-user PII access via direct table reads.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;