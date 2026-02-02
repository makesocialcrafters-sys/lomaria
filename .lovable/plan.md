

# E-Mail-Unsubscribe mit List-Unsubscribe Headers

## Übersicht

Vollständiger E-Mail-Abmelde-Flow mit One-Click-Unsubscribe für Gmail/Outlook und manuellem Footer-Link als Fallback. Die Datenbank-Spalte `email_notifications_enabled` ist bereits vorhanden.

---

## Betroffene Dateien

| Datei | Aktion |
|-------|--------|
| `supabase/functions/notify-connection/index.ts` | Ändern |
| `supabase/functions/unsubscribe-email/index.ts` | Neu erstellen |
| `supabase/config.toml` | Ergänzen |
| `src/pages/Unsubscribe.tsx` | Neu erstellen |
| `src/pages/Settings.tsx` | Erweitern |
| `src/App.tsx` | Route hinzufügen |
| `src/hooks/useOwnProfile.ts` | Feld ergänzen |

---

## Technische Umsetzung

### 1. Edge Function: notify-connection erweitern

**Änderungen in `supabase/functions/notify-connection/index.ts`:**

**a) emailWrapper anpassen** - Unsubscribe-Link im Footer + recipientEmail als Parameter:
```typescript
const emailWrapper = (content: string, recipientEmail: string) => `
  ...
  <!-- Vor dem Copyright-Footer -->
  <tr>
    <td align="center" style="padding-top: 24px;">
      <a href="https://lomaria.at/unsubscribe?email=${encodeURIComponent(recipientEmail)}" 
         style="font-size: 11px; color: ${BRAND_COLORS.textMuted}; text-decoration: underline;">
        E-Mail-Benachrichtigungen abbestellen
      </a>
    </td>
  </tr>
  ...
`;
```

**b) Recipient-Query erweitern** (Zeile 114-118):
```typescript
const { data: recipient, error: recipientError } = await supabase
  .from("users")
  .select("first_name, last_name, email, email_notifications_enabled")
  .eq("id", toUserId)
  .single();
```

**c) Early Return** wenn E-Mails deaktiviert (nach Zeile 128):
```typescript
if (recipient.email_notifications_enabled === false) {
  console.log(`Email notifications disabled for user ${toUserId}, skipping`);
  return new Response(
    JSON.stringify({ success: true, skipped: true, reason: "notifications_disabled" }),
    { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
}
```

**d) List-Unsubscribe Headers** bei Resend hinzufügen (Zeile 204-209):
```typescript
const { error } = await resend.emails.send({
  from: "Lomaria <hi@hi.lomaria.at>",
  to: [recipientEmail],
  subject,
  html: htmlContent,
  headers: {
    "List-Unsubscribe": `<https://lomaria.at/unsubscribe?email=${encodeURIComponent(recipientEmail)}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  },
});
```

**e) emailWrapper-Aufrufe anpassen** - recipientEmail übergeben:
```typescript
htmlContent = emailWrapper(`...`, recipientEmail);
```

---

### 2. Neue Edge Function: unsubscribe-email

**Neue Datei:** `supabase/functions/unsubscribe-email/index.ts`

- Unterstützt GET (Footer-Link) und POST (Gmail One-Click)
- POST: `application/x-www-form-urlencoded` für Gmail, optional JSON
- Liest `email` aus URL-Parameter oder Body
- Setzt `email_notifications_enabled = false`
- Gibt `{ success: true }` zurück
- Robustes Error-Handling

---

### 3. Konfiguration

**Datei:** `supabase/config.toml`

```toml
[functions.unsubscribe-email]
verify_jwt = false
```

---

### 4. Frontend: Unsubscribe-Seite

**Neue Datei:** `src/pages/Unsubscribe.tsx`

- Liest `email` aus URL-Parameter
- Ruft Edge Function beim Laden auf
- States: Loading → Erfolg → Fehler
- Lomaria-Design mit Gold-Akzenten
- Text: "Du erhältst keine E-Mails mehr von Lomaria."
- Link zu Login/Settings für Re-Subscribe

---

### 5. Route registrieren

**Datei:** `src/App.tsx`

Neue öffentliche Route:
```tsx
import Unsubscribe from "./pages/Unsubscribe";

// Bei den Public Routes (nach Zeile 56):
<Route path="/unsubscribe" element={<Unsubscribe />} />
```

---

### 6. Settings: E-Mail-Toggle

**Datei:** `src/pages/Settings.tsx`

Neuer Toggle zwischen "Angemeldet als" und "Passwort ändern":

- Aktuellen Status via `useOwnProfile` laden
- Switch-Komponente für Toggle
- Direktes Update via `supabase.from("users").update()`
- Toast-Feedback bei Änderung
- Label: "E-Mail-Benachrichtigungen" mit Beschreibung

---

### 7. Hook erweitern

**Datei:** `src/hooks/useOwnProfile.ts`

```typescript
export interface OwnProfileData {
  // ... bestehende Felder
  email_notifications_enabled: boolean;
}
```

Da bereits `select("*")` verwendet wird, muss nur das Interface angepasst werden.

---

## Ablauf

```text
┌─────────────────────────────────────────────────────────────┐
│  E-Mail mit List-Unsubscribe Header versenden               │
└─────────────────┬───────────────────────────────────────────┘
                  │
     ┌────────────┴────────────┐
     ▼                         ▼
┌──────────────┐        ┌──────────────────┐
│ Gmail/Outlook│        │ Footer-Link      │
│ "Abmelden"   │        │ klicken          │
└──────┬───────┘        └────────┬─────────┘
       │                         │
       ▼                         ▼
┌──────────────────────────────────────────┐
│ POST/GET /unsubscribe-email?email=...    │
└──────────────────┬───────────────────────┘
                   ▼
┌──────────────────────────────────────────┐
│ users.email_notifications_enabled=false  │
└──────────────────┬───────────────────────┘
                   ▼
┌──────────────────────────────────────────┐
│ /unsubscribe Seite zeigt Bestätigung     │
└──────────────────────────────────────────┘
```

---

## Ergebnis

- One-Click-Unsubscribe in Gmail/Outlook
- Footer-Link als Fallback
- Keine E-Mails mehr nach Abmeldung
- Re-Subscribe jederzeit in Settings
- DSGVO-konform (keine Login-Pflicht)
- Produktionsreif

