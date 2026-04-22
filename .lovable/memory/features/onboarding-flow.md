---
name: Onboarding Flow
description: Single-page onboarding form with 5 sections, min 1 intent/interest, saves to users table, redirects to /discover
type: feature
---
Onboarding ist eine **einzige scrollbare Seite** (`src/pages/Onboarding.tsx`), kein Wizard. Sektionen:

1. **DU** — Profilbild (Pflicht, 1:1-Crop in `avatars`-Bucket), Vorname, Nachname, Alter (16–100), Geschlecht
2. **STUDIUM** — Hochschule (Select), Studienrichtung (Freitext im `study_phase`-Feld)
3. **WAS SUCHST DU?** — Intents (min. 1, max. 6). Bei `nachhilfe_anbieten` inline Felder für Fach (Pflicht), Beschreibung, Stundensatz. Intents mit Detail-Konfiguration zeigen inline Chip-Auswahl (gespeichert in `intent_details`).
4. **INTERESSEN** — min. 1, max. 6
5. **ÜBER DICH** — Bio (optional, max 500 Zeichen)

**Validierung**: `useMemo`-`errors`-Objekt; rote Hinweise erscheinen erst nach Klick auf "Profil erstellen" (`showErrors`-State). Bei Fehler: Auto-Scroll zur ersten fehlerhaften Sektion.

**Speicherung**: identisch wie zuvor — Insert/Update in `public.users` per `auth_user_id`, `clearData()`, `refreshOnboardingStatus()`, dann `navigate("/discover", { replace: true })`. LocalStorage-Draft unter `lomaria_onboarding_draft` bleibt für Reload-Schutz erhalten.

**Wiederverwendete Komponenten**: `ProfileImageUpload` (extrahiert aus altem Step1), `ChipSelect`, `IntentChipWithDetails` (aus `components/settings/`).

Alte Step-Komponenten (`Step1Identity` … `Step8Preview`, `StepIndicator`) wurden gelöscht. `useOnboarding`-Hook behält `step`/`nextStep`/`prevStep` aus Kompatibilitätsgründen, sie werden aber nicht mehr verwendet.
