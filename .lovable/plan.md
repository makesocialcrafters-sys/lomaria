

## Problem

The `user_profiles` view has `security_invoker=on`, meaning it runs queries with the calling user's permissions. After the recent RLS change that restricted `users` SELECT to `auth.uid() = auth_user_id`, the view can only return the current user's own profile -- breaking discovery entirely.

## Fix

Recreate the `user_profiles` view with `security_invoker=off` (SECURITY DEFINER behavior). This means the view bypasses the base table's RLS and can return all profiles. This is safe because:
- The view already excludes sensitive fields (email, auth_user_id, gender, birthyear)
- The view acts as a controlled "window" into the data
- Direct access to the `users` table remains owner-only

### Database Migration

```sql
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
```

No code changes needed -- just this single migration fixes the issue.

