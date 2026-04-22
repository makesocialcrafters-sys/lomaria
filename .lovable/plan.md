# One-Page Onboarding

Das gesamte Onboarding wird von 7 Schritten auf **eine einzige Seite** reduziert. Alle Felder auf einen Blick, ohne Wizard, ohne "Weiter"-Buttons. Der User scrollt durch das Formular und drückt am Ende einmal "Profil erstellen".

## Was der User sieht

Eine vertikal gescrollte Seite mit klar getrennten Sektionen:

```text
┌─────────────────────────────────┐
│        LOMARIA Logo             │
│   Erstelle dein Profil          │
├─────────────────────────────────┤
│ ① DU                            │
│   [Profilbild upload]           │
│   Vorname*  Nachname*           │
│   Alter*    Geschlecht*         │
├─────────────────────────────────┤
│ ② STUDIUM                       │
│   Studiengang*                  │
│   Phase*  (Fokus, falls Haupt.) │
├─────────────────────────────────┤
│ ③ WAS SUCHST DU? (min. 2)       │
│   [Intent-Chips]                │
│   ↳ Falls Nachhilfe: Fach/Preis │
├─────────────────────────────────┤
│ ④ INTERESSEN (min. 2, max. 6)   │
│   [Interest-Chips]              │
├─────────────────────────────────┤
│ ⑤ ÜBER DICH (optional)          │
│   [Bio-Textarea]                │
├─────────────────────────────────┤
│      [ Profil erstellen ]       │
└─────────────────────────────────┘
```

## Wesentliche Vereinfachungen

- **Keine Vorschau-Seite mehr** — der User sieht beim Ausfüllen, was er eingibt.
- **Keine Schritt-Indikatoren** — stattdessen nummerierte Sektionen mit dezenten Trennlinien.
- **Min-Auswahl auf 1 reduziert** (Intents & Interessen, statt aktuell 3) → senkt Abbruchquote.
- **Tutoring-Felder** erscheinen inline ausgeklappt, sobald "Nachhilfe anbieten" gewählt wird (wie heute schon in Step4Intents implementiert).
- **Fokus-Feld** erscheint nur, wenn Phase = "cbk_hauptstudium" (wie heute).
- **Validierung pro Sektion** sichtbar (rote Hinweise unter Pflichtfeldern), Submit-Button bleibt disabled bis alle Pflichtfelder erfüllt.
- **Auto-Scroll zum ersten Fehler** beim Klick auf "Profil erstellen".

## Pflichtfelder (unverändert)

Vorname, Nachname, Profilbild, Alter, Geschlecht, Studiengang, Studienphase, min. 1 Intent, min. 1 Interesse.
Optional: Bio, Tutoring-Details, Fokus.

## Technische Umsetzung

- **Neue Datei**: `src/pages/Onboarding.tsx` wird komplett neu geschrieben als Single-Page-Form. Alte Step-Komponenten (`Step1Identity`, `Step2Demographics`, … `Step8Preview`) werden gelöscht.
- **Wiederverwendet**: `ProfileImageUpload`, `ChipSelect`, `IntentChipWithDetails`, `useOnboarding`-Hook (vereinfacht: `step`/`nextStep`/`prevStep` entfernt, nur `data`/`updateData`/`clearData` bleibt), `INTERESTS` & `INTENTS` aus `onboarding-constants.ts`.
- **Speicher-Logik**: identisch zur jetzigen `handleSave` in `Onboarding.tsx` (Insert/Update in `users`, `refreshOnboardingStatus`, Navigation zu `/discover`). LocalStorage-Draft bleibt erhalten, damit Eingaben bei Reload nicht verloren gehen.
- **Validierung**: lokale `useMemo`-Funktion liefert `errors`-Objekt + `isValid`-Boolean.
- **Layout**: `max-w-xl mx-auto` Container, jede Sektion mit `<section>` + Titel im Wes-Anderson-Stil (Josefin Sans CAPS, Gold-Akzent), getrennt durch dünne Gold-Linien (`border-t border-primary/20`).
- **Memory-Update**: `mem://features/onboarding-flow` von "8-step sequential wizard" auf "Single-page form" aktualisieren.

## Nicht Teil dieser Änderung

- Datenmodell der `users`-Tabelle bleibt unverändert.
- Auth-Flow, Email-Templates, Discover-Seite bleiben unangetastet.
- `intent_details` (private Freitext-Felder) bleiben wie sie sind, nur die UI wandert in die Single-Page.