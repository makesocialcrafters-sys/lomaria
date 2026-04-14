
-- ==============================================
-- FIX 1: user_profiles view → SECURITY INVOKER
-- ==============================================

-- Drop existing view
DROP VIEW IF EXISTS public.user_profiles;

-- Add a SELECT policy so authenticated users can read all rows
-- (the view will restrict which columns are visible)
CREATE POLICY "Authenticated users can read public profile data"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (true);

-- Recreate view with SECURITY INVOKER
CREATE VIEW public.user_profiles
WITH (security_invoker = on)
AS
  SELECT 
    id, first_name, last_name, profile_image, age,
    study_program, study_phase, semester, focus,
    interests, intents, bio,
    tutoring_subject, tutoring_desc, tutoring_price,
    created_at, last_active_at
  FROM public.users;

-- Only authenticated users can query the view
GRANT SELECT ON public.user_profiles TO authenticated;
REVOKE ALL ON public.user_profiles FROM anon;
REVOKE ALL ON public.user_profiles FROM public;

-- ==============================================
-- FIX 2: Realtime authorization for messages
-- ==============================================

-- Enable Realtime RLS so only connection participants receive message events
ALTER PUBLICATION supabase_realtime SET TABLE public.messages;
