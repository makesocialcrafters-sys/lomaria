
# Pending Connections blockieren nur den Sender

## Übersicht

Die aktuelle Logik behandelt `pending` als "User ist tabu" – das ist falsch. Eine pending Connection darf nur den Sender blockieren, nie den Empfänger.

**Golden Rule:** Eine pending Connection blockiert NUR den Sender – niemals den Empfänger.

---

## Änderungen

### 1. `src/hooks/useDiscoverProfiles.ts` (Zeilen 100-103)

**Aktuell:**
```typescript
// Hide pending and accepted connections
if (conn?.status === "pending" || conn?.status === "accepted") {
  return false;
}
```

**Neu:**
```typescript
// Hide only if current user is the SENDER of a pending request
if (conn?.status === "pending" && conn.from_user === currentUser.id) {
  return false;
}

// Hide accepted connections (both parties are in chat)
if (conn?.status === "accepted") {
  return false;
}
```

**Ergebnis:**
- A (Sender) sieht B nicht mehr in Discover
- B (Empfänger) sieht A weiterhin in Discover

---

### 2. `src/pages/ProfileDetail.tsx` (Zeilen 139-144)

**Aktuell:**
```typescript
if (status === "pending" && role === "receiver") {
  return (
    <Button width="full" variant="outline" onClick={() => navigate("/contacts")}>
      Eingehende Anfrage ansehen
    </Button>
  );
}
```

**Neu:**
```typescript
if (status === "pending" && role === "receiver") {
  return (
    <Button width="full" onClick={() => setIsDialogOpen(true)}>
      Kontakt anfragen
    </Button>
  );
}
```

**Ergebnis:** Empfänger kann selbst eine Anfrage senden (überschreibt die eingehende)

---

### 3. `src/components/profile/ContactRequestDialog.tsx` (Zeilen 44-51)

**Aktuell:**
```typescript
// Delete any existing rejected connection before creating new one
await supabase
  .from("connections")
  .delete()
  .eq("from_user", fromUserId)
  .eq("to_user", toUserId)
  .eq("status", "rejected");
```

**Neu:**
```typescript
// Delete any existing non-accepted connection in EITHER direction
await supabase
  .from("connections")
  .delete()
  .or(`and(from_user.eq.${fromUserId},to_user.eq.${toUserId}),and(from_user.eq.${toUserId},to_user.eq.${fromUserId})`)
  .in("status", ["pending", "rejected"]);
```

**Ergebnis:**
- Alte pending/rejected Connections werden in BEIDE Richtungen entfernt
- Richtung wird sauber neu gesetzt (B → A statt A → B)
- Kein Lock-Zustand mehr möglich

---

## Endresultat

| Situation | Verhalten |
|-----------|-----------|
| A → B pending | A blockiert, B frei |
| B sieht A in Discover | ✅ |
| B kann A anfragen | ✅ |
| Richtung wechselt | sauber |
| rejected | kein Lock |
| accepted | geschützt |
| Gleichberechtigung | ✅ |

---

## Technische Details

- **Keine Datenbank-Änderungen nötig**
- RLS-Policy `"Both users can delete non-accepted connections"` erlaubt bereits:
  - Sender löscht `pending` ✅
  - Empfänger löscht `pending` ✅
  - Beide löschen `rejected` ✅
