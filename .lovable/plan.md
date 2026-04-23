

## Plan: Reminder-E-Mails + Profilbild optional (genehmigt mit Anpassung)

### Teil A — Reminder-E-Mails (24h + 3 Tage)

**Neue Edge Function: `supabase/functions/send-onboarding-reminders/index.ts`**
- Läuft stündlich per Cron, `verify_jwt = false` in `config.toml`.
- Validiert eingehende Requests via `Authorization`-Header gegen `SUPABASE_SERVICE_ROLE_KEY` (kein Public Endpoint).
- Nutzt Service-Role Client, ruft `supabase.auth.admin.listUsers()` auf und joint mit `public.users` (Felder: `first_name`, `reminder_24h_sent_at`, `reminder_3d_sent_at`).
- Pro User:
  - `created_at` zwischen 24h und 25h alt + `reminder_24h_sent_at IS NULL` + `first_name` leer → Reminder #1
  - `created_at` zwischen 72h und 73h alt + `reminder_3d_sent_at IS NULL` + `first_name` leer → Reminder #2
  - Wenn `first_name` mittlerweile gesetzt ist → überspringen.
- Versand via interner Aufruf der bestehenden `send-email`-Function mit neuem Template-Key `onboarding_reminder` und `data.variant: '24h' | '3d'`.
- Tracking-Spalten in `public.users` setzen nach erfolgreichem Versand.

**DB-Migration**
```sql
ALTER TABLE public.users
  ADD COLUMN reminder_24h_sent_at timestamptz,
  ADD COLUMN reminder_3d_sent_at timestamptz;

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
```

**Cron-Job (per Insert-Tool, nicht Migration — enthält Service-Role-Key)**
```sql
SELECT cron.schedule(
  'onboarding-reminders-hourly',
  '0 * * * *',
  $$ SELECT net.http_post(
       url:='https://otzcvsbmswxcxpnqafpc.supabase.co/functions/v1/send-onboarding-reminders',
       headers:='{"Content-Type":"application/json","Authorization":"Bearer <SERVICE_ROLE_KEY>"}'::jsonb,
       body:='{}'::jsonb
     ); $$
);
```
**Wichtig (deine Anpassung):** Authorization-Header verwendet **Service Role Key**, damit die Function via `auth.admin.listUsers()` Vollzugriff hat. Die Function selbst prüft den Header gegen `SUPABASE_SERVICE_ROLE_KEY` und lehnt alles andere mit 401 ab.

**Erweiterung in `supabase/functions/send-email/index.ts`**
- Neuer Template-Key `onboarding_reminder`:
  - Subject: `Dein Lomaria-Profil wartet auf dich 👋`
  - Inhalt: Freundliche Erinnerung + CTA-Button zu `${appUrl}/onboarding`
  - Variante `'3d'` mit leicht anderem Text ("Letzte Erinnerung — vervollständige dein Profil")

**`supabase/config.toml`**
- Neue Function `send-onboarding-reminders` mit `verify_jwt = false`.

### Teil B — Profilbild optional

**`src/components/onboarding/Step1Identity.tsx`**
- `isValid = firstName.trim().length > 0` (Bild-Check raus).
- Avatar-Hinweis: `Profilbild (optional, empfohlen)`. Stern entfernen.
- Upload-Logik unverändert.

**`src/contexts/AppStateContext.tsx`**
- `data.profile_image &&` aus `isComplete`-Check entfernen.
- Neu: `first_name && age && study_program && intents>=2 && interests>=2`.

**`src/hooks/useDiscoverProfiles.ts`**
- Zusätzliche Filter: `.not("intents","is",null)` + JS-Filter `profile.intents && profile.intents.length >= 1`.
- Profilbild bleibt ungefiltert → `SignedAvatar` zeigt automatisch Initialen-Fallback.

### Was unverändert bleibt
- `SignedAvatar` (Initialen-Fallback existiert).
- Andere Onboarding-Schritte.
- `EditProfileForm` (Bild kann jederzeit nachgereicht werden).
- Bestehende E-Mail-Templates und `send-email`-Logik.

### Hinweis nach Implementierung
Die Reminder laufen stündlich. Erste Mails gehen erst raus an User, deren Account zur nächsten vollen Stunde genau 24h alt ist. Falls du eine einmalige Initial-Welle an die 16 bestehenden Abbrecher senden willst, sag Bescheid — kann ich als manuellen Trigger nachreichen.

