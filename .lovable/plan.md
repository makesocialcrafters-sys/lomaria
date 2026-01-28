
# Pending-Anfragen korrekt aus Discover ausblenden

## Problem

Die aktuelle Filter-Logik in `useDiscoverProfiles.ts` ist falsch:

```typescript
// Aktuell (Zeile 100-103):
if (conn?.status === "pending" && conn.from_user === currentUser.id) {
  return false;
}
```

**Was passiert:**
- User A sendet Anfrage an User B
- Connection: `from_user = A, to_user = B, status = pending`
- Wenn User B browst: `currentUser.id = B`
- Prüfung: `conn.from_user === B` → **false** (A ist sender, nicht B)
- Ergebnis: A wird **nicht** ausgefiltert und erscheint in B's Discover

**Was passieren sollte:**
- User A erscheint in B's "Kontakte (Anfragen)" ✓
- User A erscheint **nicht** in B's Discover ✗

## Lösung

Die Logik erweitern: Bei JEDER pending Connection (egal ob Sender oder Empfänger) das andere Profil aus Discover ausblenden.

### Änderung in `src/hooks/useDiscoverProfiles.ts`

```typescript
// Zeilen 100-103 ersetzen:

// VORHER (falsch):
if (conn?.status === "pending" && conn.from_user === currentUser.id) {
  return false;
}

// NACHHER (korrekt):
// Hide ALL pending connections - both sender and receiver should not see each other in Discover
if (conn?.status === "pending") {
  return false;
}
```

## Warum diese Änderung korrekt ist

| Szenario | Vor der Änderung | Nach der Änderung |
|----------|------------------|-------------------|
| A sendet an B, B browst Discover | A erscheint ❌ | A verschwindet ✅ |
| A sendet an B, A browst Discover | A's Anfrage versteckt ✅ | A's Anfrage versteckt ✅ |
| B hat Anfrage von A | A in Kontakte ✅ | A in Kontakte ✅ |

## Logik-Zusammenfassung

- `pending` → Verstecken (beide Seiten sehen sich nicht in Discover)
- `accepted` → Verstecken (beide sind im Chat)
- `rejected` → Zeigen (neue Anfrage möglich)
- keine Connection → Zeigen

## Betroffene Datei

`src/hooks/useDiscoverProfiles.ts` - Zeilen 100-103

## Technische Details

- Minimale Änderung: Nur die Bedingung `&& conn.from_user === currentUser.id` entfernen
- Keine Datenbank-Änderungen nötig
- Cache wird automatisch aktualisiert wenn User navigiert
