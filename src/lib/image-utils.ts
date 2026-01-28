export interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Load an image from a URL or base64 string
 * Only sets crossOrigin for external URLs to avoid tainted canvas errors
 */
export function createImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    
    // Only set crossOrigin for external URLs, not for data: or blob: URLs
    // This prevents "tainted canvas" errors on iOS Safari
    if (!src.startsWith("data:") && !src.startsWith("blob:")) {
      image.setAttribute("crossOrigin", "anonymous");
    }
    
    image.src = src;
  });
}

/**
 * Validate an image file for type, size, and resolution
 */
export async function validateImageFile(file: File): Promise<void> {
  // Check file type
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Nur JPG und PNG Bilder sind erlaubt");
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error("Bild darf maximal 5MB groß sein");
  }

  // Check resolution (min 300x300)
  const image = await createImage(URL.createObjectURL(file));
  if (image.naturalWidth < 300 || image.naturalHeight < 300) {
    throw new Error("Bild muss mindestens 300x300 Pixel groß sein");
  }
}

/**
 * Convert a data URL to a Blob (fallback for iOS Safari)
 */
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

/**
 * Get a cropped image as a Blob
 * Includes fallback for iOS Safari where toBlob may return null
 */
export async function getCroppedImg(
  imageSrc: string,
  croppedAreaPixels: Area,
  outputSize: number = 800
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas context nicht verfügbar");
  }

  // Set output size to ~800x800 for optimized web usage
  canvas.width = outputSize;
  canvas.height = outputSize;

  // Draw the cropped area to the canvas, scaled to output size
  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    outputSize,
    outputSize
  );

  // Convert to JPEG blob with 0.9 quality
  // Includes fallback for iOS Safari where toBlob may return null
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          // Fallback for iOS Safari: use toDataURL and convert manually
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

/**
 * Read a file as a data URL (base64)
 */
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
