"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { translateLocationLabel } from "./analysis-card-utils";

/* ===========================================================
 * Face zone overlay
 *
 * Anatomical diagram that maps detected concerns onto a face
 * silhouette. The same severity scale used by the chip variants
 * drives the zone fill, so a "moderate" chip and a "moderate"
 * zone read with the same color.
 *
 * Visual choices:
 *   - Background is `bg-surface-muted` (theme-aware) instead of
 *     a hardcoded skin-tone gradient, so the diagram doesn't
 *     pick a single skin color and works in dark mode.
 *   - The face oval is drawn with `border-border-strong` so it
 *     reads as an illustration, not as a photo.
 *   - Severity tones are CSS variables (`--warning`, `--danger`),
 *     not RGBA hex, so they track theme changes.
 *   - A small legend under the diagram makes the severity color
 *     scale self-explanatory.
 *   - When there are no concerns, the empty state is a friendly
 *     line instead of a blank face.
 * ========================================================= */

interface DetectedConcern {
  concern: string;
  severity: "mild" | "moderate" | "severe";
  locations: string[];
}

interface FaceZoneOverlayProps {
  concerns?: DetectedConcern[];
  className?: string;
}

const ZONE_POSITIONS: Record<
  string,
  { top: string; left: string; width: string; height: string }
> = {
  forehead: { top: "16%", left: "30%", width: "40%", height: "12%" },
  left_cheek: { top: "44%", left: "20%", width: "20%", height: "16%" },
  right_cheek: { top: "44%", left: "60%", width: "20%", height: "16%" },
  chin: { top: "70%", left: "38%", width: "24%", height: "12%" },
  nose: { top: "40%", left: "44%", width: "12%", height: "20%" },
  under_eyes: { top: "36%", left: "30%", width: "40%", height: "8%" },
  jawline: { top: "78%", left: "20%", width: "60%", height: "8%" },
  upper_lip: { top: "62%", left: "40%", width: "20%", height: "6%" },
  temples: { top: "26%", left: "16%", width: "12%", height: "10%" },
  neck: { top: "88%", left: "30%", width: "40%", height: "8%" },
};

const SEVERITY_FILL: Record<DetectedConcern["severity"], string> = {
  mild: "color-mix(in srgb, var(--warning) 52%, transparent)",
  moderate: "color-mix(in srgb, var(--danger) 48%, transparent)",
  severe: "color-mix(in srgb, var(--danger) 68%, transparent)",
};

const LEGEND_SEVERITIES: DetectedConcern["severity"][] = [
  "mild",
  "moderate",
  "severe",
];

export function FaceZoneOverlay({ concerns, className }: FaceZoneOverlayProps) {
  const t = useTranslations("journal.analysis.faceMap");
  const tLocations = useTranslations("journal.insightsTab.locations");
  const tSeverity = useTranslations("journal.severity");
  const tConcerns = useTranslations("journal.concerns");
  const detected = concerns ?? [];
  const mappedZones = detected.flatMap((concern) =>
    concern.locations.flatMap((location, locationIndex) => {
      const position = ZONE_POSITIONS[location];
      return position
        ? [{ concern, location, locationIndex, position }]
        : [];
    }),
  );
  const statusMessage =
    detected.length === 0
      ? t("empty")
      : mappedZones.length === 0
        ? t("noMappedZones")
        : null;

  return (
    <figure className={cn("flex flex-col gap-3", className)}>
      <figcaption className="space-y-0.5">
        <p className="text-sm font-semibold text-foreground">{t("title")}</p>
        <p className="text-xs leading-relaxed text-muted">{t("subtitle")}</p>
      </figcaption>

      <div
        role="img"
        aria-label={
          mappedZones.length > 0 ? t("title") : statusMessage ?? t("title")
        }
        className="relative aspect-[1/1.1] overflow-hidden rounded-2xl border border-border bg-surface-muted"
      >
        {/* Face oval — purely illustrative, sits inside the
            diagram so positions can be mapped to it. */}
        <div
          aria-hidden
          className="absolute border border-border-strong"
          style={{
            inset: "12% 22% 6% 22%",
            borderRadius: "50% / 60%",
          }}
        />
        {mappedZones.map(({ concern, location, locationIndex, position }) => {
          return (
            <span
              key={`${concern.concern}-${location}-${locationIndex}`}
              className="absolute rounded-full border-2 border-white/85"
              style={{
                top: position.top,
                left: position.left,
                width: position.width,
                height: position.height,
                background: SEVERITY_FILL[concern.severity],
              }}
              aria-label={t("zoneAria", {
                concern: safeConcernLabel(tConcerns, concern.concern),
                location: translateLocationLabel(tLocations, location),
                severity: tSeverity(concern.severity),
              })}
            />
          );
        })}

        {statusMessage ? (
          <div className="absolute inset-x-3 bottom-3 rounded-xl bg-surface/85 px-3 py-2 text-center text-xs font-medium text-muted backdrop-blur-sm">
            {statusMessage}
          </div>
        ) : null}
      </div>

      {mappedZones.length > 0 ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted">
          <span className="font-semibold text-foreground">
            {t("legendLabel")}
          </span>
          {LEGEND_SEVERITIES.map((severity) => (
            <span key={severity} className="inline-flex items-center gap-1.5">
              <span
                aria-hidden
                className="inline-block h-2.5 w-2.5 rounded-full border border-white/85"
                style={{ background: SEVERITY_FILL[severity] }}
              />
              {tSeverity(severity)}
            </span>
          ))}
        </div>
      ) : null}
    </figure>
  );
}

/**
 * `useTranslations` throws on missing keys, but the concern set
 * is open-ended (the AI can return new tags). Fall back to the
 * raw concern name (humanised) instead of crashing.
 */
function safeConcernLabel(
  tConcerns: ReturnType<typeof useTranslations>,
  concern: string,
): string {
  try {
    return tConcerns(concern);
  } catch {
    return concern.replace(/_/g, " ");
  }
}
