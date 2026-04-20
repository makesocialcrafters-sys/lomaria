

## Fix: Registrierung schlägt mit „429: email rate limit exceeded" fehl

### Diagnose

Auth-Logs zeigen eindeutig:
```
POST /signup → 429
error_code: over_email_send_rate_limit
```

Supabase versendet die Bestätigungsmail über den **eingebauten SMTP-Server** (Default-Limit: 2 Mails/Stunde projektweit) und blockt jede weitere Registrierung.

Google-Login funktioniert, weil dabei keine Bestätigungsmail nötig ist.

Die existierende `supabase/functions/auth-email-hook/index.ts` (mit Resend) wird **nicht aufgerufen** — der Auth Email Hook ist im Supabase-Dashboard nicht aktiv verknüpft, oder das Secret stimmt nicht.

### Lösung: Auth Email Hook neu scaffoldieren mit dem managed Lovable-Flow

Der bestehende Hook nutzt den alten Pattern (Resend direkt + `SEND_EMAIL_HOOK_SECRET`). Der moderne Lovable-Weg:
- Lovable verwaltet Credentials automatisch (kein Resend-Key, kein Hook-Secret)
- Templates werden über die Queue versendet (Retry, Rate-Limit-Handling)
- Aktivierung erfolgt automatisch nach Deploy

### Schritte

1. **Domain-Status prüfen** (`email_domain--check_email_domain_status`) — vermutlich existiert bereits die Lomaria-Domain.
2. **`email_domain--scaffold_auth_email_templates`** aufrufen mit `confirm_overwrite: true`, da Templates schon existieren. Das ersetzt:
   - `supabase/functions/auth-email-hook/index.ts` (neue Queue-basierte Variante)
   - Erstellt `supabase/functions/_shared/email-templates/*.tsx` (signup, recovery, magic-link, email-change, invite, reauthentication)
3. **Templates an Lomaria-Branding anpassen** — Wes Anderson Premium Minimalism, Gold #C6A94D, Josefin Sans, dezent gehalten. Hintergrund `#ffffff` (Pflicht laut System).
4. **Deploy**: `supabase--deploy_edge_functions(["auth-email-hook"])`.
5. Lovable verknüpft den Hook automatisch in den Auth-Settings — danach läuft die Registrierung wieder.

### Was NICHT angefasst wird

- `Auth.tsx`, `AuthContext.tsx`, `validations.ts` — funktionieren korrekt
- `signUp`-Logik im Frontend — der 429er kommt aus dem Backend, nicht aus dem Code
- Andere Edge Functions, UI, Onboarding-Flow, Avatare etc.

### Erwartetes Ergebnis

- Registrierung mit E-Mail funktioniert wieder
- Bestätigungsmail kommt im gewohnten Lomaria-Look
- Kein Rate-Limit mehr (Lovable Mail-Queue + Resend skalieren weit über die Supabase-Defaults)

### Hinweis

Falls die alte Hook-Verknüpfung (`SEND_EMAIL_HOOK_SECRET`) im Supabase-Dashboard noch aktiv ist, kann sie nach erfolgreichem Deploy entfernt werden. Lovable macht das im Normalfall automatisch.

