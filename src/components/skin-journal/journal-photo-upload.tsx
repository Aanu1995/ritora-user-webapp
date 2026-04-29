"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import {
  Camera,
  RotateCcw,
  Trash2,
  ScissorsLineDashed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ANGLE_VALUES, type Angle } from "@/types/skin-journal";
import { Chip } from "./chip";

interface JournalPhotoUploadProps {
  photo: File | null;
  onPhotoChange: (photo: File | null) => void;
  angle: Angle;
  onAngleChange: (angle: Angle) => void;
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
  onPhotoChange,
  angle,
  onAngleChange,
  isPreRoutine,
  onPreRoutineChange,
  photoProcessingConsent = false,
  onPhotoProcessingConsentChange,
}: JournalPhotoUploadProps) {
  const t = useTranslations("journal.upload");
  const tAngles = useTranslations("journal.upload.angles");
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFile = (file: File | null) => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    if (file) {
      const nextPreviewUrl = URL.createObjectURL(file);
      previewUrlRef.current = nextPreviewUrl;
      setPreviewUrl(nextPreviewUrl);
    } else {
      setPreviewUrl(null);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
    onPhotoChange(file);
  };

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (photo || !previewUrlRef.current) {
      return;
    }

    URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
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
          <div className="relative aspect-square w-full max-w-[320px] overflow-hidden rounded-2xl border border-border">
            <Image
              src={previewUrl}
              alt={t("photoPreviewAlt")}
              fill
              unoptimized
              className="object-cover"
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
      ) : (
        <Button
          type="button"
          variant="ghost"
          onClick={() => inputRef.current?.click()}
          className="group flex aspect-square h-auto w-full max-w-[320px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border-strong bg-surface-muted p-4 text-center transition hover:border-accent hover:bg-surface"
        >
          <div
            aria-hidden
            className="mb-3 grid h-12 w-12 place-items-center rounded-xl border border-border bg-surface text-[22px] leading-none"
          >
            <Camera className="h-5 w-5 text-muted" />
          </div>
          <p className="text-sm font-semibold">{t("dropZoneTitle")}</p>
          <p className="mt-0.5 text-xs text-muted">{t("dropZoneDesc")}</p>
        </Button>
      )}

      <p className="mt-2 text-xs text-muted">{t("noWebcam")}</p>

      {photo ? (
        <label className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-surface-muted p-3 text-sm leading-relaxed">
          <Checkbox
            checked={photoProcessingConsent}
            onCheckedChange={(checked) =>
              onPhotoProcessingConsentChange?.(checked === true)
            }
          />
          <span>{t("photoProcessingConsent")}</span>
        </label>
      ) : null}

      <p className="mb-1.5 mt-4 block text-xs font-semibold">
        {t("angleLabel")}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {ANGLE_VALUES.map((a: Angle) => (
          <Chip
            key={a}
            asButton
            selected={angle === a}
            onClick={() => onAngleChange(a)}
          >
            {tAngles(a)}
          </Chip>
        ))}
      </div>

      <label className="mt-4 flex items-center gap-2 text-sm">
        <Checkbox
          checked={isPreRoutine}
          onCheckedChange={(checked) => onPreRoutineChange(checked === true)}
        />
        <span>{t("preRoutine")}</span>
      </label>
    </div>
  );
}
