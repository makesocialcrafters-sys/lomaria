
# Plan: "Coming Soon" Button für Lerngruppen

## Übersicht
Ein neuer "Coming Soon"-Button wird zur Discover-Seite hinzugefügt, der Studierende auf ein bevorstehendes Lerngruppen-Feature hinweist. Der Button folgt dem Wes Anderson Design-System.

---

## Was wird implementiert

### Visuelles Design
- Outline-Button-Stil (Border statt Füllung)
- Text: "LERNGRUPPEN" mit "COMING SOON"-Badge
- Gold-Akzentfarbe für Rahmen
- Deaktivierter Zustand (nicht klickbar)
- Platzierung: Unterhalb der Filter, oberhalb der Profilkarten

### User Experience
- Button zeigt klar, dass das Feature noch kommt
- Optional: Toast-Nachricht bei Klick mit Info "Bald verfügbar"
- Passt zum cinematischen, eleganten Design der App

---

## Technische Details

### Datei-Änderungen

**1. `src/pages/Discover.tsx`**
- Neuer Abschnitt zwischen Filters und Profile Cards
- Coming Soon Button mit Icon (Users oder BookOpen)
- Optional: Toast bei Klick

### Code-Struktur
```text
<Filter Section />
    ↓
<Coming Soon Section>  ← NEU
  - Icon + "Lerngruppen" Text
  - "Coming Soon" Badge
</Coming Soon Section>
    ↓
<Profile Cards />
```

### Styling
- Verwendet bestehende Button-Komponente mit `variant="outline"`
- Badge als kleines Pill-Element
- Cinematic Animation beim Laden

---

## Alternative Platzierungen (zur Diskussion)

1. **Bottom Navigation**: Neuer Tab mit Lock-Icon
2. **Profile-Seite**: Als Banner/Karte
3. **Eigene Coming-Soon-Seite**: `/lerngruppen` Route

Die Discover-Seite als Platzierung macht Sinn, da dort Studierende aktiv nach Verbindungen suchen.
