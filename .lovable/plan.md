

## Beliebige E-Mail-Domains erlauben

Du willst die Domain-Restriktion komplett aufheben — jede E-Mail-Adresse soll registrieren können.

### Änderungen

**1. `supabase/functions/auth-email-hook/index.ts`**
Den Domain-Check beim `signup`-Event komplett entfernen (Zeilen ~178–192). Kein Fallback, keine Prüfung.

**2. `src/lib/validations.ts`**
`emailSchema` vereinfachen — nur noch `.email()`-Validierung, kein `.refine()` mit Domain-Check mehr. Konstante `ALLOWED_EMAIL_DOMAIN` entfernen.

**3. Secret `ALLOWED_EMAIL_DOMAIN`**
Bleibt einfach gesetzt, wird aber nicht mehr gelesen — kein Aufräumen nötig (schadet nicht). Falls du willst, können wir es später in den Edge Function Secrets löschen.

### Was nicht angefasst wird
- Captcha-Thema bleibt separat (siehe vorherige Antwort) — falls Signup weiter 500 wirft, muss Captcha im Supabase-Dashboard deaktiviert oder ins Frontend integriert werden.
- Keine Migrationen, keine Template-Änderungen, keine sonstigen Auth-Anpassungen.

### Memory-Update
`mem://auth/registration-policy-pivot` aktualisieren: „Keine Domain-Restriktion mehr — alle gültigen E-Mail-Adressen erlaubt."

