
# Build-Fehler beheben und RLS-Policy vereinfachen

## Übersicht

Es gibt zwei Aufgaben:
1. **Build-Fehler beheben**: Die `UserProfileCard.tsx` referenziert noch `cooldownInfo`, das nicht mehr existiert
2. **Datenbank-Migration**: Die DELETE-Policies auf `connections` vereinfachen gemäß deiner Spezifikation

---

## Teil 1: Build-Fehler in UserProfileCard.tsx

### Problem
Die Komponente zeigt Zeilen 89-92, die auf `user.cooldownInfo` zugreifen - aber diese Eigenschaft wurde aus dem `UserProfile` Interface entfernt.

### Lösung
Die Zeilen 89-93 komplett entfernen:

```typescript
// Diese Zeilen entfernen:
{user.cooldownInfo?.isActive && (
  <p className="mt-4 text-xs text-muted-foreground/60 italic">
    Erneut anfragbar in {user.cooldownInfo.remainingText}
  </p>
)}
```

---

## Teil 2: Datenbank-Migration

### Aktuelle Situation
Es existieren mehrere DELETE-Policies mit unterschiedlichen Regeln:
- "Users can delete own accepted or rejected connections"
- "Sender can delete expired rejected connections" (mit 72h Cooldown)

### Zielzustand
Eine einzige, klare Policy:

| Szenario | Ergebnis |
|----------|----------|
| Sender löscht `rejected` | ✅ erlaubt |
| Empfänger löscht `rejected` | ✅ erlaubt |
| Sender löscht `pending` | ✅ erlaubt |
| Empfänger löscht `pending` | ✅ erlaubt |
| `accepted` löschen | ❌ verboten |

### SQL-Migration

```sql
-- 1. Alte Policies entfernen
DROP POLICY IF EXISTS "Users can delete own accepted or rejected connections" ON public.connections;
DROP POLICY IF EXISTS "Sender can delete rejected connections" ON public.connections;
DROP POLICY IF EXISTS "Sender can delete expired rejected connections" ON public.connections;

-- 2. Neue einheitliche Policy erstellen
CREATE POLICY "Both users can delete non-accepted connections"
ON public.connections
FOR DELETE
TO authenticated
USING (
  status IN ('pending', 'rejected')
  AND auth.uid() IN (
    SELECT auth_user_id FROM users WHERE id = from_user
    UNION
    SELECT auth_user_id FROM users WHERE id = to_user
  )
);
```

---

## Zusammenfassung der Änderungen

| Datei/Ressource | Aktion |
|-----------------|--------|
| `src/components/discover/UserProfileCard.tsx` | Zeilen 89-93 (cooldownInfo UI) entfernen |
| RLS Policy auf `connections` | Alte DELETE-Policies löschen, neue einheitliche Policy erstellen |

---

## Ergebnis

Nach diesen Änderungen:
- ✅ Keine Build-Fehler mehr
- ✅ Beide Parteien können `pending` oder `rejected` Connections löschen
- ✅ `accepted` Connections bleiben geschützt (nur über Unmatch-Flow)
- ✅ Kein Cooldown mehr
- ✅ Klare, wartbare Logik
