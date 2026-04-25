DROP FUNCTION IF EXISTS public.get_own_profile();

CREATE OR REPLACE FUNCTION public.get_own_profile()
RETURNS TABLE(
  id uuid, first_name text, last_name text, profile_image text,
  age integer, gender text, study_program text, study_phase text,
  focus text, intents text[], interests text[],
  tutoring_subject text, tutoring_desc text, tutoring_price numeric,
  bio text, intent_details jsonb, email_notifications_enabled boolean,
  is_founder boolean
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT u.id, u.first_name, u.last_name, u.profile_image, u.age, u.gender,
         u.study_program, u.study_phase, u.focus, u.intents, u.interests,
         u.tutoring_subject, u.tutoring_desc, u.tutoring_price, u.bio,
         u.intent_details, u.email_notifications_enabled, u.is_founder
  FROM public.users u
  WHERE u.auth_user_id = auth.uid()
  LIMIT 1;
$$;