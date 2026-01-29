
# Problem: Intent-Details sind fuer andere Studenten nicht sichtbar

## Ursache
Die `user_profiles` VIEW wurde **vor** der neuen `intent_details` Spalte erstellt und enthaelt diese nicht. Wenn ein anderer Student das Profil ansieht, wird die VIEW abgefragt, die keine `intent_details` hat.

**Aktuelle VIEW-Definition:**
```sql
SELECT id, first_name, last_name, profile_image, birthyear, age, 
       gender, study_program, study_phase, semester, focus, 
       interests, intents, bio, tutoring_subject, tutoring_desc, 
       tutoring_price, created_at, last_active_at
FROM users;
-- intent_details FEHLT!
```

## Loesung

### 1. Datenbank-Migration: VIEW aktualisieren

```sql
CREATE OR REPLACE VIEW public.user_profiles
WITH (security_invoker=on) AS
SELECT 
  id,
  first_name,
  last_name,
  profile_image,
  birthyear,
  age,
  gender,
  study_program,
  study_phase,
  semester,
  focus,
  interests,
  intents,
  intent_details,  -- NEU HINZUGEFUEGT
  bio,
  tutoring_subject,
  tutoring_desc,
  tutoring_price,
  created_at,
  last_active_at
FROM users;
```

### 2. ProfileDetail.tsx: Intent-Details anzeigen

Das `UserProfile` Interface erweitern und die Intent-Details im UI rendern:

```typescript
interface UserProfile {
  // ... bestehende Felder ...
  intent_details?: Record<string, Record<string, string | string[]>> | null;
}
```

Neue UI-Sektion fuer jeden Intent mit Details:

```text
┌────────────────────────────────────────┐
│ SUCHE NACH                             │
│ ┌─────────────────────────────────────┐│
│ │ Projektpartner finden               ││
│ │   Phase: Idee, Konzept              ││
│ │   Rollen: Tech, Business            ││
│ └─────────────────────────────────────┘│
│ ┌─────────────────────────────────────┐│
│ │ Startup / Gruender-Mitstreiter      ││
│ │   Status: Suche Mitgruender         ││
│ │   Beitrag: Design, Strategie        ││
│ └─────────────────────────────────────┘│
└────────────────────────────────────────┘
```

### 3. Betroffene Dateien

| Datei | Aenderung |
|-------|-----------|
| Neue Migration | `user_profiles` VIEW aktualisieren |
| `src/pages/ProfileDetail.tsx` | Intent-Details im Interface + UI-Rendering |
| `src/lib/onboarding-constants.ts` | Label-Mapping fuer Detail-Optionen exportieren |

### 4. Label-Mapping hinzufuegen

Eine Hilfsfunktion um die gespeicherten Werte in lesbare Labels umzuwandeln:

```typescript
export function getIntentDetailLabel(intent: string, field: string, value: string): string {
  const config = INTENT_DETAIL_OPTIONS[intent]?.screens.find(s => s.id === field);
  if (!config) return value;
  return config.options.find(o => o.value === value)?.label ?? value;
}
```

## Implementierungs-Reihenfolge

1. **Datenbank-Migration**: `user_profiles` VIEW mit `intent_details` aktualisieren
2. **Label-Helper**: Funktion zum Umwandeln von Werten in Labels
3. **ProfileDetail.tsx**: Interface erweitern + UI-Sektion hinzufuegen

## Ergebnis

Nach der Implementierung sehen andere Studenten:
- Die ausgewaehlten Intents (wie bisher)
- **NEU**: Die Detail-Auswahlen pro Intent (Phase, Rollen, Status, etc.)
