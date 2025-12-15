-- Add policy to allow authenticated users to view all user profiles for discovery
-- This enables receivers to see sender profiles in contact requests
CREATE POLICY "Authenticated users can view all profiles for discovery"
ON public.users
FOR SELECT
TO authenticated
USING (true);

-- Drop the restrictive view-own-profile-only policy
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;