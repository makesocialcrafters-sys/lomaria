-- Recreate the view with SECURITY INVOKER (the safe default)
DROP VIEW IF EXISTS public.user_profiles;

CREATE VIEW public.user_profiles 
WITH (security_invoker = true)
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

-- Grant authenticated users access to the view
GRANT SELECT ON public.user_profiles TO authenticated;