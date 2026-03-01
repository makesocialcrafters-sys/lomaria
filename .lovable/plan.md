

# Plan: Onboarding Step3 – "Hochschule" + "Studienrichtung"

## Was sich ändert

### 1. `STUDY_PROGRAMS` → Universitäten-Liste

In **beiden** Constants-Dateien (`src/lib/constants.ts` und `src/lib/onboarding-constants.ts`) wird `STUDY_PROGRAMS` durch die vollständige Universitäten-Liste ersetzt:

```
Universität Wien
Medizinische Universität Wien
TU Wien
WU Wien
BOKU Wien
Vetmeduni Wien
Universität für angewandte Kunst Wien
Universität für Musik und darstellende Kunst Wien
Music and Arts University of the City of Vienna
Sigmund Freud University Wien
Webster University Vienna
MODUL University Vienna
CEU Wien
Jam Music Lab
Sonstige
```

### 2. Labels in Step3Study.tsx

- Erstes Dropdown: **"Hochschule"** (statt "Hochschule & Studienrichtung")
- Placeholder: **"Auswählen"**
- Zweites Dropdown: **"Studienrichtung"** (statt "Studienphase")
- Zweites Feld wird zu einem **freien Textfeld** (Input statt Select), da jede Uni andere Studienrichtungen hat
- Placeholder: **"z.B. Informatik, BWL, Jus..."**

### 3. Labels in EditProfileForm.tsx

- `study_program`-Label: **"Hochschule"** (statt "Studiengang")
- `study_phase`-Label: **"Studienrichtung"** (statt "Studienphase")
- `study_phase`-Feld wird ebenfalls zu freiem Textfeld

### 4. Schwerpunkt-Logik

Da `study_phase` kein Select mehr ist, entfällt die Bedingung `studyPhase === "cbk_hauptstudium"` für den Schwerpunkt. Das Schwerpunkt-Feld wird entfernt (es ist ohnehin optional und im Profil nicht mehr sichtbar).

### 5. Profil-Anzeige

`studyProgramLabel` in Profile.tsx, ProfileDetail.tsx und UserProfileCard.tsx zeigt jetzt den **Universitätsnamen** an – das ist korrekt, da die Studienrichtung im Profil-Header nicht mehr angezeigt wird (bereits entfernt).

---

**Wichtiger Hinweis**: Bestehende User haben aktuell Werte wie "WiSo", "WiRe", "BBE" in `study_program` gespeichert. Diese werden nach der Änderung nicht mehr in der Dropdown-Liste gefunden und im Profil als leer angezeigt, bis der User sein Profil aktualisiert. Es findet **keine DB-Migration** statt – nur die UI-Optionen ändern sich.

