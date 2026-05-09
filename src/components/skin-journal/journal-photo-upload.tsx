"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Camera,
  RotateCcw,
  Trash2,
  ScissorsLineDashed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { SmoothImage } from "@/components/ui/smooth-image";
import { PhotoCropDialog } from "@/components/skin-journal/photo-crop-dialog";
import { Chip } from "./chip";
import {
  JournalPhotoValidationMessage,
  validateJournalPhotoFile,
} from "./journal-photo-upload-validation";

interface JournalPhotoUploadProps {
  photo: File | null;
  existingPhotoUrl?: string | null;
  existingPhotoAlt?: string;
  onPhotoChange: (photo: File | null) => void;
  isPreRoutine: boolean;
  onPreRoutineChange: (next: boolean) => void;
  photoProcessingConsent?: boolean;
  onPhotoProcessingConsentChange?: (next: boolean) => void;
}

const ACCEPTED_IMAGE_TYPES = "image/*";
const BYTES_PER_MEGABYTE = 1024 * 1024;

function formatMegabytes(size: number): string {
  return `${(size / BYTES_PER_MEGABYTE).toFixed(2)} MB`;
}

export function JournalPhotoUpload({
  photo,
  existingPhotoUrl,
  existingPhotoAlt,
  onPhotoChange,
  isPreRoutine,
  onPreRoutineChange,
  photoProcessingConsent = false,
  onPhotoProcessingConsentChange,
}: JournalPhotoUploadProps) {
  const t = useTranslations("journal.upload");
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const previewFileRef = useRef<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [fileError, setFileError] =
    useState<JournalPhotoValidationMessage | null>(null);

  const handleFile = (file: File | null) => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
      previewFileRef.current = null;
    }

    if (file) {
      const validationError = validateJournalPhotoFile(file);
      if (validationError) {
        setPreviewUrl(null);
        setFileError(validationError);
        if (inputRef.current) {
          inputRef.current.value = "";
        }
        onPhotoChange(null);
        setCropOpen(false);
        return;
      }
      const nextPreviewUrl = URL.createObjectURL(file);
      previewUrlRef.current = nextPreviewUrl;
      previewFileRef.current = file;
      setPreviewUrl(nextPreviewUrl);
      setFileError(null);
    } else {
      setPreviewUrl(null);
      setFileError(null);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      setCropOpen(false);
    }
    onPhotoChange(file);
  };

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
        previewFileRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (photo || !previewUrlRef.current) {
      return;
    }

    URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    previewFileRef.current = null;
  }, [photo]);

  return (
    <div>
      <label className="mb-2 block text-xs font-semibold">
        {t("photoLabel")}
      </label>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />

      {photo && previewUrl ? (
        <div>
          <div className="relative aspect-square mx-auto w-full max-w-[420px] overflow-hidden rounded-2xl border border-border">
            <SmoothImage
              src={previewUrl}
              alt={t("photoPreviewAlt")}
              className="h-full w-full"
            />
            <div className="absolute left-2.5 top-2.5">
              <Chip variant="accent" selected>
                {t("cropBadge")}
              </Chip>
            </div>
            <div className="absolute bottom-2.5 left-2.5 right-2.5 flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (inputRef.current) {
                    inputRef.current.value = "";
                    inputRef.current.click();
                  }
                }}
                className="bg-surface/90 backdrop-blur"
                type="button"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {t("replace")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-surface/90 backdrop-blur"
                onClick={() => setCropOpen(true)}
                type="button"
              >
                <ScissorsLineDashed className="h-3.5 w-3.5" />
                {t("crop")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFile(null)}
                className="bg-surface/90 text-danger backdrop-blur hover:bg-surface"
                type="button"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {t("remove")}
              </Button>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted">
            {t("fileMeta", {
              name: photo.name,
              size: formatMegabytes(photo.size),
              kind: t("processedKind"),
            })}
          </p>
        </div>
      ) : existingPhotoUrl ? (
        <div>
          <div className="relative aspect-square mx-auto w-full max-w-[420px] overflow-hidden rounded-2xl border border-border">
            <SmoothImage
              src={existingPhotoUrl}
              alt={existingPhotoAlt ?? t("photoPreviewAlt")}
              className="h-full w-full"
            />
            <div className="absolute left-2.5 top-2.5">
              <Chip variant="accent" selected>
                {t("currentPhotoBadge")}
              </Chip>
            </div>
            <div className="absolute bottom-2.5 left-2.5 right-2.5 flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (inputRef.current) {
                    inputRef.current.value = "";
                    inputRef.current.click();
                  }
                }}
                className="bg-surface/90 backdrop-blur"
                type="button"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {t("replace")}
              </Button>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted">
            {t("currentPhotoHint")}
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="group mx-auto flex aspect-square w-full max-w-[420px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[color:var(--border-strong)] bg-accent-soft/30 p-6 text-center transition hover:border-accent hover:bg-accent-soft/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
        >
          <div
            aria-hidden
            className="mb-3 grid h-12 w-12 place-items-center rounded-xl border border-border bg-surface"
          >
            <Camera className="h-5 w-5 text-muted" />
          </div>
          <p className="text-sm font-semibold text-foreground">
            {t("dropZoneTitle")}
          </p>
          <p className="mt-1 max-w-[280px] text-balance text-xs leading-relaxed text-muted">
            {t("dropZoneDesc")}
          </p>
        </button>
      )}

      <p className="mt-2 text-xs text-muted">{t("noWebcam")}</p>

      {fileError ? (
        <p className="mt-2 text-xs font-semibold text-danger">
          {t(fileError)}
        </p>
      ) : null}

      {photo ? (
        <label className="mt-4 flex items-center gap-2 rounded-xl border border-[color:var(--border-strong)] bg-accent-soft/30 p-3 text-sm leading-relaxed">
          <Checkbox
            checked={photoProcessingConsent}
            onCheckedChange={(checked) =>
              onPhotoProcessingConsentChange?.(checked === true)
            }
          />
          <span>{t("photoProcessingConsent")}</span>
        </label>
      ) : null}

      <label className="mt-4 flex items-center gap-2 text-sm">
        <Checkbox
          checked={isPreRoutine}
          onCheckedChange={(checked) => onPreRoutineChange(checked === true)}
        />
        <span>{t("preRoutine")}</span>
      </label>

      {photo && previewUrl && cropOpen ? (
        <PhotoCropDialog
          open={cropOpen}
          photo={photo}
          previewUrl={previewUrl}
          onOpenChange={setCropOpen}
          onApply={handleFile}
        />
      ) : null}
    </div>
  );
}
