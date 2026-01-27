
# Cooldown-Logik für Ablehnungen entfernen

## Übersicht

Die aktuelle 72-Stunden-Cooldown-Logik wird vollständig entfernt. Nach dem Entfernen kann ein abgelehnter Nutzer sofort eine neue Anfrage senden.

---

## Betroffene Dateien

### 1. Datei löschen: `src/lib/cooldown-utils.ts`
Die gesamte Utility-Datei wird nicht mehr benötigt.

### 2. `src/components/profile/ContactRequestDialog.tsx`

**Änderungen:**
- `COOLDOWN_MS` Konstante entfernen
- Die gesamte Cooldown-Prüflogik entfernen (Zeilen 47-74)
- Bei existierender rejected Connection: direkt löschen und neue Anfrage erstellen

**Vorher:**
```typescript
// Check for existing rejected connection with cooldown
const { data: existingRejection } = await supabase...
if (existingRejection?.rejected_at) {
  // Cooldown-Check
  if (now < cooldownEnd) {
    toast.error(`Bitte warte noch ${hoursLeft} Stunden.`);
    return;
  } else {
    await supabase.from("connections").delete()...
  }
}
```

**Nachher:**
```typescript
// Delete any existing rejected connection before creating new one
await supabase
  .from("connections")
  .delete()
  .eq("from_user", fromUserId)
  .eq("to_user", toUserId)
  .eq("status", "rejected");
// Create new connection request...
```

### 3. `src/pages/ProfileDetail.tsx`

**Änderungen:**
- Import von `getCooldownInfo` und `CooldownInfo` entfernen
- `rejected_at` aus dem ConnectionRow Typ entfernen
- `rejected_at` aus der Supabase-Abfrage entfernen
- `cooldownInfo` State-Berechnung entfernen
- CTA-Logik für "rejected + sender" vereinfachen (kein Cooldown-Check mehr)

**Vorher:**
```typescript
if (status === "rejected" && role === "sender") {
  if (cooldownInfo?.isActive) {
    return (
      <div className="space-y-2">
        <Button disabled>Anfrage nicht möglich</Button>
        <p>Du kannst diese Person in {cooldownInfo.remainingText} erneut kontaktieren.</p>
      </div>
    );
  }
  return <Button onClick={() => setIsDialogOpen(true)}>Kontakt anfragen</Button>;
}
```

**Nachher:**
```typescript
if (status === "rejected" && role === "sender") {
  return (
    <Button width="full" onClick={() => setIsDialogOpen(true)}>
      Kontakt anfragen
    </Button>
  );
}
```

### 4. `src/hooks/useDiscoverProfiles.ts`

**Änderungen:**
- Import von `getCooldownInfo` und `CooldownInfo` entfernen
- `cooldownInfo` aus dem UserProfile Interface entfernen
- `COOLDOWN_HOURS` Konstante entfernen
- `rejected_at` aus der Connections-Abfrage entfernen
- Filterlogik vereinfachen: rejected Connections nicht mehr verstecken

**Vorher:**
```typescript
// Hide rejected connections during cooldown (72 hours)
if (conn?.status === "rejected" && conn.rejected_at) {
  const cooldownInfo = getCooldownInfo(conn.rejected_at);
  if (cooldownInfo.isActive) {
    return false;
  }
}
```

**Nachher:**
```typescript
// Rejected connections werden nicht mehr gefiltert
// User können sofort eine neue Anfrage senden
```

---

## Datenbank-Änderungen

### 1. RLS Policy anpassen

Die bestehende Policy erlaubt nur das Löschen von rejected Connections nach 72 Stunden.

**Vorher:**
```sql
Policy: "Sender can delete expired rejected connections"
Using: (status = 'rejected') 
  AND (rejected_at IS NOT NULL) 
  AND (rejected_at < (now() - '72:00:00'::interval))
```

**Nachher:** Policy ändern, um das sofortige Löschen zu erlauben:
```sql
Policy: "Sender can delete rejected connections"
Using: (status = 'rejected') 
  AND (auth.uid() = (SELECT users.auth_user_id FROM users WHERE users.id = connections.from_user))
```

### 2. Trigger belassen

Der Trigger `set_rejected_at` kann bestehen bleiben – er schadet nicht und könnte für zukünftige Analytics nützlich sein.

---

## Zusammenfassung der Änderungen

| Datei | Aktion |
|-------|--------|
| `src/lib/cooldown-utils.ts` | Löschen |
| `src/components/profile/ContactRequestDialog.tsx` | Cooldown-Logik entfernen |
| `src/pages/ProfileDetail.tsx` | Cooldown-UI entfernen |
| `src/hooks/useDiscoverProfiles.ts` | Cooldown-Filter entfernen |
| RLS Policy auf `connections` | 72h-Bedingung entfernen |
