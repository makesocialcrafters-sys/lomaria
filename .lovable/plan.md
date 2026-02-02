

# Unsubscribe-Link zu lomaria.at führen

## Übersicht

Der "E-Mail-Benachrichtigungen abbestellen"-Link im E-Mail-Footer soll einfach auf `https://lomaria.at` verweisen, anstatt auf eine Unsubscribe-Seite mit Parametern.

---

## Technische Umsetzung

**Datei:** `supabase/functions/notify-connection/index.ts`

### Änderung im E-Mail-Footer (Zeile 61)

```typescript
// Von:
<a href="https://lomaria.at/unsubscribe?email=${encodeURIComponent(recipientEmail)}" 
   style="font-size: 11px; color: ${BRAND_COLORS.textMuted}; text-decoration: underline;">
  E-Mail-Benachrichtigungen abbestellen
</a>

// Zu:
<a href="https://lomaria.at" 
   style="font-size: 11px; color: ${BRAND_COLORS.textMuted}; text-decoration: underline;">
  E-Mail-Benachrichtigungen abbestellen
</a>
```

---

## Betroffene Dateien

| Datei | Änderung |
|-------|----------|
| `supabase/functions/notify-connection/index.ts` | Footer-Link auf `https://lomaria.at` ändern |

---

## Hinweis

Der List-Unsubscribe Header für Gmail/Outlook One-Click bleibt auf die Edge Function zeigen (`/unsubscribe-email`), da dieser direkt die API aufruft und keinen Browser-Redirect benötigt. Nur der sichtbare Footer-Link wird geändert.

