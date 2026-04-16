-- 1. Recreate the public-facing view with the safe column list only
DROP VIEW IF EXISTS public.user_profiles;

CREATE VIEW public.user_profiles AS
SELECT id, first_name, last_name, profile_image, age,
       study_program, study_phase, semester, focus,
       interests, intents, bio,
       tutoring_subject, tutoring_desc, tutoring_price,
       created_at, last_active_at
FROM public.users;

GRANT SELECT ON public.user_profiles TO authenticated, anon;

-- 2. Defense in depth: column-level GRANT on the underlying users table.
-- Direct SELECT of email/birthyear/gender/auth_user_id/intent_details/email_notifications_enabled
-- by authenticated users is rejected by Postgres.
REVOKE SELECT ON public.users FROM authenticated;
GRANT SELECT (id, first_name, last_name, profile_image, age,
              study_program, study_phase, semester, focus,
              interests, intents, bio,
              tutoring_subject, tutoring_desc, tutoring_price,
              created_at, last_active_at)
  ON public.users TO authenticated;

-- 3. SECURITY DEFINER RPC for the caller's own full profile (including private fields)
CREATE OR REPLACE FUNCTION public.get_own_profile()
RETURNS TABLE (
  id uuid,
  first_name text,
  last_name text,
  profile_image text,
  age integer,
  gender text,
  study_program text,
  study_phase text,
  focus text,
  intents text[],
  interests text[],
  tutoring_subject text,
  tutoring_desc text,
  tutoring_price numeric,
  bio text,
  intent_details jsonb,
  email_notifications_enabled boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.id, u.first_name, u.last_name, u.profile_image, u.age, u.gender,
         u.study_program, u.study_phase, u.focus, u.intents, u.interests,
         u.tutoring_subject, u.tutoring_desc, u.tutoring_price, u.bio,
         u.intent_details, u.email_notifications_enabled
  FROM public.users u
  WHERE u.auth_user_id = auth.uid()
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_own_profile() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_own_profile() TO authenticated;