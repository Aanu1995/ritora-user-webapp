"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle, Sparkles } from "lucide-react";
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
  const tSafetyReasons = useTranslations("journal.analysis.safetyReasons");
  const tSeverity = useTranslations("journal.severity");

  const lighting = observations.image_quality.lighting_quality;
  const framing = observations.image_quality.framing_quality;
  const needsRetake =
    observations.image_quality.needs_retake === true ||
    observations.image_quality.face_detected === false;
  const safetyReasons = observations.safety_flags?.reasons ?? [];
  const hasSafetyEscalation =
    observations.should_flag_for_doctor ||
    observations.safety_flags?.urgent_review_recommended === true ||
    observations.safety_flags?.doctor_follow_up_recommended === true ||
    safetyReasons.length > 0;

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
        {observations.user_visible_message ?? observations.overall_assessment}
      </p>

      {needsRetake ? (
        <div className="mb-3 rounded-xl border border-[color:var(--warning-border)] bg-warning-soft p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--warning)]" />
            <div>
              <p className="text-sm font-semibold">{t("retakeTitle")}</p>
              <p className="mt-0.5 text-sm text-muted">{t("retakeBody")}</p>
            </div>
          </div>
        </div>
      ) : null}

      {hasSafetyEscalation ? (
        <div className="mb-3 rounded-xl border border-danger/30 bg-danger/10 p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
            <div>
              <p className="text-sm font-semibold text-danger">
                {t("safetyTitle")}
              </p>
              <p className="mt-0.5 text-sm text-muted">{t("safetyBody")}</p>
              {safetyReasons.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {safetyReasons.map((reason) => (
                    <Chip key={reason} variant="danger" selected>
                      {tSafetyReasons(reason)}
                    </Chip>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

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
