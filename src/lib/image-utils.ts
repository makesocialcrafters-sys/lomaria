export interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Load an image from a URL or base64 string
 */
export function createImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
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
 * Get a cropped image as a Blob
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
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Bild konnte nicht erstellt werden"));
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
