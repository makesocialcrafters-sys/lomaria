
# Vollständige Realtime-Updates für alle Listen

## Problem

Die App hat nur partielle Realtime-Updates. Der zentrale `useNotificationCounts` Hook lauscht nur auf:
- INSERT bei messages (für neue Nachrichten)
- INSERT/UPDATE bei connections mit `to_user=currentUser` (nur eingehende Anfragen)

**Fehlende Events:**
| Event | Betroffene Listen |
|-------|-------------------|
| Connection akzeptiert | Sent Requests, Accepted Connections, Chats, Discover |
| Connection abgelehnt | Sent Requests, Discover |
| Connection gelöscht (Unmatch) | Chats, Discover |
| Neue ausgehende Anfrage | Discover |

## Lösung

Den `useNotificationCounts.ts` Hook erweitern, um alle Connection-Events abzudecken und die entsprechenden Caches zu invalidieren.

### Änderung in `src/hooks/useNotificationCounts.ts`

**Neue Realtime-Subscriptions hinzufügen:**

```typescript
const channel = supabase
  .channel('notification-updates')
  // Bestehend: Neue Nachrichten
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, ...)
  
  // Bestehend: Eingehende Anfragen (INSERT)
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'connections', filter: `to_user=eq.${internalUserId}` }, ...)
  
  // NEU: Connection-Updates (Status-Änderungen wie accepted/rejected)
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'connections' }, (payload) => {
    // Prüfen ob wir beteiligt sind (from_user oder to_user)
    const { from_user, to_user, status } = payload.new;
    if (from_user !== internalUserId && to_user !== internalUserId) return;
    
    // Bei accepted: Sender sieht neuen Chat
    if (status === 'accepted') {
      queryClient.invalidateQueries({ queryKey: ["sent-requests"] });
      queryClient.invalidateQueries({ queryKey: ["accepted-connections"] });
      queryClient.invalidateQueries({ queryKey: ["chats-preview"] });
      queryClient.invalidateQueries({ queryKey: ["discover-profiles"] });
    }
    
    // Bei rejected: Sender kann neuen Request senden
    if (status === 'rejected') {
      queryClient.invalidateQueries({ queryKey: ["sent-requests"] });
      queryClient.invalidateQueries({ queryKey: ["discover-profiles"] });
    }
  })
  
  // NEU: Connection gelöscht (Unmatch oder abgebrochene Anfrage)
  .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'connections' }, () => {
    // Bei DELETE: Alle relevanten Listen aktualisieren
    queryClient.invalidateQueries({ queryKey: ["accepted-connections"] });
    queryClient.invalidateQueries({ queryKey: ["chats-preview"] });
    queryClient.invalidateQueries({ queryKey: ["sent-requests"] });
    queryClient.invalidateQueries({ queryKey: ["incoming-requests"] });
    queryClient.invalidateQueries({ queryKey: ["discover-profiles"] });
  })
  
  // NEU: Ausgehende Anfragen (INSERT mit from_user = currentUser)
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'connections', filter: `from_user=eq.${internalUserId}` }, () => {
    queryClient.invalidateQueries({ queryKey: ["sent-requests"] });
    queryClient.invalidateQueries({ queryKey: ["discover-profiles"] });
  })
  .subscribe();
```

### Problem: internalUserId benötigt

Der Hook muss die interne User-ID (aus der `users` Tabelle) kennen, um die Filter korrekt zu setzen. Dies erfordert:

1. **Neuen Hook erstellen** oder `useCurrentUserId` verwenden:

```typescript
// In useNotificationCounts.ts
const { data: currentUserId } = useCurrentUserId();

useEffect(() => {
  if (!user || !currentUserId) return;
  
  const channel = supabase
    .channel('notification-updates')
    // ... mit currentUserId für Filter
    .subscribe();
    
  return () => supabase.removeChannel(channel);
}, [user, currentUserId, queryClient]);
```

## Zusammenfassung der Änderungen

| Datei | Änderung |
|-------|----------|
| `src/hooks/useNotificationCounts.ts` | Erweitern um UPDATE/DELETE Events und alle betroffenen Query-Keys |
| (Optional) | `useCurrentUserId` einbinden für interne User-ID |

## Erwartetes Ergebnis

Nach der Änderung aktualisieren sich alle Listen automatisch:

| Aktion | Automatische Updates |
|--------|---------------------|
| A sendet Anfrage an B | A: Discover aktualisiert, Sent Requests aktualisiert |
| B akzeptiert Anfrage | A: Neuer Chat erscheint, B: Incoming Requests verschwindet |
| B lehnt ab | A: Sent Requests aktualisiert, Profil in Discover wieder sichtbar |
| Unmatch | Beide: Chat verschwindet, Profil in Discover erscheint |

## Keine manuellen Refreshes mehr nötig
