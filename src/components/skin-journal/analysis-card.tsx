"use client";

import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import type { AnalysisObservations } from "@/types/skin-journal";
import { Chip } from "./chip";
import { FaceZoneOverlay } from "./face-zone-overlay";
import { safeDynamicTranslation } from "./safe-translation";

interface AnalysisCardProps {
  observations: AnalysisObservations;
}

const SEVERITY_VARIANT: Record<
  "mild" | "moderate" | "severe",
  "warning" | "danger" | "default"
> = {
  mild: "warning",
  moderate: "warning",
  severe: "danger",
};

export function AnalysisCard({ observations }: AnalysisCardProps) {
  const t = useTranslations("journal.analysis");
  const tConcerns = useTranslations("journal.concerns");
  const tQuality = useTranslations("journal.analysis");
  const tSeverity = useTranslations("journal.severity");

  const lighting = observations.image_quality.lighting_quality;
  const framing = observations.image_quality.framing_quality;

  return (
    <div
      className="rounded-2xl border p-4 sm:p-5"
      style={{
        borderColor: "var(--ai-border)",
        background:
          "linear-gradient(180deg, var(--ai-soft), transparent 50%)",
      }}
    >
      <div className="mb-2 flex items-start justify-between gap-2.5">
        <div>
          <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--ai-soft)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[color:var(--ai-fg)]">
            <Sparkles className="h-3 w-3" />
            {t("modelBadge", { model: observations.model_version })}
          </span>
          <p className="mt-1.5 text-sm font-semibold">{t("title")}</p>
        </div>
        {observations.detected_concerns?.length > 0 && (
          <Chip variant="accent" selected>
            {t("confidence", {
              value: (
                observations.detected_concerns[0]?.confidence ?? 0.7
              ).toFixed(2),
            })}
          </Chip>
        )}
      </div>

      <p className="mb-3 text-sm leading-relaxed text-muted">
        {observations.overall_assessment}
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FaceZoneOverlay
          concerns={observations.detected_concerns}
          className="max-w-[260px]"
        />

        <div>
          <p className="mb-1.5 text-sm text-muted">{t("concernsLabel")}</p>
          <div className="flex flex-wrap gap-1.5">
            {observations.detected_concerns.map((c, idx) => (
              <Chip
                key={`${c.concern}-${idx}`}
                variant={SEVERITY_VARIANT[c.severity]}
                selected
              >
                {safeDynamicTranslation(
                  tConcerns,
                  c.concern,
                  c.concern.replace(/_/g, " "),
                )}
                {" · "}
                {tSeverity(c.severity)}
                {c.locations.length > 0 ? ` · ${c.locations.join(", ")}` : ""}
              </Chip>
            ))}
            {observations.detected_concerns.length === 0 ? (
              <Chip>{tSeverity("none")}</Chip>
            ) : null}
          </div>

          <p className="mb-1.5 mt-3 text-sm text-muted">
            {t("imageQualityLabel")}
          </p>
          <div className="flex flex-wrap gap-1.5">
            <Chip selected={lighting === "good" || lighting === "excellent"}>
              {lighting === "good" || lighting === "excellent"
                ? tQuality("lightingGood")
                : lighting === "fair"
                  ? tQuality("lightingFair")
                  : tQuality("lightingPoor")}
            </Chip>
            <Chip selected={framing === "good" || framing === "excellent"}>
              {framing === "good" || framing === "excellent"
                ? tQuality("framingGood")
                : framing === "fair"
                  ? tQuality("framingFair")
                  : tQuality("framingPoor")}
            </Chip>
            <Chip selected={!observations.image_quality.blur_detected}>
              {observations.image_quality.blur_detected
                ? tQuality("blurry")
                : tQuality("sharp")}
            </Chip>
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-muted">
        <strong className="text-foreground">{t("disclaimer").split(".")[0]}.</strong>{" "}
        {t("disclaimer").split(".").slice(1).join(".").trim()}
      </p>
    </div>
  );
}
