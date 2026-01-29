
# Erweiterung: Intent-Details im Edit-Profile-Flow

## Uebersicht

Der aktuelle Edit-Profile-Flow zeigt Intents als einfache Chips ohne Anzeige oder Bearbeitungsmoeglichkeit der zugehoerigen Details. Die Erweiterung fuegt eine vollstaendige Intent-Detail-Verwaltung hinzu.

## Aktuelle Situation

```
Intents *
[Neue Leute] [Projektpartner] [Networking]  ← Nur Chips, keine Details sichtbar
```

## Ziel-Design

```
Ich suche *

[✓] Projektpartner finden
    Projektphase: Idee, Konzept
    Rollen: Tech, Business
    [Bearbeiten]

[✓] Neue Leute kennenlernen
    Art: Lernen, Gespräche
    [Details hinzufügen]

[ ] Startup / Gründer-Mitstreiter
    ← Inaktiv, keine Details
```

## Geplante Aenderungen

### 1. Neue Komponente: IntentChipWithDetails

**Datei:** `src/components/settings/IntentChipWithDetails.tsx` (neu)

Diese Komponente ersetzt die einfachen Chips und zeigt:
- Checkbox/Toggle fuer Aktivierung
- Intent-Label
- Vorhandene Details (kompakt als Labels)
- "Bearbeiten" oder "Details hinzufügen" Button

```
┌─────────────────────────────────────────────────┐
│ [✓] Projektpartner finden                       │
│     Phase: Idee, Konzept | Rollen: Tech         │
│                              [Bearbeiten]       │
└─────────────────────────────────────────────────┘
```

### 2. Neue Komponente: EditIntentDetailsDialog

**Datei:** `src/components/settings/EditIntentDetailsDialog.tsx` (neu)

Dialog zum Bearbeiten der Details eines einzelnen Intents:
- Verwendet den bestehenden `IntentDetailFlow` (aus Onboarding)
- Vorbefuellt mit existierenden Werten
- Kein Intro-Screen beim Bearbeiten (direkt zum Flow)
- Buttons: "Speichern" / "Abbrechen"

### 3. Anpassung: IntentDetailFlow

**Datei:** `src/components/onboarding/IntentDetailFlow.tsx`

Erweiterung um optionale Props fuer Edit-Modus:
- `singleIntent?: string` - Nur einen Intent bearbeiten (statt alle)
- `onCancel?: () => void` - Abbrechen-Option

### 4. Anpassung: EditProfileForm

**Datei:** `src/components/settings/EditProfileForm.tsx`

- Ersetze `MultiSelectChips` fuer Intents durch neue `IntentChipWithDetails`
- Neue States:
  - `editingIntent: string | null` - Welcher Intent wird gerade bearbeitet
  - `showNewIntentDialog: boolean` - Zeige Dialog fuer neuen Intent
- Logik fuer Intent-Aenderungen:
  - Aktivieren: Zeige optional "Noch genauer?" Dialog
  - Deaktivieren: Entferne Intent und zugehoerige Details
  - Bearbeiten: Oeffne EditIntentDetailsDialog

### 5. Anpassung: IntentDetailDialog

**Datei:** `src/components/settings/IntentDetailDialog.tsx`

- Bleibt fuer neue Intents bestehen
- Wird weiterhin beim Hinzufuegen neuer Intents getriggert

## Technische Details

### Datenfluss

```
formData.intents: string[]           → Liste aktiver Intents
formData.intent_details: {           → Details pro Intent
  "projektpartner": {
    "phase": ["idee", "konzept"],
    "roles": ["tech"]
  },
  ...
}
```

### Intent entfernen

```typescript
const handleRemoveIntent = (intent: string) => {
  setFormData(prev => {
    const newIntents = prev.intents.filter(i => i !== intent);
    const newDetails = { ...prev.intent_details };
    delete newDetails[intent];
    return { ...prev, intents: newIntents, intent_details: newDetails };
  });
};
```

### Intent hinzufuegen

```typescript
const handleAddIntent = (intent: string) => {
  setFormData(prev => ({
    ...prev,
    intents: [...prev.intents, intent]
  }));
  
  // Wenn Intent Detail-Screens hat, optional Dialog zeigen
  if (INTENT_DETAIL_OPTIONS[intent]) {
    setNewIntentToConfig(intent);
    setShowNewIntentDialog(true);
  }
};
```

## Betroffene Dateien

| Datei | Aenderung |
|-------|-----------|
| `src/components/settings/IntentChipWithDetails.tsx` | **Neu** - Chip mit Details und Bearbeiten-Button |
| `src/components/settings/EditIntentDetailsDialog.tsx` | **Neu** - Dialog zum Bearbeiten einzelner Intent-Details |
| `src/components/settings/EditProfileForm.tsx` | Ersetze MultiSelectChips durch IntentChipWithDetails |
| `src/components/onboarding/IntentDetailFlow.tsx` | Optional: singleIntent und onCancel Props |
| `src/components/settings/IntentDetailDialog.tsx` | Keine Aenderung (bleibt fuer neue Intents) |

## Wiederverwendete Komponenten

Wie gewuenscht werden die bestehenden Onboarding-Komponenten wiederverwendet:
- `IntentDetailIntro` - Fuer "Noch genauer?" Dialog bei neuen Intents
- `IntentDetailFlow` - Fuer den Detail-Auswahl-Flow
- `IntentDetailScreen` - Einzelne Auswahlbildschirme

## UX-Regeln

- Keine Pflichtfelder
- Gleiche Microcopy wie im Onboarding:
  - "Bearbeiten"
  - "Kurz auswählen" / "Später"
  - "Überspringen"
  - "Du kannst das jederzeit ändern"
- Keine "unvollständig"-Hinweise

## Beispiel-Flow: Intent bearbeiten

1. User klickt "Bearbeiten" bei "Projektpartner finden"
2. Dialog oeffnet sich mit IntentDetailFlow (nur fuer diesen Intent)
3. Screens: Projektphase → Gesuchte Rollen
4. User waehlt/aendert Optionen
5. Klick auf "Fertig" speichert lokal
6. Dialog schliesst
7. Details werden aktualisiert angezeigt
8. Erst beim Speichern des gesamten Profils wird in DB persistiert

## Beispiel-Flow: Neuen Intent hinzufuegen

1. User aktiviert "Startup / Gründer-Mitstreiter"
2. Dialog erscheint: "NOCH GENAUER?"
3. User waehlt "Kurz auswählen"
4. IntentDetailFlow: Status → Eigener Beitrag
5. User waehlt Optionen oder ueberspringt
6. Dialog schliesst
7. Intent und Details werden angezeigt
