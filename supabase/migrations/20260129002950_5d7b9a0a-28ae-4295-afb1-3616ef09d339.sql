-- Drop and recreate view (cannot use CREATE OR REPLACE when removing columns)
DROP VIEW IF EXISTS public.user_profiles;

CREATE VIEW public.user_profiles
WITH (security_invoker=on) AS
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
  intent_details,
  bio,
  tutoring_subject,
  tutoring_desc,
  tutoring_price,
  created_at,
  last_active_at
FROM users;