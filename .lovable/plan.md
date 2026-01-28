
# CTA-Logik für Empfänger bei rejected-Status korrigieren

## Problem

Im Screenshot sieht man "Bereits bearbeitet" als disabled Button für den Empfänger einer abgelehnten Anfrage. Das ist falsch:

- **Aktuell**: Empfänger sieht `"Bereits bearbeitet"` (disabled) → Sackgasse
- **Gewünscht**: Empfänger sieht `"Kontakt anfragen"` (aktiv) → Kann selbst anfragen

## Analyse

In `src/pages/ProfileDetail.tsx` (Zeilen 163-165):

```typescript
if (status === "rejected" && role === "receiver") {
  return <Button disabled width="full" variant="outline">Bereits bearbeitet</Button>;
}
```

## Lösung

Die CTA-Logik so anpassen, dass der Empfänger nach einer Ablehnung selbst eine neue Anfrage senden kann.

### Änderung in `src/pages/ProfileDetail.tsx`

**Zeilen 163-165 ändern von:**
```typescript
if (status === "rejected" && role === "receiver") {
  return <Button disabled width="full" variant="outline">Bereits bearbeitet</Button>;
}
```

**Zu:**
```typescript
if (status === "rejected" && role === "receiver") {
  return (
    <Button width="full" onClick={() => setIsDialogOpen(true)}>
      Kontakt anfragen
    </Button>
  );
}
```

## Ergebnis nach der Änderung

| Rolle | Status | CTA |
|-------|--------|-----|
| Sender | `pending` | "Anfrage gesendet" (disabled) ✅ |
| Empfänger | `pending` | "Eingehende Anfrage ansehen" ✅ |
| Sender | `rejected` | "Kontakt anfragen" (aktiv) ✅ |
| Empfänger | `rejected` | "Kontakt anfragen" (aktiv) ✅ **NEU** |
| Beide | `accepted` | "Chat öffnen" ✅ |

## Technische Details

- Keine Datenbank-Änderungen nötig
- Die RLS-Policy `"Both users can delete non-accepted connections"` erlaubt bereits das Löschen von `rejected` Connections
- `ContactRequestDialog` löscht die bestehende `rejected` Connection automatisch bevor eine neue erstellt wird
