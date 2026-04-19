

## Avatar-Klick „schlucken" (Variante A)

Avatar-Bereich gibt Taps nicht mehr an die umgebende Karte weiter.

### Änderungen

**1. `src/components/ui/SignedAvatar.tsx`**
Am äußeren `<div>` ergänzen:
- `onClick={(e) => e.stopPropagation()}`
- Klasse `cursor-default`

**2. `src/components/ui/avatar.tsx`** (Radix-Wrapper, in Header/Listen genutzt)
An `Avatar.Root` selbe Behandlung: `onClick`-Stop + `cursor-default`.

**3. Direkte `<img>`-Verwendungen für Profilbilder**
Suche bestätigt diese Stellen — alle bekommen Wrapper-`<div>` oder `onClick`-Stop + `cursor-default`:
- `src/pages/ProfileDetail.tsx` (großes Profilbild)
- `src/pages/Profile.tsx` (eigenes Profilbild)
- `src/components/onboarding/Step8Preview.tsx` (Vorschau)
- `src/components/settings/ProfileImageUpload.tsx` (Upload-Vorschau — falls in klickbarem Container)

### Nicht angefasst
- `image-crop-dialog.tsx` (Crop-UI ist eigener Modal-Flow, kein Karten-Kontext)
- `lazy-image.tsx` (nicht für Avatare im Einsatz, geprüft)
- Kartenkomponenten (ConnectionCard, IncomingRequestCard, SentRequestCard, UserProfileCard) — bleiben klickbar, nur Avatar-Region schluckt den Tap

### Effekt
- Tap auf Avatar → nichts passiert
- Tap auf Name/Text/restliche Karte → navigiert wie bisher
- Cursor über Avatar = Default-Pfeil statt Pointer

