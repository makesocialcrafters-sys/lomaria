

## Studienrichtung unter der Uni anzeigen

Aktuell wird nur die Hochschule (`study_program`) angezeigt, aber die Studienrichtung (`study_phase`) fehlt. Die Änderung betrifft drei Stellen:

### Änderungen

1. **ProfileDetail.tsx** (Zeile 303-305): Unter `studyProgramLabel` auch `profile.study_phase` anzeigen.

2. **Profile.tsx** (Zeile 188-190): Unter `studyProgramLabel` auch `userData.study_phase` anzeigen.

3. **UserProfileCard.tsx** (Zeile 60-64): Unter dem Studiengang-Label auch `user.study_phase` als zweite Zeile anzeigen.

Alle drei Stellen folgen dem gleichen Muster: eine zusätzliche Textzeile in `text-sm text-muted-foreground` direkt unter der Uni-Zeile, nur wenn `study_phase` vorhanden ist.

