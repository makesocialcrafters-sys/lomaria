
# Discover-Cache nach Unmatch sofort invalidieren

## Problem

Nach dem Beenden einer Verbindung erscheinen die Profile nicht sofort in Discover, weil der `discover-profiles` Cache eine `staleTime` von 5 Minuten hat und im `UnmatchDialog` nicht invalidiert wird.

## Lösung

Eine einzige Zeile hinzufügen in `src/components/user-actions/UnmatchDialog.tsx`:

### Änderung (Zeile 55 - nach den bestehenden Invalidierungen)

```typescript
// Aktuell (Zeilen 50-55):
if (user) {
  queryClient.invalidateQueries({ queryKey: ["chats-preview", user.id] });
  queryClient.invalidateQueries({ queryKey: ["accepted-connections", user.id] });
  queryClient.invalidateQueries({ queryKey: ["chat", connectionId] });
}

// Neu (Zeile 55 hinzufügen):
if (user) {
  queryClient.invalidateQueries({ queryKey: ["chats-preview", user.id] });
  queryClient.invalidateQueries({ queryKey: ["accepted-connections", user.id] });
  queryClient.invalidateQueries({ queryKey: ["chat", connectionId] });
  queryClient.invalidateQueries({ queryKey: ["discover-profiles"] }); // <-- NEU
}
```

## Ergebnis

- Nach Unmatch: Beide Profile erscheinen **sofort** wieder in Discover
- Kein Warten auf 5-Minuten-Cache-Ablauf
- User-Experience: Nahtlos und reaktiv

## Technische Details

- `invalidateQueries` mit Partial-Key `["discover-profiles"]` invalidiert alle Discover-Queries (unabhängig von Filtern)
- Keine Datenbank-Änderungen nötig
- Minimale Code-Änderung (1 Zeile)
