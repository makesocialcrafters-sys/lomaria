REVOKE SELECT ON public.user_profiles FROM anon;
REVOKE SELECT ON public.user_profiles FROM PUBLIC;
GRANT SELECT ON public.user_profiles TO authenticated;