"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { type AnalysisObservations } from "@/types/skin-journal";
import { Chip } from "./chip";
import { FaceZoneOverlay } from "./face-zone-overlay";
import { safeDynamicTranslation } from "./safe-translation";
import {
  SEVERITY_VARIANT,
  sortPerAngleQuality,
  translateLocationLabel,
} from "./analysis-card-utils";

type AnalysisQualitySectionProps = {
  observations: AnalysisObservations;
};

/* ===========================================================
 * Image-quality + detected-concerns section
 *
 * Layout splits into two horizontal rows on sm+:
 *
 *   Row 1: face map (left) + detected concerns (right)
 *          — the variable-length concerns list gets the full
 *            vertical room of the right column.
 *
 *   Row 2: image quality (left) + angle quality (right)
 *          — always side-by-side, regardless of how long the
 *            concerns list is, so when there are only one or
 *            two concerns the photo-signal blocks still sit
 *            compactly in one row instead of leaving dead
 *            vertical space below the face map.
 *
 * Severity colors in chips and per-angle status chips match the
 * face-map zone fills so the user can link "what" and "where"
 * by color alone.
 * ========================================================= */

export function AnalysisQualitySection({
  observations,
}: AnalysisQualitySectionProps) {
  const t = useTranslations("journal.analysis");
  const tConcerns = useTranslations("journal.concerns");
  const tLocations = useTranslations("journal.insightsTab.locations");
  const tSeverity = useTranslations("journal.severity");
  const lighting = observations.image_quality.lighting_quality;
  const framing = observations.image_quality.framing_quality;
  const perAngleQuality = observations.per_angle_quality
    ? sortPerAngleQuality(observations.per_angle_quality)
    : [];

  return (
    <div className="space-y-5 rounded-2xl border border-border bg-surface-muted/40 p-4 sm:p-5">
      {/* Row 1 — face map + detected concerns */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-[minmax(0,260px)_1fr]">
        <FaceZoneOverlay
          concerns={observations.detected_concerns}
          className="w-full"
        />

        <SubGroup label={t("concernsLabel")}>
          {observations.detected_concerns.length === 0 ? (
            <p className="rounded-xl border border-border bg-surface p-3 text-sm text-muted">
              {tSeverity("none")}
            </p>
          ) : (
            <ul className="space-y-2">
              {observations.detected_concerns.map((concern, index) => (
                <li
                  key={`${concern.concern}-${index}`}
                  className="rounded-xl border border-border bg-surface p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      {safeDynamicTranslation(
                        tConcerns,
                        concern.concern,
                        concern.concern.replace(/_/g, " "),
                      )}
                    </p>
                    <Chip
                      variant={SEVERITY_VARIANT[concern.severity]}
                      selected
                      className="px-2 py-0.5"
                    >
                      {tSeverity(concern.severity)}
                    </Chip>
                  </div>
                  {concern.locations.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {concern.locations.map((location, locationIndex) => (
                        <span
                          key={`${location}-${locationIndex}`}
                          className="inline-flex items-center rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] font-medium text-foreground"
                        >
                          {translateLocationLabel(tLocations, location)}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </SubGroup>
      </div>

      {/* Row 2 — angle quality (left) + image quality (right) side
          by side, stacking on mobile. Angle quality leads because
          the per-angle breakdown is the richer, more useful detail
          when it's available; image quality stays as the summary
          column on the right. When per-angle data is missing, the
          image-quality block stretches to full width. */}
      <div
        className={
          perAngleQuality.length > 0
            ? "grid grid-cols-1 gap-5 sm:grid-cols-2"
            : ""
        }
      >
        {perAngleQuality.length > 0 ? (
          <SubGroup label={t("perAngleQualityLabel")}>
            <ul className="space-y-1.5">
              {perAngleQuality.map((quality) => {
                const hasIssue =
                  !quality.face_detected ||
                  quality.blur_detected ||
                  quality.needs_retake === true ||
                  quality.lighting_quality === "poor" ||
                  quality.framing_quality === "poor";
                return (
                  <li
                    key={quality.angle}
                    className="rounded-lg border border-border bg-surface px-2.5 py-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">
                        {t(`angles.${quality.angle}`)}
                      </p>
                      <Chip
                        variant={hasIssue ? "warning" : "accent"}
                        selected
                        className="px-2 py-0.5"
                      >
                        {hasIssue ? t("qualityReview") : t("qualityUsable")}
                      </Chip>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted">
                      {t("perAngleQualityRow", {
                        lighting: t(`quality.${quality.lighting_quality}`),
                        framing: t(`quality.${quality.framing_quality}`),
                        sharpness: quality.blur_detected
                          ? t("blurry")
                          : t("sharp"),
                      })}
                    </p>
                  </li>
                );
              })}
            </ul>
          </SubGroup>
        ) : null}

        <SubGroup label={t("imageQualityLabel")}>
          <div className="flex flex-wrap gap-1.5">
            <Chip selected={lighting === "good" || lighting === "excellent"}>
              {lighting === "good" || lighting === "excellent"
                ? t("lightingGood")
                : lighting === "fair"
                  ? t("lightingFair")
                  : t("lightingPoor")}
            </Chip>
            <Chip selected={framing === "good" || framing === "excellent"}>
              {framing === "good" || framing === "excellent"
                ? t("framingGood")
                : framing === "fair"
                  ? t("framingFair")
                  : t("framingPoor")}
            </Chip>
            <Chip selected={!observations.image_quality.blur_detected}>
              {observations.image_quality.blur_detected
                ? t("blurry")
                : t("sharp")}
            </Chip>
          </div>
        </SubGroup>
      </div>
    </div>
  );
}

function SubGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-foreground">{label}</p>
      {children}
    </div>
  );
}
