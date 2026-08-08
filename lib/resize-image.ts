import { MAX_IMAGE_DATA_URL_LENGTH } from "./test-validation";

const MAX_IMAGE_DIMENSION = 900;
const JPEG_QUALITY = 0.8;

export class ImageProcessingError extends Error {
  constructor(public reason: "invalid_type" | "too_large" | "read_failed") {
    super(reason);
  }
}

export function resizeImageToDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    return Promise.reject(new ImageProcessingError("invalid_type"));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new ImageProcessingError("read_failed"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new ImageProcessingError("read_failed"));
      img.onload = () => {
        const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(img.width, img.height));
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new ImageProcessingError("read_failed"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
        if (dataUrl.length > MAX_IMAGE_DATA_URL_LENGTH) {
          reject(new ImageProcessingError("too_large"));
          return;
        }
        resolve(dataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
