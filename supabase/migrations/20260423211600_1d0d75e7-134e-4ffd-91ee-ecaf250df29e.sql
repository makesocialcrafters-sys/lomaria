ALTER VIEW public.user_profiles SET (security_invoker = false);

REVOKE ALL ON TABLE public.user_profiles FROM PUBLIC;
REVOKE ALL ON TABLE public.user_profiles FROM anon;
GRANT SELECT ON TABLE public.user_profiles TO authenticated;