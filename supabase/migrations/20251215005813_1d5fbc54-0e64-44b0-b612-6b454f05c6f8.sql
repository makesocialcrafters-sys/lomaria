-- Drop the existing overly permissive SELECT policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;

-- Create a policy for users to view their own full profile (including email)
CREATE POLICY "Users can view own profile"
ON public.users FOR SELECT
TO authenticated
USING (auth.uid() = auth_user_id);

-- Create a view for public profile data (excluding sensitive email field)
CREATE OR REPLACE VIEW public.user_profiles AS
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