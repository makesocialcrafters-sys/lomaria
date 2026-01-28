
# Plan: Optionaler Intent-Detail-Flow

## Zusammenfassung
Ein optionaler Zwischenflow nach der Intent-Auswahl (Step 4), der Usern ermoeglicht, ihre Intents genauer zu spezifizieren - ohne Texteingaben, nur mit Chips/Toggles, und jederzeit ueberspringbar.

## Architektur-Entscheidungen

### Datenstruktur
Neue JSONB-Spalte `intent_details` in der `users` Tabelle:

```json
{
  "projektpartner": {
    "phase": ["idee", "konzept"],
    "roles": ["tech", "business"]
  },
  "startup": {
    "status": "habe_konkrete_idee",
    "contribution": ["tech", "strategie"]
  },
  "networking": {
    "focus": ["austausch", "mentoring"],
    "area": ["consulting", "tech"]
  },
  "neue_leute": {
    "type": ["lernen", "gespraeche"],
    "energy": "gemischt"
  },
  "freundschaften": {
    "type": "langfristig",
    "style": "tiefgehend"
  }
}
```

### Flow-Logik
- Erscheint als **Sub-Flow innerhalb Step 4** (nicht als neue Haupt-Steps)
- Nach Intent-Auswahl: Zwischenscreen mit "Kurz auswaehlen" / "Spaeter"
- Fuer jeden ausgewaehlten Intent: 0-2 Detail-Screens
- Jeder Screen hat "Weiter" + "Ueberspringen"
- Kein Fortschrittsbalken fuer Detail-Screens (kein Druck)

## Betroffene Dateien

### 1. Datenbank-Migration (neu)
**Datei**: `supabase/migrations/[timestamp]_add_intent_details.sql`

```sql
ALTER TABLE users 
ADD COLUMN intent_details jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN users.intent_details IS 
  'Optional detailed preferences per intent (JSONB)';
```

### 2. TypeScript Types aktualisieren
**Datei**: `src/integrations/supabase/types.ts`
- Neue Spalte `intent_details: Json | null` zu `users` Table hinzufuegen

**Datei**: `src/types/user.ts`
- `UserProfile` erweitern um `intent_details`

### 3. Onboarding-Konstanten erweitern
**Datei**: `src/lib/onboarding-constants.ts`

Neue Konstanten fuer Intent-Detail-Optionen:

```typescript
// Intent Detail Flow Options
export const INTENT_DETAIL_OPTIONS = {
  projektpartner: {
    screens: [
      {
        id: "phase",
        title: "Projektphase",
        multiSelect: true,
        options: [
          { value: "idee", label: "Idee" },
          { value: "konzept", label: "Konzept" },
          { value: "umsetzung", label: "Umsetzung" },
          { value: "offen", label: "Offen" },
        ],
      },
      {
        id: "roles",
        title: "Gesuchte Rollen",
        multiSelect: true,
        options: [
          { value: "tech", label: "Tech" },
          { value: "design", label: "Design" },
          { value: "business", label: "Business" },
          { value: "organisation", label: "Organisation" },
          { value: "offen", label: "Offen" },
        ],
      },
    ],
  },
  startup: {
    screens: [
      {
        id: "status",
        title: "Status",
        multiSelect: false,
        options: [
          { value: "konkrete_idee", label: "Habe konkrete Idee" },
          { value: "grobe_idee", label: "Habe grobe Idee" },
          { value: "suche_mitgruender", label: "Suche Mitgruender" },
          { value: "anschliessen", label: "Moechte mich anschliessen" },
        ],
      },
      {
        id: "contribution",
        title: "Eigener Beitrag",
        multiSelect: true,
        options: [
          { value: "tech", label: "Tech" },
          { value: "business", label: "Business" },
          { value: "design", label: "Design" },
          { value: "strategie", label: "Strategie" },
          { value: "zeit_motivation", label: "Zeit / Motivation" },
        ],
      },
    ],
  },
  networking: {
    screens: [
      {
        id: "focus",
        title: "Fokus",
        multiSelect: true,
        options: [
          { value: "austausch", label: "Austausch" },
          { value: "mentoring", label: "Mentoring" },
          { value: "karrieregespraeche", label: "Karrieregespraeche" },
          { value: "orientierung", label: "Orientierung" },
        ],
      },
      {
        id: "area",
        title: "Bereich",
        multiSelect: true,
        options: [
          { value: "consulting", label: "Consulting" },
          { value: "finance", label: "Finance" },
          { value: "tech", label: "Tech" },
          { value: "marketing", label: "Marketing" },
          { value: "recht", label: "Recht" },
          { value: "offen", label: "Offen" },
        ],
      },
    ],
  },
  neue_leute: {
    screens: [
      {
        id: "type",
        title: "Art",
        multiSelect: true,
        options: [
          { value: "lernen", label: "Lernen" },
          { value: "gespraeche", label: "Gespraeche" },
          { value: "freizeit", label: "Freizeit" },
          { value: "austausch", label: "Austausch" },
        ],
      },
      {
        id: "energy",
        title: "Energielevel",
        multiSelect: false,
        options: [
          { value: "ruhig", label: "Ruhig" },
          { value: "gemischt", label: "Gemischt" },
          { value: "aktiv", label: "Aktiv" },
        ],
      },
    ],
  },
  freundschaften: {
    screens: [
      {
        id: "type",
        title: "Art",
        multiSelect: false,
        options: [
          { value: "langfristig", label: "Langfristig" },
          { value: "unverbindlich", label: "Unverbindlich" },
          { value: "situativ", label: "Situativ" },
        ],
      },
      {
        id: "style",
        title: "Umgang",
        multiSelect: false,
        options: [
          { value: "tiefgehend", label: "Tiefgehend" },
          { value: "locker", label: "Locker" },
          { value: "beides", label: "Beides" },
        ],
      },
    ],
  },
} as const;

// OnboardingData erweitern
export type OnboardingData = {
  // ... bestehende Felder ...
  intent_details: Record<string, Record<string, string | string[]>>;
};

export const initialOnboardingData: OnboardingData = {
  // ... bestehende Felder ...
  intent_details: {},
};
```

### 4. Neue Komponenten erstellen

**Datei**: `src/components/onboarding/IntentDetailIntro.tsx`
Zwischenscreen mit "Kurz auswaehlen" / "Spaeter" Buttons

```text
┌─────────────────────────────────┐
│                                 │
│   Willst du kurz auswaehlen,    │
│   was du genau suchst?          │
│                                 │
│   Das hilft anderen, dich       │
│   schneller zu finden.          │
│                                 │
│   ┌─────────────────────────┐   │
│   │    Kurz auswaehlen      │   │
│   └─────────────────────────┘   │
│                                 │
│         [ Spaeter ]             │
│                                 │
│   Du kannst das jederzeit       │
│         aendern.                │
│                                 │
└─────────────────────────────────┘
```

**Datei**: `src/components/onboarding/IntentDetailScreen.tsx`
Generische Komponente fuer einen Detail-Auswahl-Screen

```text
┌─────────────────────────────────┐
│        PROJEKTPARTNER           │
│         Projektphase            │
│                                 │
│   ┌──────┐ ┌─────────┐ ┌──────┐ │
│   │ Idee │ │ Konzept │ │ Um-  │ │
│   └──────┘ └─────────┘ │setzung│ │
│                        └──────┘ │
│          ┌──────┐               │
│          │ Offen│               │
│          └──────┘               │
│                                 │
│   ┌──────────┐  ┌──────────┐    │
│   │Ueberspringen│  │ Weiter │    │
│   └──────────┘  └──────────┘    │
└─────────────────────────────────┘
```

**Datei**: `src/components/onboarding/IntentDetailFlow.tsx`
Flow-Controller der durch alle Detail-Screens navigiert

### 5. Step4Intents erweitern
**Datei**: `src/components/onboarding/Step4Intents.tsx`

- Nach Intent-Auswahl: Sub-Flow-State hinzufuegen
- Zeigt entweder:
  1. Intent-Auswahl (aktuell)
  2. IntentDetailIntro (Zwischenscreen)
  3. IntentDetailFlow (Detail-Screens)

### 6. useOnboarding Hook erweitern
**Datei**: `src/hooks/useOnboarding.ts`

- `intent_details` zu State hinzufuegen
- Funktion `updateIntentDetails(intent, field, value)` hinzufuegen

### 7. Onboarding.tsx Speicher-Logik anpassen
**Datei**: `src/pages/Onboarding.tsx`

- `intent_details` beim Speichern mitsenden

### 8. EditProfileForm erweitern (optional, Phase 2)
**Datei**: `src/components/settings/EditProfileForm.tsx`

- Section fuer Intent-Details Bearbeitung hinzufuegen

## Flow-Diagramm

```text
Step 4: Intent-Auswahl
         │
         ▼
┌─────────────────────┐
│  "Kurz auswaehlen"  │──────────────────────────┐
│      oder           │                          │
│    "Spaeter"        │                          │
└─────────────────────┘                          │
         │ Kurz auswaehlen                       │ Spaeter
         ▼                                       │
┌─────────────────────┐                          │
│ Intent 1 Screen 1   │──┐ Ueberspringen         │
│ (z.B. Projektphase) │  │                       │
└─────────────────────┘  │                       │
         │ Weiter        │                       │
         ▼               ▼                       │
┌─────────────────────┐                          │
│ Intent 1 Screen 2   │──┐ Ueberspringen         │
│ (z.B. Rollen)       │  │                       │
└─────────────────────┘  │                       │
         │ Weiter        │                       │
         ▼               ▼                       │
┌─────────────────────┐                          │
│ Intent 2 Screen 1   │  ...                     │
│ (naechster Intent)  │                          │
└─────────────────────┘                          │
         │               ...                     │
         ▼                                       │
┌─────────────────────┐                          │
│   Letzter Screen    │                          │
└─────────────────────┘                          │
         │                                       │
         └───────────────────────────────────────┘
                         │
                         ▼
               Step 5: Interessen
```

## UX-Richtlinien

1. **Keine Pflicht-Labels**: Kein "Pflichtfeld", "Empfohlen" etc.
2. **Kein Fortschrittsdruck**: StepIndicator bleibt auf Step 4 waehrend Detail-Flow
3. **Microcopy**:
   - "Kurz auswaehlen" (Primary Button)
   - "Spaeter" (Ghost Button)
   - "Ueberspringen" (Ghost Button)
   - "Weiter" (Primary Button)
   - "Du kannst das jederzeit aendern" (Footer-Text)
4. **Keine Hinweise auf "unvollstaendig"**
5. **Wes Anderson Design**: Gleiche Animationen, Goldtone, typografische Regeln

## Implementierungs-Reihenfolge

1. **Datenbank-Migration**: `intent_details` JSONB Spalte hinzufuegen
2. **Types aktualisieren**: TypeScript-Typen erweitern
3. **Konstanten definieren**: Alle Intent-Detail-Optionen in `onboarding-constants.ts`
4. **UI-Komponenten erstellen**:
   - `IntentDetailIntro.tsx` (Einstiegsscreen)
   - `IntentDetailScreen.tsx` (Generischer Auswahl-Screen)
   - `IntentDetailFlow.tsx` (Flow-Controller)
5. **Step4Intents anpassen**: Sub-Flow integrieren
6. **useOnboarding erweitern**: State-Management fuer intent_details
7. **Speicher-Logik anpassen**: intent_details beim Submit mitsenden

## Technische Details

### Intents MIT Detail-Screens (5 von 6)
- `projektpartner` (2 Screens)
- `startup` (2 Screens)
- `networking` (2 Screens)
- `neue_leute` (2 Screens)
- `freundschaften` (2 Screens)

### Intent OHNE Detail-Screens (1 von 6)
- `nachhilfe_anbieten` - hat bereits dedizierte Step 6 mit Fach/Preis/Beschreibung

### Keine Matching-Logik
Die `intent_details` werden vorerst nur gespeichert und angezeigt, aber NICHT fuer Matching/Sortierung verwendet (wie angefordert).

## Nicht enthalten (Phase 2)
- Integration in Discover-Filter
- Matching-Algorithmus-Anpassung
- Profil-Detail-Anzeige der intent_details
- EditProfileForm-Integration (Bearbeitung nach Onboarding)
