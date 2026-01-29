
# Intent-Detail-Chips Inline anzeigen

## Uebersicht

Alle 5 Intents mit Detail-Optionen sollen ihre Auswahlmoeglichkeiten direkt inline im Chip anzeigen - keine Dialoge, keine "Bearbeiten"-Buttons mehr.

## Aktuelle Situation

```
[✓] Projektpartner finden
    Phase: Idee, Konzept
    Rollen: Tech
    [Bearbeiten] ← Klick oeffnet Dialog
```

## Ziel-Design

```
[✓] Projektpartner finden
    
    Projektphase
    [Idee] [Konzept] [Umsetzung] [Offen]  ← direkt als Chips
    
    Gesuchte Rollen  
    [Tech] [Design] [Business] [Organisation] [Offen]  ← direkt als Chips
```

## Betroffene Intents

| Intent | Screen 1 | Screen 2 |
|--------|----------|----------|
| Projektpartner | Projektphase (multi) | Gesuchte Rollen (multi) |
| Startup | Status (single) | Eigener Beitrag (multi) |
| Networking | Fokus (multi) | Bereich (multi) |
| Neue Leute | Art (multi) | Energielevel (single) |
| Freundschaften | Art (single) | Umgang (single) |

## Technische Aenderungen

### 1. IntentChipWithDetails erweitern

Statt "Bearbeiten"-Button und kompakter Labels → Inline-Chips fuer jedes Detail-Feld:

```typescript
const renderInlineDetailFields = () => {
  if (!hasDetailScreens || !isActive) return null;
  
  const config = INTENT_DETAIL_OPTIONS[intent];
  
  return config.screens.map(screen => (
    <div key={screen.id}>
      <label>{screen.title}</label>
      <div className="flex flex-wrap gap-1.5">
        {screen.options.map(option => (
          <Chip 
            selected={isSelected(screen.id, option.value)}
            onClick={() => toggleOption(screen.id, option.value, screen.multiSelect)}
          />
        ))}
      </div>
    </div>
  ));
};
```

### 2. Logik fuer Auswahl-Handling

- **Multi-Select**: Toggle einzelne Werte (Array)
- **Single-Select**: Ersetzt bisherigen Wert (String)
- Aenderungen direkt in `intentDetails` speichern via Callback

### 3. Entfernen

- `onEdit` Prop nicht mehr noetig
- `onNewIntentAdded` Callback entfernen
- `EditIntentDetailsDialog` nicht mehr verwendet
- `IntentDetailDialog` nicht mehr verwendet
- Kein "Noch genauer?" Dialog mehr noetig

### 4. Onboarding Step4 anpassen

Gleiche Inline-Logik im Onboarding verwenden - keine separate Flow-Screens mehr.

## Betroffene Dateien

| Datei | Aenderung |
|-------|-----------|
| `src/components/settings/IntentChipWithDetails.tsx` | Inline-Chips statt Bearbeiten-Button |
| `src/components/onboarding/Step4Intents.tsx` | Gleiche Inline-Logik |
| `src/components/settings/EditProfileForm.tsx` | Vereinfachen (kein Dialog-State) |

## UX-Vorteile

- Schnellere Bedienung ohne Dialog-Oeffnen
- Alle Optionen sofort sichtbar
- Konsistent mit Nachhilfe-Intent
- Weniger Klicks noetig
