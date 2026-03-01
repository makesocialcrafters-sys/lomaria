
1) Ursache fixieren
- Der Save-Fehler kommt vom DB-Constraint `users_study_program_check` (aktuell nur `WiSo | WiRe | BBE` erlaubt), während UI jetzt Werte wie `uni_wien`, `tu_wien`, `wu_wien` sendet.

2) Bestehende Daten migrieren (Daten-Update)
- Legacy-Werte vor Constraint-Update normalisieren:
  - `WiSo`, `WiRe`, `BBE` → `wu_wien` (oder alternativ `sonstige`, falls gewünscht).

3) Schema korrigieren (Constraint neu setzen)
- Alten Constraint `users_study_program_check` droppen.
- Neuen Constraint für die aktuelle Hochschul-Liste anlegen:
  - `uni_wien, meduni_wien, tu_wien, wu_wien, boku_wien, vetmeduni_wien, angewandte_wien, mdw_wien, muk_wien, sfu_wien, webster_wien, modul_wien, ceu_wien, jam_wien, sonstige`
  - plus `NULL` erlauben.

4) Fehlertransparenz im Frontend verbessern
- In `src/pages/Onboarding.tsx` im Catch die konkrete Supabase-Fehlermeldung im Toast anzeigen (nicht nur generisch), damit DB-Fehler sofort sichtbar sind.
- Optional gleiches Muster auch in weiteren Save-Flows vereinheitlichen.

5) Verifikation (End-to-End)
- Onboarding komplett durchlaufen und auf Schritt 8 speichern.
- Danach `/profile` öffnen, `Hochschule` + `Studienrichtung` ändern und erneut speichern.
- Prüfen: kein Fehlertoast, Daten bleiben nach Reload erhalten.
