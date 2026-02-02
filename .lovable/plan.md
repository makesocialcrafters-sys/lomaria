

# Plan: "Opportunity" Tab in Bottom Navigation

## Übersicht
Ein neuer "Opportunity" Tab wird zur Bottom Navigation hinzugefügt – mit Lock-Icon und Coming-Soon-Funktionalität. Der bestehende Lerngruppen-Button auf der Discover-Seite bleibt unverändert.

---

## Was wird implementiert

### Visuelles Design
- Neuer 5. Tab zwischen "Chats" und "Profil"
- Icon: `Lock` (Schloss-Symbol)
- Label: "OPPORTUNITY"
- Leicht gedimmte Darstellung (`text-foreground/40`)
- Kein aktiver Zustand möglich (keine Navigation)

### User Experience
- Bei Klick: Toast-Nachricht "Bald verfügbar"
- Visuell unterscheidbar von aktiven Tabs durch gedimmte Farbe
- Touch-Target bleibt ausreichend groß (5 Tabs passen gut auf Mobile)

---

## Technische Änderungen

### `src/components/layout/BottomNavigation.tsx`

**Imports hinzufügen:**
- `Lock` Icon aus lucide-react
- `toast` aus `@/hooks/use-toast`

**Neuer Tab:**
- Button (kein NavLink) nach den regulären Tabs
- Zwischen "Chats" und "Profil" platziert
- onClick löst Toast aus

### Code-Struktur

```text
Navigation Reihenfolge:
Entdecken | Kontakte | Chats | Opportunity | Profil
   User      Users    Message    Lock 🔒    UserCircle

navItems Array (unverändert):
  - Entdecken, Kontakte, Chats

Separater Opportunity Tab (NEU):
  - Button mit onClick → toast()
  - Lock Icon
  - Gedimmtes Styling (text-foreground/40)

Profil Tab:
  - Wird nach dem Opportunity Tab gerendert
```

### Implementierung
- navItems Array wird aufgeteilt: erste 3 Tabs vor Opportunity, Profil danach
- Oder: Spezieller Marker im Array für "coming soon" Tabs
- Einfachste Lösung: Profil aus Array entfernen, manuell nach Opportunity rendern

---

## Bestehender Code bleibt

Der Lerngruppen-Button auf der Discover-Seite (Zeilen 224-243) bleibt wie er ist.

