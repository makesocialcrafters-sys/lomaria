

## Onboarding vereinfachen — Pflichtfelder reduzieren

Das Onboarding wird entschlackt. Mehrere bisher verpflichtende Felder werden optional und können später in den Einstellungen ergänzt werden. Pflichtfelder werden klar mit einem goldenen Stern (*) markiert.

### Neue Pflicht-Logik

| Schritt | Feld | Bisher | Neu |
|---|---|---|---|
| 1 Identität | Vorname | Pflicht | **Pflicht *** |
| 1 Identität | Nachname | Pflicht | Optional |
| 1 Identität | Profilbild | Pflicht | Pflicht (unverändert) |
| 2 Demografie | Alter | Pflicht | **Pflicht *** |
| 2 Demografie | Geschlecht | Pflicht | Optional |
| 3 Studium | Universität | Pflicht | **Pflicht *** |
| 3 Studium | Studienrichtung | Pflicht | Optional |
| 3 Studium | Phase | Pflicht | Optional |
| 4 Intents | Min. Auswahl | 1 | **Min. 2 *** |
| 5 Interessen | Min. Auswahl | 3 | **Min. 2 *** |

### Änderungen pro Datei

**`src/components/onboarding/Step1Identity.tsx`**
- `isValid`: Nachname-Check entfernen → nur noch Vorname + Profilbild
- Vorname-Input bekommt Stern-Label "Vorname *"
- Nachname-Input bleibt ohne Stern

**`src/components/onboarding/Step2Demographics.tsx`**
- `isValid`: nur noch Alter prüfen, Geschlecht-Check entfernen
- Label "Alter *" mit Stern, "Geschlecht" ohne Stern
- Hinweistext bleibt

**`src/components/onboarding/Step3Study.tsx`**
- `isValid`: nur noch Universität prüfen
- Label "Universität *" mit Stern, andere Felder ohne
- Studienrichtung & Phase bleiben sichtbar, aber optional

**`src/components/onboarding/Step4Intents.tsx`**
- `minSelect={1}` → `minSelect={2}`
- Untertitel: "(min. 2)" statt "(min. 1)"
- Validierung entsprechend anpassen

**`src/components/onboarding/Step5Interests.tsx`**
- `minSelect={3}` → `minSelect={2}`
- Untertitel: "(min. 2, max. 6)"
- `isValid = interests.length >= 2`

### Einheitliches Stern-Styling

Jedes Pflichtfeld-Label bekommt:
```tsx
<span>Vorname <span className="text-primary">*</span></span>
```
Der Stern in Gold (`text-primary` = `#C6A94D`), passend zum bestehenden Pattern in Step5 ("min. 3" ist bereits gold).

### Datenbank & Profil-Speicherung

Keine DB-Migration nötig. `last_name`, `gender`, `study_program`, `study_phase` sind bereits nullable bzw. werden beim Speichern leer übergeben. Die Settings-Seite (`EditProfileForm`) erlaubt bereits das Nachtragen aller Felder — kein zusätzlicher Code dort.

### Was unverändert bleibt
- Schritt 6 (Tutoring) — bleibt konditional
- Schritt 7 (Bio) — bleibt optional
- Schritt 8 (Preview) — keine Anpassung
- Profilbild bleibt Pflicht in Schritt 1
- Submit-Logik in `Onboarding.tsx` — keine Änderung nötig

