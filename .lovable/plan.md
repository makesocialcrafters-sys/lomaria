
# Plan: Studienphase Label aktualisieren

## Änderung
Das Label "CBK / Hauptstudium" wird zu "CBK/Hauptstudium/Spezialisierung" geändert.

## Betroffene Dateien

### 1. `src/lib/onboarding-constants.ts`
**Zeile 9:** Label ändern von:
```
{ value: "cbk_hauptstudium", label: "CBK / Hauptstudium" }
```
zu:
```
{ value: "cbk_hauptstudium", label: "CBK/Hauptstudium/Spezialisierung" }
```

### 2. `src/lib/constants.ts`
**Zeile 11:** Gleiche Änderung für Konsistenz:
```
{ value: "cbk_hauptstudium", label: "CBK/Hauptstudium/Spezialisierung" }
```

## Auswirkungen
Das neue Label erscheint automatisch in:
- Onboarding Step 3 (Studium-Auswahl)
- Discover-Seite (Profilkarten)
- Profil-Detailansicht
- Eigenes Profil
- Kontakte-Seite
- Einstellungen (Profil bearbeiten)

## Technische Details
- Der `value` bleibt "cbk_hauptstudium" (keine Datenbankänderung nötig)
- Nur das angezeigte Label wird angepasst
- Keine Logikänderungen erforderlich
