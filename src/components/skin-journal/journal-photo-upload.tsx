"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Checkbox } from "@/components/ui/checkbox";
import { PhotoCropDialog } from "@/components/skin-journal/photo-crop-dialog";
import { JournalPhotoAngleCard } from "@/components/skin-journal/journal-photo-angle-card";
import {
  FRONT_PHOTO_ANGLE,
  PHOTO_ANGLES,
  type Angle,
  type JournalEntryPhoto,
} from "@/types/skin-journal";
import {
  JournalPhotoValidationMessage,
  validateJournalPhotoFile,
} from "./journal-photo-upload-validation";

type PhotoMap = Partial<Record<Angle, File | null>>;

interface JournalPhotoUploadProps {
  disabled?: boolean;
  photos?: PhotoMap;
  existingPhotos?: JournalEntryPhoto[];
  removedPhotoAngles?: Angle[];
  onPhotoAngleChange?: (angle: Angle, photo: File | null) => void;
  onRemoveExistingAngle?: (angle: Angle) => void;
  existingPhotoAlt?: string;
  isPreRoutine: boolean;
  onPreRoutineChange: (next: boolean) => void;
  photoProcessingConsent?: boolean;
  onPhotoProcessingConsentChange?: (next: boolean) => void;
}

const UPLOAD_SLOT_ANGLES: Angle[] = [
  "left_profile",
  FRONT_PHOTO_ANGLE,
  "right_profile",
];

function angleTitle(
  angle: Angle,
  t: ReturnType<typeof useTranslations>,
): string {
  return t(`angles.${angle}`);
}

export function JournalPhotoUpload({
  disabled = false,
  photos,
  existingPhotos,
  removedPhotoAngles = [],
  onPhotoAngleChange,
  onRemoveExistingAngle,
  existingPhotoAlt,
  isPreRoutine,
  onPreRoutineChange,
  photoProcessingConsent = false,
  onPhotoProcessingConsentChange,
}: JournalPhotoUploadProps) {
  const t = useTranslations("journal.upload");
  const inputRefs = useRef<Record<Angle, HTMLInputElement | null>>({
    head_on: null,
    left_profile: null,
    right_profile: null,
  });
  const previewUrlsRef = useRef<Partial<Record<Angle, string>>>({});
  const [previewUrls, setPreviewUrls] = useState<Partial<Record<Angle, string>>>(
    {},
  );
  const [cropAngle, setCropAngle] = useState<Angle | null>(null);
  const [fileErrors, setFileErrors] = useState<
    Partial<Record<Angle, JournalPhotoValidationMessage>>
  >({});

  const selectedPhotos = useMemo<PhotoMap>(() => photos ?? {}, [photos]);
  const removedAngles = useMemo(
    () => new Set(removedPhotoAngles),
    [removedPhotoAngles],
  );
  const existingByAngle = useMemo(() => {
    const map = new Map<Angle, JournalEntryPhoto>();
    for (const existing of existingPhotos ?? []) {
      if (!removedAngles.has(existing.angle)) {
        map.set(existing.angle, existing);
      }
    }
    return map;
  }, [existingPhotos, removedAngles]);

  const clearPreview = (angle: Angle) => {
    const existingPreview = previewUrlsRef.current[angle];
    if (existingPreview) {
      URL.revokeObjectURL(existingPreview);
      delete previewUrlsRef.current[angle];
      setPreviewUrls((current) => {
        const next = { ...current };
        delete next[angle];
        return next;
      });
    }
  };

  const handleFile = (angle: Angle, file: File | null) => {
    if (disabled) {
      return;
    }

    if (file) {
      const validationError = validateJournalPhotoFile(file);
      if (validationError) {
        setFileErrors((current) => ({ ...current, [angle]: validationError }));
        const input = inputRefs.current[angle];
        if (input) input.value = "";
        if (cropAngle === angle) setCropAngle(null);
        return;
      }
      clearPreview(angle);
      const nextPreviewUrl = URL.createObjectURL(file);
      previewUrlsRef.current[angle] = nextPreviewUrl;
      setPreviewUrls((current) => ({ ...current, [angle]: nextPreviewUrl }));
      setFileErrors((current) => {
        const next = { ...current };
        delete next[angle];
        return next;
      });
    } else {
      clearPreview(angle);
      const input = inputRefs.current[angle];
      if (input) input.value = "";
      if (cropAngle === angle) setCropAngle(null);
      setFileErrors((current) => {
        const next = { ...current };
        delete next[angle];
        return next;
      });
    }
    onPhotoAngleChange?.(angle, file);
  };

  useEffect(() => {
    return () => {
      for (const previewUrl of Object.values(previewUrlsRef.current)) {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
      }
      previewUrlsRef.current = {};
    };
  }, []);

  useEffect(() => {
    const clearedAngles = PHOTO_ANGLES.filter(
      (angle) => !selectedPhotos[angle] && previewUrlsRef.current[angle],
    );
    if (clearedAngles.length === 0) {
      return;
    }
    for (const angle of PHOTO_ANGLES) {
      const existingPreview = previewUrlsRef.current[angle];
      if (!selectedPhotos[angle] && existingPreview) {
        URL.revokeObjectURL(existingPreview);
        delete previewUrlsRef.current[angle];
      }
    }
    setPreviewUrls((current) => {
      const next = { ...current };
      for (const angle of clearedAngles) {
        delete next[angle];
      }
      return next;
    });
  }, [selectedPhotos]);

  const selectedFiles = Object.values(selectedPhotos).filter(
    (item): item is File => item instanceof File,
  );
  const activeCropPhoto = cropAngle ? selectedPhotos[cropAngle] : null;
  const activeCropPreview = cropAngle ? previewUrls[cropAngle] : null;

  return (
    <div>
      <label className="block text-xs font-semibold">
        {t("photoLabel")}
      </label>
      <p className="mb-3 mt-1 text-xs text-muted">{t("noWebcam")}</p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1.2fr_1fr] sm:items-center">
        {UPLOAD_SLOT_ANGLES.map((angle) => {
          const selectedPhoto = selectedPhotos[angle] ?? null;
          const previewUrl = previewUrls[angle] ?? null;
          const existingPhoto = existingByAngle.get(angle);
          const isFront = angle === FRONT_PHOTO_ANGLE;
          const label = angleTitle(angle, t);
          const alt =
            isFront && existingPhotoAlt
              ? existingPhotoAlt
              : t("angleAlt", { angle: label });

          return (
            <JournalPhotoAngleCard
              key={angle}
              angle={angle}
              disabled={disabled}
              selectedPhoto={selectedPhoto}
              previewUrl={previewUrl}
              existingPhoto={existingPhoto}
              alt={alt}
              fileError={fileErrors[angle]}
              setInputRef={(node) => {
                inputRefs.current[angle] = node;
              }}
              onFileSelected={(file) => handleFile(angle, file)}
              onChoosePhoto={() => {
                if (disabled) {
                  return;
                }

                const input = inputRefs.current[angle];
                if (input) {
                  input.value = "";
                  input.click();
                }
              }}
              onCrop={() => {
                if (!disabled) setCropAngle(angle);
              }}
              onRemove={() => {
                if (selectedPhoto) {
                  handleFile(angle, null);
                } else {
                  onRemoveExistingAngle?.(angle);
                }
              }}
            />
          );
        })}
      </div>

      {selectedFiles.length > 0 ? (
        <label className="mt-4 flex items-center gap-2 rounded-xl border border-[color:var(--border-strong)] bg-accent-soft/30 p-3 text-sm leading-relaxed">
          <Checkbox
            disabled={disabled}
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
          disabled={disabled}
          onCheckedChange={(checked) => onPreRoutineChange(checked === true)}
        />
        <span>{t("preRoutine")}</span>
      </label>

      {cropAngle && activeCropPhoto && activeCropPreview ? (
        <PhotoCropDialog
          open={cropAngle !== null}
          photo={activeCropPhoto}
          previewUrl={activeCropPreview}
          onOpenChange={(open) => {
            if (!open) setCropAngle(null);
          }}
          onApply={(cropped) => handleFile(cropAngle, cropped)}
        />
      ) : null}
    </div>
  );
}
