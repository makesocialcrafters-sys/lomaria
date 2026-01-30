
# Pending-Anfrage: Annehmen/Ablehnen direkt im Profil anzeigen

## Problem

Wenn A an B eine Kontaktanfrage schickt und B das Profil von A oeffnet:
- **Aktuell:** B sieht "Kontakt anfragen" Button
- **Erwartet:** B sieht "Annehmen" und "Ablehnen" Buttons

## Loesung

Wenn B (Empfaenger einer pending Anfrage) das Profil von A besucht, direkt zwei Buttons anzeigen:
- **Annehmen** - akzeptiert die Anfrage und navigiert zu Chats
- **Ablehnen** - lehnt die Anfrage ab und navigiert zurueck

## Technische Aenderung

**Datei:** `src/pages/ProfileDetail.tsx`

In der `getConnectionCTA` Funktion (Zeilen 145-150) aendern:

```typescript
// Alt:
if (status === "pending" && role === "receiver") {
  return (
    <Button width="full" onClick={() => setIsDialogOpen(true)}>
      Kontakt anfragen
    </Button>
  );
}

// Neu:
if (status === "pending" && role === "receiver") {
  return (
    <div className="flex gap-3">
      <Button 
        variant="outline" 
        className="flex-1"
        onClick={handleReject}
      >
        Ablehnen
      </Button>
      <Button 
        className="flex-1"
        onClick={handleAccept}
      >
        Annehmen
      </Button>
    </div>
  );
}
```

Neue Funktionen hinzufuegen:

```typescript
const handleAccept = async () => {
  if (!connectionData?.id) return;
  
  await supabase
    .from("connections")
    .update({ status: "accepted" })
    .eq("id", connectionData.id);
    
  toast.success("Kontakt akzeptiert!");
  navigate("/chats");
};

const handleReject = async () => {
  if (!connectionData?.id) return;
  
  await supabase
    .from("connections")
    .update({ status: "rejected" })
    .eq("id", connectionData.id);
    
  toast.success("Anfrage abgelehnt");
  navigate(-1);
};
```

## Ergebnis

| Situation | Anzeige | Aktion |
|-----------|---------|--------|
| A sendet an B, A besucht B's Profil | "Anfrage gesendet" (disabled) | - |
| A sendet an B, B besucht A's Profil | **[Ablehnen] [Annehmen]** | Accept/Reject |
| Accepted | "Chat oeffnen" | → Chats |
| Rejected / Keine Verbindung | "Kontakt anfragen" | → Dialog |

## Betroffene Datei

| Datei | Aenderung |
|-------|-----------|
| `src/pages/ProfileDetail.tsx` | Accept/Reject Buttons fuer "receiver + pending" |
