

# Intent-Details im Profil-Edit-Modus

## Ziel

Wenn ein Student beim Bearbeiten seines Profils die Intents aendert, soll er anschliessend die Moeglichkeit haben, die entsprechenden Intent-Details auszuwaehlen oder zu ueberspringen - genau wie beim Onboarding.

## Ablauf

```text
Profil bearbeiten
       │
       ▼
 Intents aendern
       │
       ▼
 Speichern klicken
       │
       ▼
 Neue Intents mit Detail-Screens?
       │
   ┌───┴───┐
   │       │
  Nein    Ja
   │       │
   ▼       ▼
Direkt   "Noch genauer?" Dialog
speichern      │
          ┌────┴────┐
          │         │
   [Kurz auswaehlen] [Spaeter]
          │         │
          ▼         │
   Detail-Flow      │
     (Modal)        │
          │         │
          └────┬────┘
               ▼
        Profil speichern
```

## Technische Umsetzung

### 1. Types erweitern

**Datei:** `src/types/user.ts`

intent_details zu ProfileFormData hinzufuegen.

### 2. useOwnProfile erweitern

**Datei:** `src/hooks/useOwnProfile.ts`

intent_details aus der Datenbank laden.

### 3. IntentDetailDialog erstellen

**Neue Datei:** `src/components/settings/IntentDetailDialog.tsx`

Modaler Dialog der:
- IntentDetailIntro zeigt (Kurz auswaehlen / Spaeter)
- Bei "Kurz auswaehlen" den IntentDetailFlow durchlaeuft
- Nur fuer NEU hinzugefuegte Intents (die noch keine Details haben)

### 4. EditProfileForm anpassen

**Datei:** `src/components/settings/EditProfileForm.tsx`

- intent_details in formData aufnehmen
- Bei Speichern pruefen: Hat der User neue Intents mit verfuegbaren Detail-Screens?
- Falls ja: Dialog anzeigen statt direkt speichern
- Bestehende Intent-Details fuer unveraenderte Intents beibehalten

### 5. Profile.tsx anpassen

**Datei:** `src/pages/Profile.tsx`

- intent_details beim Speichern an Supabase mitschicken
- intent_details in getInitialFormData laden

## Betroffene Dateien

| Datei | Aenderung |
|-------|-----------|
| src/types/user.ts | intent_details hinzufuegen |
| src/hooks/useOwnProfile.ts | intent_details laden |
| src/components/settings/IntentDetailDialog.tsx | Neuer Dialog (wiederverwendet Onboarding-Komponenten) |
| src/components/settings/EditProfileForm.tsx | Dialog-Integration |
| src/pages/Profile.tsx | intent_details speichern |

## Ergebnis

- Student kann beim Bearbeiten die Intent-Details pflegen
- Bestehende Details bleiben erhalten
- Nur fuer neue Intents wird der Detail-Flow angeboten
- Konsistentes Erlebnis wie beim Onboarding

