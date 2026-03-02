-- Recreate view WITHOUT security_invoker so it can show all profiles
DROP VIEW IF EXISTS public.user_profiles;

CREATE VIEW public.user_profiles AS
SELECT 
  id, first_name, last_name, profile_image, age,
  study_program, study_phase, semester, focus,
  interests, intents, intent_details, bio,
  tutoring_subject, tutoring_desc, tutoring_price,
  created_at, last_active_at
FROM users;