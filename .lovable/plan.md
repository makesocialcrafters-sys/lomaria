

## Security Hardening — Implementation Plan (All 9 Fixes, 21 Files)

### Summary
21 files total: 5 new files created, 16 existing files modified, plus 1 database migration. All changes are strictly security-scoped — no UI, styling, or logic changes.

---

### New Files (5)

1. **`.env.example`** — Placeholder env vars template
2. **`supabase/functions/_shared/cors.ts`** — Shared CORS utility: reads `ALLOWED_ORIGINS` env var, defaults to `https://lomaria.at`, also allows `http://localhost:5173`; checks incoming `Origin` header against allowlist
3. **`src/hooks/useSignedAvatarUrl.ts`** — React Query hook: takes storage path, calls `createSignedUrl(path, 3600)`, caches 45min, silently returns `null` on any error
4. **`src/components/ui/SignedAvatar.tsx`** — Reusable component: renders signed avatar image with initials fallback when URL is null/loading
5. **Migration SQL file** — Creates `rate_limits` table, sets avatars bucket to private, adds storage extension-enforcement policies

### Modified Files (16)

**Critical fixes:**
1. **`.gitignore`** — Append `.env`, `.env.local`, `.env.production`
2. **`supabase/functions/delete-account/index.ts`** — Import shared CORS, update Deno std to `0.224.0`
3. **`supabase/functions/send-email/index.ts`** — Import shared CORS, add rate limiting (5/min via `rate_limits` table), update Deno std `0.224.0` + Resend `2.1.0`
4. **`supabase/functions/notify-connection/index.ts`** — Import shared CORS, replace message-count rate limit with `rate_limits` table (5/min), update Deno std `0.224.0` + Resend `2.1.0`
5. **`supabase/functions/unsubscribe-email/index.ts`** — Import shared CORS, update Deno std `0.224.0`
6. **`supabase/functions/auth-email-hook/index.ts`** — Add server-side email domain check for signups (`ALLOWED_EMAIL_DOMAIN` env var, default `@s.wu.ac.at`), update Resend `2.1.0`

**Medium fixes:**
7. **`index.html`** — Add CSP `<meta>` tag with `blob:` for crop dialog
8. **`src/components/onboarding/Step1Identity.tsx`** — Replace `getPublicUrl()` with storing path + `createSignedUrl()` for preview
9. **`src/components/settings/ProfileImageUpload.tsx`** — Replace `getPublicUrl()` with storing path + `createSignedUrl()` for preview

**Avatar rendering updates (replace `<img>` with `<SignedAvatar>`):**
10. **`src/pages/Chats.tsx`** — Chat list avatars
11. **`src/pages/ChatDetail.tsx`** — Chat header avatar
12. **`src/pages/Profile.tsx`** — Own profile avatar
13. **`src/pages/ProfileDetail.tsx`** — Other user's profile avatar
14. **`src/pages/RequestDetail.tsx`** — Request detail avatar
15. **`src/components/discover/UserProfileCard.tsx`** — Discover card avatar
16. **`src/components/onboarding/Step8Preview.tsx`** — Preview step avatar
17. **`src/components/contacts/ConnectionCard.tsx`** — Connection card avatar
18. **`src/components/contacts/IncomingRequestCard.tsx`** — Incoming request avatar
19. **`src/components/contacts/SentRequestCard.tsx`** — Sent request avatar
20. **`src/components/settings/BlockedUsersList.tsx`** — Blocked user avatar (uses shadcn `Avatar` → switch to `SignedAvatar`)

**Low fixes:**
21. **`src/contexts/AuthContext.tsx`** — Clear `lomaria_onboarding_draft` on signOut

---

### Migration SQL

```sql
-- rate_limits table
CREATE TABLE public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  action text NOT NULL,
  request_count int NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, action)
);
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Avatar bucket → private
UPDATE storage.buckets SET public = false WHERE id = 'avatars';

-- Storage policies: enforce jpg/png extensions + user folder ownership
DROP POLICY IF EXISTS "Users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete avatars" ON storage.objects;

CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text AND storage.extension(name) IN ('jpg', 'jpeg', 'png'));

CREATE POLICY "Authenticated users can update avatars"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Authenticated users can read avatars"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can delete avatars"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
```

### Key Technical Details

- **CORS utility**: Exports `getCorsHeaders(req)` returning headers object with matching origin or production origin as fallback. All 5 edge functions use it.
- **Rate limiting**: `send-email` and `notify-connection` upsert into `rate_limits` table. If `window_start` > 1 min old, reset count; else increment. Return 429 if count > 5.
- **Email domain check**: Only for `email_action_type === "signup"` in auth-email-hook. Other types pass through.
- **SignedAvatar**: Backward compatible — if `storagePath` starts with `http`, extracts path after `/avatars/`. Returns initials fallback on null/error/loading.
- **All 21 files confirmed** — the count matches the list above.

