

## Rückgängig machen über die History

Du willst alles ab deiner Nachricht *„profil wird nicht gespeichert, es steht permission denied for table users“* verwerfen — sowohl die Code-/Migrations-Änderungen als auch die Chat-Verläufe danach.

### Das geht nicht über eine neue Migration
Wenn ich jetzt eine „Anti-Migration“ schreibe, stapelt sich der Zustand nur weiter. Sauber rückgängig machen lässt sich das ausschließlich über die **History**:

1. Öffne die History (Button unten oder oben im Chat).
2. Wähle die Version **direkt vor** deiner Nachricht „profil wird nicht gespeichert…“.
3. Klick auf Revert.

Damit wird in einem Rutsch zurückgesetzt:
- die zwei Security-Migrationen (RPC `get_own_profile`, View-Recreation, GRANT-Hin-und-Her),
- die Code-Änderung in `src/hooks/useOwnProfile.ts`,
- die Edits in `security/security-memory.md`,
- die zugehörigen Chat-Nachrichten ab diesem Punkt werden archiviert.

### Danach
Sobald revertiert ist, ist der Zustand exakt wie vor deinem Vertipper. Es bleibt nichts zu tun — keine Test-Chats löschen, keine weitere Migration, kein Code-Patch.

