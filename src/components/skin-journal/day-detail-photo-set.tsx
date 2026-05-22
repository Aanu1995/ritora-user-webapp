"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PhotoFrame } from "@/components/skin-journal/photo-frame";
import { PhotoLightbox } from "@/components/skin-journal/photo-lightbox";
import {
  FRONT_PHOTO_ANGLE,
  type Angle,
  type JournalEntry,
  type JournalEntryPhoto,
} from "@/types/skin-journal";

interface DayDetailPhotoSetProps {
  entry: JournalEntry;
  date: string;
}

const ANGLE_DISPLAY_ORDER: Angle[] = [
  "left_profile",
  FRONT_PHOTO_ANGLE,
  "right_profile",
];

function entryPhotosForDisplay(entry: JournalEntry): JournalEntryPhoto[] {
  if (entry.photos?.length) {
    return entry.photos;
  }
  return entry.photo_url
    ? [
        {
          angle: FRONT_PHOTO_ANGLE,
          photo_url: entry.photo_url,
          width: entry.photo_width,
          height: entry.photo_height,
        },
      ]
    : [];
}

function photoByAngle(photos: JournalEntryPhoto[]): Map<Angle, JournalEntryPhoto> {
  return new Map(photos.map((photo) => [photo.angle, photo]));
}

export function DayDetailPhotoSet({ entry, date }: DayDetailPhotoSetProps) {
  const t = useTranslations("journal.dayDetail");
  const [lightboxAngle, setLightboxAngle] = useState<Angle | null>(null);
  const displayPhotos = entryPhotosForDisplay(entry);
  const displayPhotoByAngle = photoByAngle(displayPhotos);
  const lightboxPhoto = lightboxAngle
    ? displayPhotoByAngle.get(lightboxAngle) ?? null
    : null;

  if (displayPhotos.length === 0) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-3 px-4 py-6 sm:grid-cols-[1fr_1.2fr_1fr] sm:items-center sm:px-6 sm:py-8">
        {ANGLE_DISPLAY_ORDER.map((angle) => {
          const photo = displayPhotoByAngle.get(angle);
          return (
            <div key={angle}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-semibold">{t(`angles.${angle}`)}</span>
                <span className="text-muted">
                  {photo ? t("captured") : t("notCaptured")}
                </span>
              </div>
              {photo ? (
                <button
                  type="button"
                  onClick={() => setLightboxAngle(angle)}
                  className="block w-full overflow-hidden rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                  aria-label={t("openPhoto")}
                >
                  <PhotoFrame
                    url={photo.photo_url}
                    alt={t("photoAngleAlt", {
                      angle: t(`angles.${angle}`),
                      date,
                    })}
                    aspect="square"
                  />
                </button>
              ) : (
                <div className="grid aspect-square place-items-center rounded-2xl border border-dashed border-border bg-surface-muted p-3 text-center text-xs text-balance text-muted">
                  {t("optionalAngleMissing")}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-2 px-4 pb-6 sm:px-6 sm:pb-8">
        <p className="text-xs text-muted">
          {entry.is_pre_routine ? t("preRoutineTag") : t("photoSavedTag")}
        </p>
        {(entry.angle_count ?? 0) > 1 ? (
          <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-strong">
            {t("angleCount", { count: entry.angle_count ?? 1 })}
          </span>
        ) : null}
      </div>

      <PhotoLightbox
        url={lightboxPhoto?.photo_url ?? null}
        alt={
          lightboxAngle
            ? t("photoAngleAlt", {
                angle: t(`angles.${lightboxAngle}`),
                date,
              })
            : ""
        }
        title={lightboxAngle ? t(`angles.${lightboxAngle}`) : undefined}
        open={lightboxAngle !== null && lightboxPhoto !== null}
        onOpenChange={(next) => {
          if (!next) setLightboxAngle(null);
        }}
      />
    </div>
  );
}
