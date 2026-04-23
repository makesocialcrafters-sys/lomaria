-- Add founder flag to users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_founder boolean NOT NULL DEFAULT false;

-- Recreate user_profiles view to include is_founder
DROP VIEW IF EXISTS public.user_profiles;

CREATE VIEW public.user_profiles
WITH (security_invoker = true)
AS
SELECT
  u.id,
  u.first_name,
  u.last_name,
  u.profile_image,
  u.age,
  u.study_program,
  u.study_phase,
  u.semester,
  u.focus,
  u.intents,
  u.interests,
  u.tutoring_subject,
  u.tutoring_desc,
  u.tutoring_price,
  u.bio,
  u.last_active_at,
  u.created_at,
  u.is_founder
FROM public.users u;

-- Mark the founder
UPDATE public.users SET is_founder = true WHERE email = 'omaralazawi03@gmail.com';