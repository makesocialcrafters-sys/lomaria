

# Plan: DB-Constraint `users_study_phase_check` entfernen

## Problem
Die Datenbank hat einen CHECK-Constraint auf `study_phase`, der nur die Werte `'steop'` und `'cbk_hauptstudium'` erlaubt. Da `study_phase` jetzt als freies Textfeld für "Studienrichtung" genutzt wird (z.B. "Informatik"), schlägt jedes Speichern fehl.

## Lösung
Eine einzige SQL-Migration:

```sql
ALTER TABLE public.users DROP CONSTRAINT users_study_phase_check;
```

Keine Code-Änderung nötig. Nur dieser eine DB-Constraint muss entfernt werden.

