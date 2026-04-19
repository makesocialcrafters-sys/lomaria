

## Inline-Styles für garantiertes Non-Select-Verhalten

`select-none` reicht in Safari/iOS oft nicht — Inline-Styles erzwingen das Verhalten zuverlässig.

### Änderungen

**1. `src/components/ui/SignedAvatar.tsx`**
Auf Wrapper-`<div>`, `<img>` und Fallback-`<div>` jeweils ergänzen:
```tsx
style={{
  userSelect: 'none',
  WebkitUserSelect: 'none',
  WebkitTouchCallout: 'none',
}}
```
(`WebkitTouchCallout: 'none'` zusätzlich, weil iOS sonst beim Long-Press das Speichern-Menü zeigt — passt zum Ziel "nicht auswählbar".)

**2. `src/components/ui/avatar.tsx`** (Radix-Wrapper)
Selbe Inline-Styles auf `AvatarPrimitive.Root`, `AvatarImage` und `AvatarFallback`.

**3. Direkte `<img>`-Profilbilder**
Selbe Inline-Styles auf `<img>` ergänzen:
- `src/pages/ProfileDetail.tsx`
- `src/pages/Profile.tsx`

(`Step8Preview.tsx` nutzt SignedAvatar — bereits abgedeckt.)

### Bewusst ausgenommen
- `ProfileImageUpload.tsx`, `image-crop-dialog.tsx`, `lazy-image.tsx`

### Effekt
- Browser-übergreifend (inkl. Safari/iOS) nicht markierbar
- Long-Press auf iOS zeigt kein Bild-Kontextmenü mehr
- Bestehendes `select-none`, `draggable={false}`, Click-Stop bleiben unverändert

