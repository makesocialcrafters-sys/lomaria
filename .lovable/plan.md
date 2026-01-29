

# Plan: user_profiles VIEW aktualisieren

## Ziel
Die `user_profiles` VIEW aktualisieren um `intent_details` hinzuzufuegen, waehrend `gender` und `birthyear` weiterhin ausgeschlossen bleiben (Privacy).

## Datenarchitektur

| Feld | users Tabelle | user_profiles VIEW | Sichtbarkeit |
|------|---------------|-------------------|--------------|
| gender | Ja | Nein | Nur eigenes Profil |
| birthyear | Ja | Nein | Legacy, nicht angezeigt |
| age | Ja | Ja | Oeffentlich |
| intent_details | Ja | Ja (NEU) | Oeffentlich |

## Aenderungen

### 1. Datenbank-Migration

```sql
CREATE OR REPLACE VIEW public.user_profiles
WITH (security_invoker=on) AS
SELECT 
  id,
  first_name,
  last_name,
  profile_image,
  age,
  study_program,
  study_phase,
  semester,
  focus,
  interests,
  intents,
  intent_details,
  bio,
  tutoring_subject,
  tutoring_desc,
  tutoring_price,
  created_at,
  last_active_at
FROM users;
```

**Nicht enthalten (Privacy):**
- `gender` - Privat, nur im eigenen Profil sichtbar
- `birthyear` - Legacy-Feld
- `email` - Sensibel
- `auth_user_id` - Intern

**Neu hinzugefuegt:**
- `intent_details` - Detail-Auswahlen pro Intent

### 2. Label-Helper Funktion

**Datei:** `src/lib/onboarding-constants.ts`

```typescript
export function getIntentDetailLabel(
  intent: string, 
  field: string, 
  value: string
): string {
  const config = INTENT_DETAIL_OPTIONS[intent as keyof typeof INTENT_DETAIL_OPTIONS];
  if (!config) return value;
  const screen = config.screens.find(s => s.id === field);
  if (!screen) return value;
  return screen.options.find(o => o.value === value)?.label ?? value;
}
```

### 3. ProfileDetail.tsx erweitern

**Datei:** `src/pages/ProfileDetail.tsx`

Interface erweitern:
```typescript
interface UserProfile {
  // ... bestehende Felder ...
  intent_details?: Record<string, Record<string, string | string[]>> | null;
}
```

Neue UI-Sektion fuer Intent-Details:
```
┌────────────────────────────────────────┐
│ SUCHE NACH                             │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │ Projektpartner finden              │ │
│ │   Phase: Idee, Konzept             │ │
│ │   Rollen: Tech, Business           │ │
│ └────────────────────────────────────┘ │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │ Startup / Gruender-Mitstreiter     │ │
│ │   Status: Suche Mitgruender        │ │
│ │   Beitrag: Design, Strategie       │ │
│ └────────────────────────────────────┘ │
└────────────────────────────────────────┘
```

## Implementierungs-Reihenfolge

1. Datenbank-Migration: VIEW mit intent_details aktualisieren
2. Label-Helper: getIntentDetailLabel Funktion hinzufuegen
3. ProfileDetail.tsx: Interface + UI-Rendering erweitern

## Ergebnis

- Andere Studenten sehen Intent-Details (Phase, Rollen, etc.)
- Gender bleibt privat (nicht in VIEW)
- Birthyear bleibt ausgeschlossen (Legacy)

