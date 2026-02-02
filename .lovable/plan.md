

# E-Mail-Abmeldung per Link im Template

## Übersicht

Statt eines Settings-Toggles: Ein "E-Mails abbestellen"-Link im Footer jeder Benachrichtigungs-E-Mail. Ein Klick führt zur App, wo die Präferenz gespeichert wird.

## Ablauf

```text
E-Mail erhalten → Link klicken → /unsubscribe?token=xxx → Bestätigung → Fertig
```

---

## Technische Umsetzung

### 1. Datenbank-Migration

Neue Spalte in der `users`-Tabelle:

```sql
ALTER TABLE public.users 
ADD COLUMN email_notifications_enabled boolean NOT NULL DEFAULT true;
```

### 2. Edge Function für Unsubscribe

**Neue Datei:** `supabase/functions/unsubscribe-email/index.ts`

- Empfängt User-ID als signiertes Token (verhindert Missbrauch)
- Setzt `email_notifications_enabled = false` für den Nutzer
- Gibt eine einfache Bestätigungsseite zurück (HTML)

```typescript
// Token-Struktur: base64(userId + ":" + hmac(userId, secret))
// Verifiziert, dass nur der echte Nutzer abmelden kann
```

### 3. E-Mail-Templates erweitern

**Datei:** `supabase/functions/notify-connection/index.ts`

Im `emailWrapper` Footer hinzufügen:

```html
<tr>
  <td align="center" style="padding-top: 24px;">
    <a href="${appUrl}/unsubscribe?token=${unsubscribeToken}" 
       style="font-size: 11px; color: #666; text-decoration: underline;">
      E-Mail-Benachrichtigungen abbestellen
    </a>
  </td>
</tr>
```

### 4. Frontend-Seite für Unsubscribe

**Neue Datei:** `src/pages/Unsubscribe.tsx`

- Liest `token` aus URL-Parametern
- Ruft die Edge Function auf
- Zeigt Bestätigung: "Du erhältst keine E-Mails mehr von Lomaria"
- Optional: Button um sich wieder anzumelden

### 5. Prüfung vor E-Mail-Versand

**Datei:** `supabase/functions/notify-connection/index.ts`

Nach dem Laden des Empfängers:

```typescript
const { data: recipient } = await supabase
  .from("users")
  .select("first_name, last_name, email, email_notifications_enabled")
  .eq("id", toUserId)
  .single();

if (recipient.email_notifications_enabled === false) {
  console.log(`Notifications disabled for ${toUserId}`);
  return new Response(JSON.stringify({ success: true, skipped: true }), ...);
}
```

### 6. Settings-Seite (optional)

Zusätzlich in `Settings.tsx` einen Status anzeigen + Re-Subscribe Option:

```tsx
{!emailNotificationsEnabled && (
  <div className="p-4 border border-border/40 rounded-lg">
    <p className="text-sm text-muted-foreground">
      E-Mail-Benachrichtigungen sind deaktiviert.
    </p>
    <Button variant="link" onClick={handleResubscribe}>
      Wieder aktivieren
    </Button>
  </div>
)}
```

---

## Token-Generierung (Sicherheit)

```typescript
// In notify-connection - Token erstellen
function createUnsubscribeToken(userId: string, secret: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(userId);
  const key = encoder.encode(secret);
  // HMAC-SHA256 für Signatur
  const signature = await crypto.subtle.sign("HMAC", key, data);
  return btoa(userId + ":" + arrayBufferToHex(signature));
}
```

---

## Betroffene Dateien

| Datei | Änderung |
|-------|----------|
| Migration | `email_notifications_enabled` Spalte |
| `supabase/functions/unsubscribe-email/index.ts` | Neue Edge Function |
| `supabase/functions/notify-connection/index.ts` | Token generieren + Footer + Prüfung |
| `src/pages/Unsubscribe.tsx` | Neue Seite für Bestätigung |
| `src/App.tsx` | Route `/unsubscribe` hinzufügen |
| `src/pages/Settings.tsx` | Status anzeigen + Re-Subscribe |

## Resultat

- Ein Klick in der E-Mail → Keine E-Mails mehr
- Sicher durch signierte Tokens
- Re-Subscribe in den Settings möglich
- Keine Login-Pflicht für Abmeldung

