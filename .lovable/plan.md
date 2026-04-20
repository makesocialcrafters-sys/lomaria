

## Fix: Auth Email Hook re-registrieren

### Problem
Der `auth-email-hook` ist deployed und in den Supabase-Auth-Settings als Send-Email-Hook aktiviert — trotzdem ruft Supabase ihn nicht auf und fällt auf den Standard-SMTP zurück (→ 429 Rate-Limit beim Signup). Die Function-Logs zeigen ausschließlich Boot/Shutdown, **null** eingehende Webhook-Aufrufe.

### Ursache
Die Verknüpfung zwischen Supabase Auth und der Edge Function ist „verklebt": Sie gilt im Dashboard als aktiv, ist im Auth-Backend aber nicht sauber registriert. Üblicher Auslöser nach mehreren Re-Scaffolds + alten Secrets (`SEND_EMAIL_HOOK_SECRET` ist noch gesetzt, obwohl der neue Hook ausschließlich `LOVABLE_API_KEY` zur Signaturprüfung nutzt).

### Vorgehen

1. **Email-Pipeline aus- und wieder einschalten** — `email_domain--toggle_project_emails` mit `enabled: false`, dann `enabled: true`. Der Off→On-Zyklus erzwingt eine vollständige Neu-Registrierung des Hooks im Supabase-Auth-Backend (Hook-URL, Secret, `verify_jwt`-Konfiguration werden frisch geschrieben).

2. **Hook re-scaffolden** — `email_domain--scaffold_auth_email_templates` mit `confirm_overwrite: true`. Schreibt `supabase/functions/auth-email-hook/index.ts` und `config.toml`-Eintrag neu, ohne die bestehenden Lomaria-gebrandeten Templates inhaltlich zu verändern.

3. **Function deployen** — `supabase--deploy_edge_functions(["auth-email-hook"])`.

4. **Verifikation per Logs** — direkt nach Deploy:
   - In den `auth-email-hook`-Logs muss bei einem neuen Signup `Received auth event` mit `emailType: signup` erscheinen, **nicht** mehr nur Boot/Shutdown.
   - In den Auth-Logs muss `POST /signup` mit Status `200` (statt `429`) auftauchen.

5. **Falls Schritt 4 weiterhin keine Webhook-Calls zeigt** — dann ist die Hook-Verknüpfung auf Backend-Seite blockiert und nicht code-seitig lösbar. Konkrete Anweisung an dich: **Cloud → Emails öffnen** und nach „Action required", „Setup incomplete" oder „Rerun Setup" suchen und auslösen.

### Was NICHT angefasst wird
- `Auth.tsx`, `AuthContext.tsx`, Validierungen, Frontend-Logik
- Lomaria-Branding der Templates (Gold #C6A94D, Josefin Sans, deutscher Text bleiben erhalten)
- Andere Edge Functions (`send-email`, `notify-connection`, `delete-account`, `unsubscribe-email`)
- Datenbank, RLS, Onboarding, Discover, Chats, UI
- Alte Secrets (`SEND_EMAIL_HOOK_SECRET`, `RESEND_API_KEY`) — werden nicht mehr genutzt, kosten aber nichts; bewusst nicht entfernt, um Seiteneffekte zu vermeiden

### Erfolgskriterien
- Auth-Logs: `POST /signup → 200` (kein 429 mehr)
- `auth-email-hook`-Logs: eingehender Webhook mit `emailType: signup` nach jedem Signup-Versuch
- Bestätigungsmail trifft im Postfach ein, Lomaria-Look, Absender aus dem `notify.lomaria.at`-Setup

