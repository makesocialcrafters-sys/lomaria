
# Plan: Discover-Sortierung mit Intent-Gruppierung

## Anforderung
- **Primäre Sortierung**: Profile mit mindestens einem gemeinsamen Intent zuerst
- **Sekundäre Sortierung**: Innerhalb der Gruppen nach bestehendem Matching-Score
- **Alle Profile anzeigen** (keine Ausblendung)

## Betroffene Datei

### `src/lib/matching-utils.ts`

**Änderung in der `sortByRelevance` Funktion:**

Die bisherige Logik sortiert nur nach Score. Die neue Logik:

```text
┌─────────────────────────────────────────────┐
│        Alle Profile                         │
└───────────────────────────────┬─────────────┘
                                │
          ┌─────────────────────┴─────────────────────┐
          ▼                                           ▼
┌─────────────────────┐                 ┌─────────────────────┐
│ GRUPPE 1            │                 │ GRUPPE 2            │
│ ≥1 gemeinsamer      │                 │ Kein gemeinsamer    │
│ Intent              │                 │ Intent              │
├─────────────────────┤                 ├─────────────────────┤
│ Sortiert nach       │                 │ Sortiert nach       │
│ Matching-Score      │                 │ Matching-Score      │
│ (mit Randomisierung)│                 │ (mit Randomisierung)│
└─────────────────────┘                 └─────────────────────┘
          │                                           │
          └───────────────────┬───────────────────────┘
                              ▼
┌─────────────────────────────────────────────┐
│     Finale Liste: Gruppe 1 + Gruppe 2       │
└─────────────────────────────────────────────┘
```

## Implementierung

```typescript
export function sortByRelevance<T extends {...}>(
  profiles: T[], 
  context: ScoringContext
): T[] {
  // Berechne Scores für alle Profile
  const scored: ScoredProfile<T>[] = profiles.map(profile => ({
    profile,
    score: calculateRelevanceScore(profile, context),
    hasSharedIntent: countSharedIntents(context.currentUserIntents, profile.intents) > 0,
  }));
  
  // Teile in zwei Gruppen auf
  const withSharedIntent = scored.filter(p => p.hasSharedIntent);
  const withoutSharedIntent = scored.filter(p => !p.hasSharedIntent);
  
  // Sortiere und randomisiere jede Gruppe separat
  const sortedWithShared = shuffleWithinScoreBands(withSharedIntent);
  const sortedWithoutShared = shuffleWithinScoreBands(withoutSharedIntent);
  
  // Kombiniere: Erst Profile mit gemeinsamen Intents, dann der Rest
  return [...sortedWithShared, ...sortedWithoutShared];
}
```

## Technische Details

1. **Erweiterung des `ScoredProfile` Interface**:
   - Neues Feld `hasSharedIntent: boolean` für die Gruppierung

2. **Anpassung der `shuffleWithinScoreBands` Funktion**:
   - Muss das erweiterte Interface unterstützen

3. **Keine Änderungen an**:
   - `matching-constants.ts` (Gewichtungen bleiben gleich)
   - `useDiscoverProfiles.ts` (Hook ruft weiterhin `sortByRelevance` auf)

## Auswirkung auf die Discover-Seite

| Vorher | Nachher |
|--------|---------|
| Profile sortiert nur nach Score | Profile zuerst nach "Hat gemeinsamen Intent", dann nach Score |
| Hoher Score = oben, auch ohne Intent-Match | Mindestens 1 gemeinsamer Intent = immer vor Profilen ohne Match |

## Beispiel

**User hat Intents**: "neue_leute", "projektpartner"

**Ergebnis-Reihenfolge**:
1. Anna (Score 25) - hat "neue_leute" ✓
2. Max (Score 18) - hat "projektpartner" ✓  
3. Lisa (Score 15) - hat "neue_leute" ✓
4. --- Grenze ---
5. Tom (Score 30) - hat "nachhilfe_anbieten" (kein Match)
6. Sarah (Score 12) - hat "networking" (kein Match)

Ohne die Änderung wäre Tom mit Score 30 ganz oben, obwohl kein gemeinsamer Intent existiert.
