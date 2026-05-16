"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle, ExternalLink, Sparkles } from "lucide-react";
import {
  PHOTO_ANGLES,
  type Angle,
  type AnalysisObservations,
  type PhotoAnalysisInterpretation,
  type PhotoAnalysisSourceCitation,
} from "@/types/skin-journal";
import { Chip } from "./chip";
import { FaceZoneOverlay } from "./face-zone-overlay";
import { safeDynamicTranslation } from "./safe-translation";

interface AnalysisCardProps {
  observations: AnalysisObservations;
  interpretation?: PhotoAnalysisInterpretation | null;
}

const SEVERITY_VARIANT: Record<
  "mild" | "moderate" | "severe",
  "warning" | "danger" | "default"
> = {
  mild: "warning",
  moderate: "warning",
  severe: "danger",
};

const ANALYSIS_PREFIX = "journal.analysis.";

function analysisMessageKey(key: string): string {
  return key.startsWith(ANALYSIS_PREFIX)
    ? key.slice(ANALYSIS_PREFIX.length)
    : key;
}

function toTranslationValues(
  values: Record<string, string | number> | undefined,
): Record<string, string | number> {
  return values ?? {};
}

function translateKey(
  t: ReturnType<typeof useTranslations>,
  key: string,
  values?: Record<string, string | number>,
): string {
  try {
    return t(analysisMessageKey(key), toTranslationValues(values));
  } catch {
    return key;
  }
}

function fallbackSummaryKey(
  observations: AnalysisObservations,
  needsRetake: boolean,
  hasSafetyEscalation: boolean,
): string {
  if (needsRetake) {
    return "journal.analysis.interpretation.retakeNeeded.summary";
  }
  if (
    observations.safety_flags?.urgent_review_recommended === true ||
    observations.safety_flags?.reasons.includes("possible_swelling") ||
    observations.safety_flags?.reasons.includes("hive_like_appearance")
  ) {
    return "journal.analysis.interpretation.urgentReview.summary";
  }
  if (hasSafetyEscalation) {
    return "journal.analysis.interpretation.professionalReview.summary";
  }
  if (
    observations.barrier_signs.barrier_compromise ||
    observations.barrier_signs.indicators.length > 0 ||
    (observations.reaction_signals.reaction_detected &&
      observations.reaction_signals.reaction_severity !== "mild" &&
      observations.reaction_signals.reaction_severity !== "none")
  ) {
    return "journal.analysis.interpretation.barrierSupport.summary";
  }
  if (
    observations.detected_concerns.some(
      (concern) =>
        concern.concern === "acne" &&
        concern.change_from_previous !== "unknown" &&
        concern.change_from_previous !== "not_comparable",
    )
  ) {
    return "journal.analysis.interpretation.acneProgressTiming.summary";
  }
  if (
    observations.detected_concerns.some(
      (concern) =>
        (concern.concern === "hyperpigmentation" ||
          concern.concern === "uneven_tone") &&
        concern.confidence >= 0.55,
    )
  ) {
    return "journal.analysis.interpretation.hyperpigmentationTracking.summary";
  }
  return "journal.analysis.interpretation.stableBaseline.summary";
}

function AnalysisSourceLink({
  source,
}: {
  source: PhotoAnalysisSourceCitation;
}) {
  const t = useTranslations("journal.analysis");
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start justify-between gap-3 rounded-xl border border-[color:var(--border-strong)] bg-accent-soft/30 p-3 text-sm transition hover:border-accent/50"
    >
      <span>
        <span className="block font-semibold text-foreground">
          {source.organization}
        </span>
        <span className="mt-0.5 block text-muted">
          {translateKey(t, source.title_key)}
        </span>
        <span className="mt-1 block text-xs text-muted">
          {translateKey(t, source.summary_key)}
        </span>
        <span className="mt-1 block text-xs text-muted">
          {t("sources.lastVerified", { date: source.last_verified })}
        </span>
      </span>
      <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
    </a>
  );
}

function sortPerAngleQuality(
  rows: NonNullable<AnalysisObservations["per_angle_quality"]>,
) {
  const order = new Map<Angle, number>(
    PHOTO_ANGLES.map((angle, index) => [angle, index]),
  );
  const uniqueRows = new Map<Angle, (typeof rows)[number]>();
  for (const row of rows) {
    if (!uniqueRows.has(row.angle)) {
      uniqueRows.set(row.angle, row);
    }
  }
  return [...uniqueRows.values()].sort(
    (a, b) => (order.get(a.angle) ?? 99) - (order.get(b.angle) ?? 99),
  );
}

export function AnalysisCard({
  observations,
  interpretation,
}: AnalysisCardProps) {
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
  const summary = interpretation
    ? translateKey(t, interpretation.summary_key, interpretation.summary_values)
    : translateKey(t, fallbackSummaryKey(observations, needsRetake, hasSafetyEscalation));
  const perAngleQuality = observations.per_angle_quality
    ? sortPerAngleQuality(observations.per_angle_quality)
    : [];

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

      <div className="mb-3 space-y-2">
        <p className="text-sm leading-relaxed text-muted">{summary}</p>
        {interpretation?.guidance_keys.map((key) => (
          <p key={key} className="text-sm leading-relaxed text-muted">
            {translateKey(t, key)}
          </p>
        ))}
      </div>

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

          {perAngleQuality.length > 0 ? (
            <div className="mt-3">
              <p className="mb-1.5 text-sm text-muted">
                {t("perAngleQualityLabel")}
              </p>
              <div className="space-y-2">
                {perAngleQuality.map((quality) => {
                  const hasIssue =
                    !quality.face_detected ||
                    quality.blur_detected ||
                    quality.needs_retake === true ||
                    quality.lighting_quality === "poor" ||
                    quality.framing_quality === "poor";
                  return (
                    <div
                      key={quality.angle}
                      className="rounded-xl border border-border bg-surface/70 p-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold">
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
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {interpretation?.sources.length ? (
        <div className="mt-3 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            {t("sources.label")}
          </p>
          {interpretation.sources.map((source) => (
            <AnalysisSourceLink key={source.id} source={source} />
          ))}
        </div>
      ) : null}

      {interpretation?.caveat_keys.length ? (
        <div className="mt-3 space-y-1">
          {interpretation.caveat_keys.map((key) => (
            <p key={key} className="text-xs leading-relaxed text-muted">
              {translateKey(t, key)}
            </p>
          ))}
        </div>
      ) : null}

      <p className="mt-3 text-xs leading-relaxed text-muted">
        <strong className="text-foreground">{t("disclaimer").split(".")[0]}.</strong>{" "}
        {t("disclaimer").split(".").slice(1).join(".").trim()}
      </p>
    </div>
  );
}
