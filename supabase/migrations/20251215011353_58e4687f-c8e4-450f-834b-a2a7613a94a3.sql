-- Recreate the view with SECURITY DEFINER to allow authenticated users to see all profiles
-- This is intentionally SECURITY DEFINER because:
-- 1. The view explicitly EXCLUDES the email column (sensitive data protection)
-- 2. We need authenticated users to browse/discover other user profiles
-- 3. Access is restricted to authenticated role only (no anonymous access)
DROP VIEW IF EXISTS public.user_profiles;

CREATE VIEW public.user_profiles 
WITH (security_barrier = true)
AS
SELECT 
  id,
  auth_user_id,
  first_name,
  last_name,
  profile_image,
  birthyear,
  gender,
  study_program,
  semester,
  focus,
  interests,
  intents,
  bio,
  tutoring_subject,
  tutoring_desc,
  tutoring_price,
  created_at,
  last_active_at
FROM public.users;

-- Revoke all default access
REVOKE ALL ON public.user_profiles FROM PUBLIC;
REVOKE ALL ON public.user_profiles FROM anon;

-- Grant access ONLY to authenticated users
GRANT SELECT ON public.user_profiles TO authenticated;