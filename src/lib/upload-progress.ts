import type { AxiosProgressEvent } from "axios";

export type UploadProgressHandler = (event: AxiosProgressEvent) => void;

export type UploadProgressOptions = {
  onUploadProgress?: UploadProgressHandler;
};

const BYTES_PER_MEGABYTE = 1024 * 1024;
const PERCENT_COMPLETE = 100;

export function getUploadPercent(event: AxiosProgressEvent): number | null {
  if (typeof event.progress === "number") {
    return Math.min(
      PERCENT_COMPLETE,
      Math.max(0, Math.round(event.progress * PERCENT_COMPLETE)),
    );
  }

  if (!event.total || event.total <= 0) {
    return null;
  }

  return Math.min(
    PERCENT_COMPLETE,
    Math.max(0, Math.round((event.loaded / event.total) * PERCENT_COMPLETE)),
  );
}

export function formatUploadMegabytes(bytes: number): string {
  if (bytes <= 0) {
    return "0 MB";
  }

  return `${Math.max(0.1, bytes / BYTES_PER_MEGABYTE).toFixed(1)} MB`;
}
