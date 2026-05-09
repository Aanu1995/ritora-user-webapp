import { toast } from "sonner";
import {
  formatUploadMegabytes,
  getUploadPercent,
  type UploadProgressHandler,
} from "@/lib/upload-progress";

export enum UploadProgressToastKind {
  JournalPhoto = "journal-photo",
  ProductImage = "product-image",
  ProductPhotos = "product-photos",
}

type UploadProgressToastCopy = {
  title: string;
  starting: string;
  finalizing: string;
};

const COPY_BY_KIND: Record<UploadProgressToastKind, UploadProgressToastCopy> = {
  [UploadProgressToastKind.JournalPhoto]: {
    title: "Uploading journal photo",
    starting: "Starting upload",
    finalizing: "Finalizing photo",
  },
  [UploadProgressToastKind.ProductImage]: {
    title: "Uploading product photo",
    starting: "Starting upload",
    finalizing: "Finalizing photo",
  },
  [UploadProgressToastKind.ProductPhotos]: {
    title: "Uploading product photos",
    starting: "Starting upload",
    finalizing: "Reading product photos",
  },
};

const MIN_PERCENT_DELTA = 4;
const MIN_BYTE_DELTA = 512 * 1024;
const INITIAL_PROGRESS_LABEL = "0%";
const PERCENT_COMPLETE = 100;

function progressTitle(title: string, progressLabel: string): string {
  return `${title} - ${progressLabel}`;
}

export async function withUploadProgressToast<T>(
  kind: UploadProgressToastKind,
  task: (onUploadProgress: UploadProgressHandler) => Promise<T>,
): Promise<T> {
  const copy = COPY_BY_KIND[kind];
  const toastId = toast.loading(
    progressTitle(copy.title, INITIAL_PROGRESS_LABEL),
    {
      description: copy.starting,
    },
  );
  let lastPercent = -1;
  let lastLoadedBytes = 0;

  const updateToast = (progressLabel: string, description: string) => {
    toast.loading(progressTitle(copy.title, progressLabel), {
      id: toastId,
      description,
    });
  };

  const onUploadProgress: UploadProgressHandler = (event) => {
    const percent = getUploadPercent(event);

    if (percent !== null) {
      if (
        percent < PERCENT_COMPLETE &&
        lastPercent >= 0 &&
        percent - lastPercent < MIN_PERCENT_DELTA
      ) {
        return;
      }

      lastPercent = percent;
      const progressLabel = `${percent}%`;
      updateToast(
        progressLabel,
        percent >= PERCENT_COMPLETE
          ? copy.finalizing
          : `${progressLabel} uploaded`,
      );
      return;
    }

    if (event.loaded - lastLoadedBytes < MIN_BYTE_DELTA) {
      return;
    }

    lastLoadedBytes = event.loaded;
    const loadedLabel = formatUploadMegabytes(event.loaded);
    updateToast(loadedLabel, `${loadedLabel} uploaded`);
  };

  try {
    return await task(onUploadProgress);
  } finally {
    toast.dismiss(toastId);
  }
}
