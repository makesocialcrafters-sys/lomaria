

## Fix: Set `ALLOWED_EMAIL_DOMAIN` secret to `@gmail.com`

### Root cause
`auth-email-hook/index.ts` reads `Deno.env.get("ALLOWED_EMAIL_DOMAIN")` and falls back to `@s.wu.ac.at` when unset. The secret is missing in this Supabase project (confirmed: secrets list contains no `ALLOWED_EMAIL_DOMAIN`), so every signup is rejected with HTTP 422.

### Fix
Add the secret `ALLOWED_EMAIL_DOMAIN` = `@gmail.com` to the project's Edge Function secrets. No code change needed — the hook already reads it correctly, and `src/lib/validations.ts` is already aligned to `@gmail.com` for the client-side check.

### Steps
1. Add the runtime secret via the secrets tool (handled in default mode after approval).
2. No redeploy of `auth-email-hook` is required — Edge Functions read secrets at invocation time.
3. Confirm by attempting a signup with a `@gmail.com` address.

### Notes
- Pre-launch switch to `@s.wu.ac.at`: just update the same secret value, no code change.
- Nothing else touched: no migrations, no code edits, no template changes.

