

# Plan: Study-Phase aus Profil-Header entfernen + Onboarding-Label anpassen

## 3 kleine Änderungen, keine DB/Logik-Änderungen

### 1. `src/pages/Profile.tsx`
- **Zeile 9**: `STUDY_PHASES` aus Import entfernen
- **Zeile 20**: `StudyPhase` aus Type-Import entfernen
- **Zeile 146**: `studyPhaseLabel`-Variable entfernen
- **Zeilen 188–195**: Study-Info-Block ersetzen durch:
  ```tsx
  {studyProgramLabel && (
    <p className="text-sm text-foreground/70 text-center mb-6">{studyProgramLabel}</p>
  )}
  ```
  Keine zweite Zeile, kein Focus, kein Phase.

### 2. `src/pages/ProfileDetail.tsx`
- **Zeile 14**: `STUDY_PHASES` aus Import entfernen
- **Zeile 132**: `studyPhaseLabel`-Variable entfernen
- **Zeilen 304–307**: Study-Block ersetzen durch:
  ```tsx
  {studyProgramLabel && (
    <p className="text-sm text-foreground/70 text-center mb-6">{studyProgramLabel}</p>
  )}
  ```

### 3. `src/components/onboarding/Step3Study.tsx`
- **Zeile 46**: Label "Studienrichtung" → "Hochschule & Studienrichtung"
- **Zeile 49**: Placeholder "Auswählen" → "z.B. TU Wien – Informatik"

