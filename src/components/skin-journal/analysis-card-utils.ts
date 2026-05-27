import { useTranslations } from "next-intl";
import {
  PHOTO_ANGLES,
  type Angle,
  type AnalysisObservations,
  type PhotoAnalysisConcernGuidance,
  type PhotoAnalysisTextRef,
} from "@/types/skin-journal";

export type AnalysisTranslation = ReturnType<typeof useTranslations>;

const ANALYSIS_PREFIX = "journal.analysis.";

/**
 * Severity scale used by both the Detected concerns chips and the
 * face-map zones. Mild and moderate both sit in the warning family
 * (so detecting anything reads as "worth attention"), with severe
 * escalating to danger. Visual differentiation between mild and
 * moderate is handled by fill saturation, not hue — see
 * `SEVERITY_TOKEN` in `face-zone-overlay.tsx` and the
 * `selected={severity !== "mild"}` flag on the Detected concerns
 * chip in `analysis-quality-section.tsx`.
 */
export const SEVERITY_VARIANT: Record<
  "mild" | "moderate" | "severe",
  "warning" | "danger"
> = {
  mild: "warning",
  moderate: "warning",
  severe: "danger",
};

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

export function translateKey(
  t: AnalysisTranslation,
  key: string,
  values?: Record<string, string | number>,
): string {
  try {
    return t(analysisMessageKey(key), toTranslationValues(values));
  } catch {
    return key;
  }
}

export function translateTextRef(
  t: AnalysisTranslation,
  ref: PhotoAnalysisTextRef,
): string {
  return translateKey(t, ref.key, ref.values);
}

export interface DisplayConcernGuidance extends PhotoAnalysisConcernGuidance {
  hide_repeated_track?: boolean;
}

export function dedupeRepeatedGuidanceItems(
  guidance: PhotoAnalysisConcernGuidance[],
): DisplayConcernGuidance[] {
  if (guidance.length < 2) {
    return guidance;
  }

  const contextKeyCounts = new Map<string, number>();
  const actionKeyCounts = new Map<string, number>();
  const avoidKeyCounts = new Map<string, number>();
  const trackKeyCounts = new Map<string, number>();
  for (const card of guidance) {
    countTextRefs(contextKeyCounts, card.possible_factor_keys);
    countTextRefs(actionKeyCounts, card.action_keys);
    countTextRefs(avoidKeyCounts, card.avoid_keys);
    trackKeyCounts.set(
      card.track_key.key,
      (trackKeyCounts.get(card.track_key.key) ?? 0) + 1,
    );
  }

  const shownContextKeys = new Set<string>();
  const shownActionKeys = new Set<string>();
  const shownAvoidKeys = new Set<string>();
  const shownTrackKeys = new Set<string>();
  return guidance.map((card) => {
    const displayCard: DisplayConcernGuidance = {
      ...card,
      possible_factor_keys: keepFirstRepeatedTextRefs(
        card.possible_factor_keys,
        contextKeyCounts,
        shownContextKeys,
      ),
      action_keys: keepFirstRepeatedTextRefs(
        card.action_keys,
        actionKeyCounts,
        shownActionKeys,
      ),
      avoid_keys: keepFirstRepeatedTextRefs(
        card.avoid_keys,
        avoidKeyCounts,
        shownAvoidKeys,
      ),
    };
    if (
      (trackKeyCounts.get(card.track_key.key) ?? 0) > 1 &&
      shownTrackKeys.has(card.track_key.key)
    ) {
      displayCard.hide_repeated_track = true;
    }
    shownTrackKeys.add(card.track_key.key);
    return displayCard;
  });
}

function countTextRefs(
  counts: Map<string, number>,
  refs: PhotoAnalysisTextRef[],
): void {
  for (const ref of refs) {
    counts.set(ref.key, (counts.get(ref.key) ?? 0) + 1);
  }
}

function keepFirstRepeatedTextRefs(
  refs: PhotoAnalysisTextRef[],
  counts: Map<string, number>,
  shownKeys: Set<string>,
): PhotoAnalysisTextRef[] {
  return refs.filter((ref) => {
    if ((counts.get(ref.key) ?? 0) <= 1) {
      return true;
    }
    if (shownKeys.has(ref.key)) {
      return false;
    }
    shownKeys.add(ref.key);
    return true;
  });
}

function humanizeLocation(location: string): string {
  return location.replace(/_/g, " ");
}

export function formatLocations(locations: string[]): string {
  return locations.length > 0
    ? locations.map(humanizeLocation).join(", ")
    : "";
}

export function fallbackSummaryKey(
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

export function sortPerAngleQuality(
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
