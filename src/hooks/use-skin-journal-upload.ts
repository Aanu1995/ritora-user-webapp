"use client";

import {
  UploadProgressToastKind,
  withUploadProgressToast,
} from "@/lib/upload-progress-toast";
import {
  upsertToday,
  type PhotoAngleUpload,
} from "@/services/skin-journal.service";
import type { UpsertEntryPayload } from "@/types/skin-journal";

export type UpsertTodayInput = {
  payload: UpsertEntryPayload;
  photos?: PhotoAngleUpload | null;
};

function hasAngleUploads(
  photos: PhotoAngleUpload | null | undefined,
): photos is PhotoAngleUpload {
  return !!photos && Object.values(photos).some((photo) => photo instanceof File);
}

export function upsertTodayWithProgress(input: UpsertTodayInput) {
  const photoInput = hasAngleUploads(input.photos) ? input.photos : null;

  if (!photoInput) {
    return upsertToday(input.payload, photoInput);
  }

  return withUploadProgressToast(
    UploadProgressToastKind.JournalPhoto,
    (onUploadProgress) =>
      upsertToday(input.payload, photoInput, { onUploadProgress }),
  );
}
