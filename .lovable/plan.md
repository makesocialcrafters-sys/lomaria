
# Icebreaker-Starter für Chat

## Übersicht

Drei vordefinierte Icebreaker-Starter als Quick-Reply-Chips oberhalb des Eingabefelds anzeigen, wenn der Chat noch keine Nachrichten enthält. Nach der ersten gesendeten Nachricht verschwinden sie automatisch.

## Die drei Icebreaker-Texte (aktualisiert)

| Chip-Label | Gesendete Nachricht |
|------------|---------------------|
| Studium & Alltag | "Zwischen LVs wenig Zeit, lass uns kurz schreiben." |
| Ziele & Projekte | "Ähnliche Ziele, lass kurz schauen, ob das passt." |
| Kennenlernen & Campus | "Gleicher Campus, gleiche Routine, lass uns das kurz ändern." |

## UX-Verhalten

- Sichtbar nur wenn `messages.length === 0`
- Antippen sendet den Text als erste Nachricht
- Verschwinden automatisch nach erster Nachricht
- Horizontal scrollbar auf Mobile

---

## Technische Umsetzung

### 1. Neue Komponente erstellen

**Datei:** `src/components/chat/IcebreakerStarters.tsx`

```typescript
const ICEBREAKERS = [
  {
    label: "Studium & Alltag",
    message: "Zwischen LVs wenig Zeit, lass uns kurz schreiben."
  },
  {
    label: "Ziele & Projekte", 
    message: "Ähnliche Ziele, lass kurz schauen, ob das passt."
  },
  {
    label: "Kennenlernen & Campus",
    message: "Gleicher Campus, gleiche Routine, lass uns das kurz ändern."
  }
];
```

Styling passend zur Lomaria-Ästhetik:
- Horizontales Layout mit `overflow-x-auto` und `scrollbar-hide`
- Outline-Buttons mit `border-primary/30`
- Uppercase Labels, kleiner Text, Letter-Spacing
- Slow Hover (500ms) mit Gold-Akzent
- Padding für horizontales Scrollen auf Mobile

### 2. ChatDetail.tsx anpassen

**Datei:** `src/pages/ChatDetail.tsx`

Änderungen:
1. Import der `IcebreakerStarters` Komponente
2. Handler für Icebreaker-Auswahl hinzufügen:

```typescript
const handleIcebreakerSelect = async (message: string) => {
  if (!chatData?.currentUserId || !connectionId) return;
  // Nutzt die bestehende Sende-Logik
  setNewMessage(message);
  // Direkt senden
  await handleSendWithMessage(message);
};
```

3. Im sticky bottom-Bereich (Zeile 369) einfügen:

```tsx
<div className="sticky bottom-0 bg-background border-t border-primary/20">
  {/* Icebreaker Starters - nur bei leerem Chat */}
  {messages.length === 0 && (
    <IcebreakerStarters 
      onSelect={handleIcebreakerSelect}
      disabled={sending}
    />
  )}
  
  <div className="flex gap-2 p-4">
    {/* bestehendes Input-Feld */}
  </div>
</div>
```

4. `handleSend` zu einer generischen Funktion erweitern, die optional einen direkten Text akzeptiert

---

## Betroffene Dateien

| Datei | Änderung |
|-------|----------|
| `src/components/chat/IcebreakerStarters.tsx` | Neue Komponente erstellen |
| `src/pages/ChatDetail.tsx` | Import + Integration der Icebreaker |

## Resultat

- Dezente Chips erscheinen bei neuen Chats
- Ein Tap sendet die Nachricht sofort
- Nach erster Nachricht verschwinden die Chips
- Nutzer kann sie ignorieren und frei schreiben
- Mobile-first, minimalistisches Design
