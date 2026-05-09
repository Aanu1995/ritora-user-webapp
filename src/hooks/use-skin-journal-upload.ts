"use client";

import {
  UploadProgressToastKind,
  withUploadProgressToast,
} from "@/lib/upload-progress-toast";
import { upsertToday } from "@/services/skin-journal.service";
import type { UpsertEntryPayload } from "@/types/skin-journal";

export type UpsertTodayInput = {
  payload: UpsertEntryPayload;
  photo?: File | null;
};

export function upsertTodayWithProgress(input: UpsertTodayInput) {
  const photo = input.photo ?? null;

  if (!photo) {
    return upsertToday(input.payload, photo);
  }

  return withUploadProgressToast(
    UploadProgressToastKind.JournalPhoto,
    (onUploadProgress) =>
      upsertToday(input.payload, photo, { onUploadProgress }),
  );
}
