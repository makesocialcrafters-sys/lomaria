

## Profilbilder: nur select-none + draggable=false

Ohne `pointer-events-none` — Klicks auf umliegende Karten funktionieren normal weiter.

### Änderungen

**1. `src/components/ui/SignedAvatar.tsx`**
- Wrapper-`<div>`: Klasse `select-none` ergänzen
- `<img>`: Klasse `select-none` + `draggable={false}` ergänzen
- Fallback-`<div>` (Initialen): `select-none` ergänzen

**2. `src/components/ui/avatar.tsx`** (Radix-Wrapper)
- `AvatarPrimitive.Root`: `select-none` ergänzen
- `AvatarImage`: `select-none` + `draggable={false}` ergänzen
- `AvatarFallback`: `select-none` ergänzen

**3. Direkte `<img>`-Verwendungen für Profilbilder**
Jeweils `select-none` + `draggable={false}` am `<img>`:
- `src/pages/ProfileDetail.tsx`
- `src/pages/Profile.tsx`
- `src/components/onboarding/Step8Preview.tsx` (nutzt SignedAvatar — bereits abgedeckt, kein Extra-Edit nötig)

### Bewusst ausgenommen
- `ProfileImageUpload.tsx`, `image-crop-dialog.tsx`, `lazy-image.tsx` — wie zuvor.

### Effekt
- Bild nicht markierbar, nicht ziehbar
- Karten-Klicks funktionieren normal (kein `pointer-events-none`)
- Stop-Propagation aus vorheriger Änderung bleibt bestehen — Avatar-Tap navigiert weiterhin nicht, Tap auf Rest der Karte schon

