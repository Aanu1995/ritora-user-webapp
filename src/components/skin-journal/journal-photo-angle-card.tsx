"use client";

import { useTranslations } from "next-intl";
import {
  Camera,
  RotateCcw,
  ScissorsLineDashed,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SmoothImage } from "@/components/ui/smooth-image";
import { Chip } from "@/components/skin-journal/chip";
import {
  FRONT_PHOTO_ANGLE,
  type Angle,
  type JournalEntryPhoto,
} from "@/types/skin-journal";
import type { JournalPhotoValidationMessage } from "./journal-photo-upload-validation";

interface JournalPhotoAngleCardProps {
  angle: Angle;
  disabled?: boolean;
  selectedPhoto: File | null;
  previewUrl: string | null;
  existingPhoto?: JournalEntryPhoto;
  alt: string;
  fileError?: JournalPhotoValidationMessage;
  setInputRef: (node: HTMLInputElement | null) => void;
  onFileSelected: (file: File) => void;
  onChoosePhoto: () => void;
  onCrop: () => void;
  onRemove: () => void;
}

const ACCEPTED_IMAGE_TYPES = "image/*";
const BYTES_PER_MEGABYTE = 1024 * 1024;

function formatMegabytes(size: number): string {
  return `${(size / BYTES_PER_MEGABYTE).toFixed(2)} MB`;
}

export function JournalPhotoAngleCard({
  angle,
  disabled = false,
  selectedPhoto,
  previewUrl,
  existingPhoto,
  alt,
  fileError,
  setInputRef,
  onFileSelected,
  onChoosePhoto,
  onCrop,
  onRemove,
}: JournalPhotoAngleCardProps) {
  const t = useTranslations("journal.upload");
  const isFront = angle === FRONT_PHOTO_ANGLE;
  const label = t(`angles.${angle}`);
  const imageUrl = previewUrl ?? existingPhoto?.photo_url ?? null;
  const hasSelectedPhoto = !!selectedPhoto && !!previewUrl;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold">{label}</span>
        <span className="text-[11px] font-medium text-muted">
          {t(isFront ? "angleRequired" : "angleOptional")}
        </span>
      </div>

      <input
        ref={setInputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES}
        data-angle={angle}
        disabled={disabled}
        className="hidden"
        onChange={(event) => {
          const nextFile = event.target.files?.[0];
          if (nextFile) {
            onFileSelected(nextFile);
          }
        }}
      />

      {imageUrl ? (
        <div>
          <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-2xl border border-border">
            <SmoothImage src={imageUrl} alt={alt} className="h-full w-full" />
            <div className="absolute left-2 top-2">
              <Chip variant="accent" selected>
                {hasSelectedPhoto ? t("cropBadge") : t("currentPhotoBadge")}
              </Chip>
            </div>
            <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onChoosePhoto}
                disabled={disabled}
                className="bg-surface/90 px-2 backdrop-blur"
                type="button"
                aria-label={t("replaceAngle", { angle: label })}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">{t("replace")}</span>
              </Button>
              {hasSelectedPhoto ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-surface/90 px-2 backdrop-blur"
                  onClick={onCrop}
                  disabled={disabled}
                  type="button"
                  aria-label={
                    isFront ? t("crop") : t("cropAngle", { angle: label })
                  }
                >
                  <ScissorsLineDashed className="h-3.5 w-3.5" />
                  <span className="hidden lg:inline">{t("crop")}</span>
                </Button>
              ) : null}
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="bg-surface/90 px-2 text-danger backdrop-blur hover:bg-surface"
                type="button"
                aria-label={t("removeAngle", { angle: label })}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">{t("remove")}</span>
              </Button>
            </div>
          </div>
          {selectedPhoto ? (
            <p className="mt-2 text-xs text-muted">
              {t("fileMeta", {
                name: selectedPhoto.name,
                size: formatMegabytes(selectedPhoto.size),
                kind: t("processedKind"),
              })}
            </p>
          ) : (
            <p className="mt-2 text-xs text-muted">
              {t("currentPhotoHint")}
            </p>
          )}
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={onChoosePhoto}
          className="group mx-auto flex aspect-square w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[color:var(--border-strong)] bg-accent-soft/30 p-4 text-center transition hover:border-accent hover:bg-accent-soft/60 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-[color:var(--border-strong)] disabled:hover:bg-accent-soft/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
        >
          <div
            aria-hidden
            className="mb-3 grid h-11 w-11 place-items-center rounded-xl border border-border bg-surface"
          >
            <Camera className="h-5 w-5 text-muted" />
          </div>
          <p className="text-sm font-semibold text-foreground">
            {t(isFront ? "dropZoneTitleFront" : "dropZoneTitleSide", {
              angle: label,
            })}
          </p>
          <p className="mt-1 max-w-[220px] text-balance text-xs leading-relaxed text-muted">
            {t(isFront ? "dropZoneDesc" : "dropZoneDescSide")}
          </p>
        </button>
      )}

      {fileError ? (
        <p className="mt-2 text-xs font-semibold text-danger">
          {t(fileError)}
        </p>
      ) : null}
    </div>
  );
}
