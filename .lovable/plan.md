
# Plan: Fix Foto-Upload für iOS/Mobile Browser

## Problem
Der Foto-Upload funktioniert nicht, vermutlich auf mobilen Geräten (iOS Safari). Die Ursachen:

1. Das `crossOrigin="anonymous"` Attribut wird auch bei Data URLs gesetzt, was zu "tainted canvas"-Fehlern führt
2. `canvas.toBlob()` funktioniert nicht zuverlässig auf allen iOS-Versionen
3. Keine Fallback-Implementierung vorhanden

## Lösung

### Datei: `src/lib/image-utils.ts`

**Änderung 1: `createImage` Funktion verbessern**
- `crossOrigin` nur bei externen URLs setzen, nicht bei Data URLs oder Blob URLs
- Prüfung ob src mit "data:" oder "blob:" beginnt

**Änderung 2: `getCroppedImg` mit Fallback**
- Fallback auf `toDataURL` wenn `toBlob` null zurückgibt
- Konvertierung von DataURL zu Blob als Alternative
- Bessere Fehlerbehandlung

**Änderung 3: Memory-Limits beachten**
- Für iOS: kleinere Output-Größe (600px statt 800px) wenn nötig

### Neue Implementierung

```text
createImage Funktion:
┌──────────────────────────────────┐
│ Prüfe: Ist src eine Data URL?   │
├──────────────────────────────────┤
│ JA: crossOrigin NICHT setzen    │
│ NEIN: crossOrigin = "anonymous" │
└──────────────────────────────────┘

getCroppedImg Funktion:
┌──────────────────────────────────┐
│ canvas.toBlob() aufrufen        │
├──────────────────────────────────┤
│ blob === null?                  │
│ JA: Fallback → toDataURL        │
│     → dataURLtoBlob Konversion  │
│ NEIN: blob zurückgeben          │
└──────────────────────────────────┘
```

## Technische Details

```typescript
// createImage - crossOrigin nur bei externen URLs
export function createImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    
    // Nur für externe URLs crossOrigin setzen, nicht für data: oder blob: URLs
    if (!src.startsWith("data:") && !src.startsWith("blob:")) {
      image.setAttribute("crossOrigin", "anonymous");
    }
    
    image.src = src;
  });
}

// Neue Hilfsfunktion für Fallback
function dataURLtoBlob(dataURL: string): Blob {
  const parts = dataURL.split(",");
  const mime = parts[0].match(/:(.*?);/)?.[1] || "image/jpeg";
  const byteString = atob(parts[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mime });
}

// getCroppedImg mit Fallback
export async function getCroppedImg(...): Promise<Blob> {
  // ... canvas drawing code ...
  
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          // Fallback für iOS Safari
          try {
            const dataURL = canvas.toDataURL("image/jpeg", 0.9);
            const fallbackBlob = dataURLtoBlob(dataURL);
            resolve(fallbackBlob);
          } catch (e) {
            reject(new Error("Bild konnte nicht erstellt werden"));
          }
        }
      },
      "image/jpeg",
      0.9
    );
  });
}
```

## Erwartetes Ergebnis
- Foto-Upload funktioniert auf allen Browsern inklusive iOS Safari
- Robustere Fehlerbehandlung
- Fallback-Mechanismus wenn `toBlob` fehlschlägt
