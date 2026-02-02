

# Plan: Opportunity-Tab zwischen "Kontakte" und "Chats" verschieben

## Übersicht
Der "Opportunity"-Tab wird von seiner aktuellen Position (zwischen Chats und Profil) an die neue Position zwischen "Kontakte" und "Chats" verschoben.

---

## Aktuelle Reihenfolge
```text
Entdecken | Kontakte | Chats | Opportunity | Profil
```

## Neue Reihenfolge
```text
Entdecken | Kontakte | Opportunity | Chats | Profil
```

---

## Technische Änderung

### `src/components/layout/BottomNavigation.tsx`

**Anpassung der navItems-Struktur:**
- Das Array `navItems` wird aufgeteilt in zwei Teile:
  1. Erste Gruppe: Entdecken, Kontakte
  2. Zweite Gruppe: Chats
- Der Opportunity-Button wird zwischen diesen beiden Gruppen gerendert
- Profil-Tab bleibt am Ende

**Neue Render-Reihenfolge:**
1. Map über erste Gruppe (Entdecken, Kontakte)
2. Opportunity-Button (Coming Soon)
3. Map über zweite Gruppe (Chats)
4. Profil-Tab

---

## Code-Änderungen

```text
const navItemsBeforeOpportunity = [
  { to: "/discover", icon: User, label: "Entdecken" },
  { to: "/contacts", icon: Users, label: "Kontakte" },
];

const navItemsAfterOpportunity = [
  { to: "/chats", icon: MessageCircle, label: "Chats" },
];
```

Die Render-Logik wird entsprechend angepasst, um die Tabs in der gewünschten Reihenfolge darzustellen.

