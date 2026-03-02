-- Fix: Replace overly permissive SELECT policy with owner-only access
-- The user_profiles view (SECURITY INVOKER) handles discovery reads
DROP POLICY IF EXISTS "Authenticated users can view all profiles for discovery" ON public.users;

CREATE POLICY "Users can view own profile"
ON public.users FOR SELECT
TO authenticated
USING (auth.uid() = auth_user_id);