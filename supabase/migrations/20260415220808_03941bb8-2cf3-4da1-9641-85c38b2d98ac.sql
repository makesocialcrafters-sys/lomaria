-- Fix 1: Remove overly permissive SELECT policy that exposes email, auth_user_id, birthyear, etc.
DROP POLICY IF EXISTS "Authenticated users can read public profile data" ON public.users;

-- Fix 2: Recreate user_profiles view WITHOUT security_invoker so it runs as owner (bypasses RLS)
-- The view itself is the column-level security — it only exposes safe columns
DROP VIEW IF EXISTS public.user_profiles;

CREATE VIEW public.user_profiles AS
SELECT
  id,
  first_name,
  last_name,
  profile_image,
  age,
  study_program,
  study_phase,
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

-- Grant authenticated users access to the view
GRANT SELECT ON public.user_profiles TO authenticated;
GRANT SELECT ON public.user_profiles TO anon;