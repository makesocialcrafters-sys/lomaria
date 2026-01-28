
# Chat-Löschung bei Unmatch ermöglichen

## Problem

Die aktuelle RLS-Policy auf der `connections` Tabelle verhindert das Löschen von **accepted** Connections:

```sql
Policy Name: Both users can delete non-accepted connections 
Using Expression: ((status = ANY (ARRAY['pending'::text, 'rejected'::text])) AND ...)
```

**Ergebnis:**
- Der DELETE-Request gibt 204 zurück (Supabase Verhalten bei RLS-Block)
- Aber die Connection wird **nicht** gelöscht
- Chat und Nachrichten bleiben erhalten
- User denkt, Verbindung wurde beendet, aber sie existiert noch

## Lösung

Die RLS-Policy erweitern, sodass auch `accepted` Connections gelöscht werden können (für Unmatch-Funktion).

### Datenbank-Migration

```sql
-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Both users can delete non-accepted connections" ON public.connections;

-- Create new policy that allows deleting ANY connection (pending, rejected, OR accepted)
CREATE POLICY "Both users can delete their connections"
ON public.connections
FOR DELETE
USING (
  auth.uid() IN (
    SELECT users.auth_user_id FROM users WHERE users.id = connections.from_user
    UNION
    SELECT users.auth_user_id FROM users WHERE users.id = connections.to_user
  )
);
```

## Ergebnis nach der Änderung

| Aktion | Verhalten |
|--------|-----------|
| Unmatch (accepted) | Connection wird gelöscht ✅ |
| Nachrichten | Automatisch gelöscht (ON DELETE CASCADE) ✅ |
| Pending löschen | Weiterhin möglich ✅ |
| Rejected löschen | Weiterhin möglich ✅ |

## Technische Details

- Die `messages` Tabelle hat bereits `ON DELETE CASCADE` auf `connection_id`
- Wenn die Connection gelöscht wird, werden alle zugehörigen Nachrichten automatisch mit gelöscht
- Keine Code-Änderungen nötig - nur die RLS-Policy muss erweitert werden

## Sicherheit

- Nur `from_user` oder `to_user` können ihre eigene Connection löschen
- Andere User können fremde Connections nicht löschen
- Die Gleichberechtigung bleibt erhalten (beide Seiten können Unmatch initiieren)
