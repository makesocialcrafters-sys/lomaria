-- Step 1: Recreate user_profiles view with SECURITY INVOKER (excludes auth_user_id, email)
DROP VIEW IF EXISTS public.user_profiles;

CREATE VIEW public.user_profiles 
WITH (security_invoker = on)
AS SELECT
  id,
  first_name,
  last_name,
  profile_image,
  birthyear,
  age,
  gender,
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

GRANT SELECT ON public.user_profiles TO authenticated;

-- Step 2: Add message length constraints
ALTER TABLE public.messages 
ADD CONSTRAINT messages_text_length 
CHECK (char_length(text) <= 2000);

ALTER TABLE public.connections 
ADD CONSTRAINT connections_message_length 
CHECK (message IS NULL OR char_length(message) <= 500);