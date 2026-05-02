export interface CropSettings {
  zoom: number;
  offsetX: number;
  offsetY: number;
}

export interface SquareCropRegion {
  sourceX: number;
  sourceY: number;
  sourceSide: number;
}

export interface SquareCropPreviewStyle {
  width: string;
  height: string;
  left: string;
  top: string;
}

const OUTPUT_MIME_TYPE = "image/webp";
const OUTPUT_QUALITY = 0.88;
const OUTPUT_MAX_SIZE = 1600;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("image_load_failed"));
    image.decoding = "async";
    image.src = src;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("image_crop_failed"));
          return;
        }

        resolve(blob);
      },
      mimeType,
      quality,
    );
  });
}

function croppedFileName(fileName: string): string {
  const baseName = fileName.replace(/\.[^.]+$/, "");
  return `${baseName || "skin-journal-photo"}-cropped.webp`;
}

function formatPercent(value: number): string {
  const rounded = Number(value.toFixed(4));
  return `${rounded}%`;
}

export function calculateSquareCropRegion(
  sourceWidth: number,
  sourceHeight: number,
  settings: CropSettings,
): SquareCropRegion {
  const zoom = clamp(settings.zoom, 1, 3);
  const sourceSide = Math.max(1, Math.min(sourceWidth, sourceHeight) / zoom);
  const maxOffsetX = Math.max(0, (sourceWidth - sourceSide) / 2);
  const maxOffsetY = Math.max(0, (sourceHeight - sourceSide) / 2);
  const centerX =
    sourceWidth / 2 + (clamp(settings.offsetX, -100, 100) / 100) * maxOffsetX;
  const centerY =
    sourceHeight / 2 + (clamp(settings.offsetY, -100, 100) / 100) * maxOffsetY;

  return {
    sourceX: clamp(centerX - sourceSide / 2, 0, sourceWidth - sourceSide),
    sourceY: clamp(centerY - sourceSide / 2, 0, sourceHeight - sourceSide),
    sourceSide,
  };
}

export function calculateSquareCropPreviewStyle(
  sourceWidth: number,
  sourceHeight: number,
  region: SquareCropRegion,
): SquareCropPreviewStyle {
  return {
    width: formatPercent((sourceWidth / region.sourceSide) * 100),
    height: formatPercent((sourceHeight / region.sourceSide) * 100),
    left: formatPercent((-region.sourceX / region.sourceSide) * 100),
    top: formatPercent((-region.sourceY / region.sourceSide) * 100),
  };
}

export async function cropImageFileToSquare(
  file: File,
  imageUrl: string,
  settings: CropSettings,
): Promise<File> {
  const image = await loadImage(imageUrl);
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  const region = calculateSquareCropRegion(sourceWidth, sourceHeight, settings);
  const outputSize = Math.min(OUTPUT_MAX_SIZE, Math.round(region.sourceSide));
  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("image_crop_unavailable");
  }

  context.drawImage(
    image,
    region.sourceX,
    region.sourceY,
    region.sourceSide,
    region.sourceSide,
    0,
    0,
    outputSize,
    outputSize,
  );

  const blob = await canvasToBlob(canvas, OUTPUT_MIME_TYPE, OUTPUT_QUALITY);
  return new File([blob], croppedFileName(file.name), {
    type: OUTPUT_MIME_TYPE,
    lastModified: Date.now(),
  });
}
