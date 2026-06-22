import { z } from "@/lib/zod";

export enum JournalPhotoValidationMessage {
  UnsupportedType = "unsupportedPhotoType",
  TooLarge = "photoTooLarge",
}

export const JOURNAL_PHOTO_MAX_BYTES = 10 * 1024 * 1024;

const JOURNAL_PHOTO_ALLOWED_TYPES: readonly string[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

const journalPhotoSchema = z
  .instanceof(File)
  .refine((file) => JOURNAL_PHOTO_ALLOWED_TYPES.includes(file.type), {
    message: JournalPhotoValidationMessage.UnsupportedType,
  })
  .refine((file) => file.size <= JOURNAL_PHOTO_MAX_BYTES, {
    message: JournalPhotoValidationMessage.TooLarge,
  });

export function validateJournalPhotoFile(
  file: File,
): JournalPhotoValidationMessage | null {
  const result = journalPhotoSchema.safeParse(file);
  if (result.success) {
    return null;
  }
  const firstIssue = result.error.issues[0];
  return firstIssue?.message === JournalPhotoValidationMessage.TooLarge
    ? JournalPhotoValidationMessage.TooLarge
    : JournalPhotoValidationMessage.UnsupportedType;
}
