import {
  Clock,
  Sparkles,
  Star,
  TimerReset,
  TrendingUp,
  User,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { safeDynamicTranslation } from "@/components/skin-journal/safe-translation";
import type { CommunityReview } from "@/types/community";
import {
  humaniseCommunityTag,
  labelFromOptions,
  useCommunityTranslatedOptions,
} from "./community-i18n-options";
import { Badge, Chip } from "./community-shared";

/* ===========================================================
 * Review evidence summary
 *
 * Used to dump raw API values into one giant flex-wrap of
 * identical-looking chips:
 *   `4-weeks · few-times-week`, `AM routine`, `Improved`,
 *   `Repurchase: Yes`, `normal`, `dry_air`, `acne`, ...
 *
 * Issues fixed in this pass:
 *   - All raw strings (`4-weeks`, `dry_air`, `dark_marks`) now
 *     route through `labelFromOptions` or `humaniseCommunityTag`
 *     so users see "4 weeks", "Dry air", "Dark marks" instead
 *     of slugs.
 *   - The single flat chip pile is split into three labelled
 *     groups: How they used it / What changed / About this
 *     reviewer. Each group has a small sentence-case header
 *     with a tone-coded icon, so the eye can tell usage from
 *     outcome from reviewer-profile at a glance.
 *   - The 3-rating metric grid sits at the top unchanged
 *     (it already worked).
 * ========================================================= */

export function ReviewEvidenceSummary({ review }: { review: CommunityReview }) {
  const t = useTranslations("community.reviewEvidence");
  /* `skinProfile.options` is the canonical translation table for
   * every raw facet slug the backend exposes on a review's
   * `safeFacets` (skinType, sensitivityLevel, climateBucket,
   * skinToneRange, concernTags). Previously these chips were
   * just `humaniseCommunityTag(value)`, which only replaced
   * underscores with spaces and Title-Cased every word —
   * untranslated and a bit ugly ("Dry Air" instead of "Dry
   * air", and the same English in Swedish/Spanish locales).
   * `safeDynamicTranslation` falls back to the humanised form
   * if a slug is missing from the locale's options block, so a
   * new backend value never crashes the card. */
  const tFacet = useTranslations("skinProfile.options");
  const translateFacet = (value: string) =>
    safeDynamicTranslation(tFacet, value, humaniseCommunityTag(value));
  const options = useCommunityTranslatedOptions();

  const usageDuration =
    labelFromOptions(options.reviewUsageDurations, review.usageDuration) ??
    humaniseCommunityTag(review.usageDuration);
  const frequency =
    labelFromOptions(options.reviewFrequencies, review.frequency) ??
    humaniseCommunityTag(review.frequency);
  const slot = labelFromOptions(options.reviewRoutineSlots, review.routineSlot);
  const response = review.skinResponse
    ? labelFromOptions(options.reviewSkinResponses, review.skinResponse)
    : null;
  const repurchase =
    labelFromOptions(options.reviewRepurchases, review.repurchase) ??
    humaniseCommunityTag(review.repurchase);

  const profileFacets = [
    review.safeFacets.skinType,
    review.safeFacets.skinToneRange,
    review.safeFacets.sensitivityLevel,
    review.safeFacets.climateBucket,
  ]
    .filter(Boolean)
    .map((value) => translateFacet(value as string));
  const concernFacets = review.safeFacets.concernTags
    .slice(0, 3)
    .map(translateFacet);

  return (
    <div className="mt-3 space-y-3 text-xs">
      {/* 3 rating tiles on one row at every viewport. The tile's
          internal padding tightens on mobile so 3 columns still
          fit comfortably on a ~320px-wide phone card. */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        <EvidenceMetric
          icon={Star}
          label={t("overall")}
          value={ratingLabel(review.overallRating, t("notRated"))}
        />
        <EvidenceMetric
          icon={Sparkles}
          label={t("effect")}
          value={ratingLabel(review.effectivenessRating, t("notRated"))}
        />
        <EvidenceMetric
          icon={TimerReset}
          label={t("irritation")}
          value={ratingLabel(review.irritationRating, t("notRated"))}
        />
      </div>

      {/* Labelled groups, each row left-aligned with the label
          on the left and the chip group filling the rest of
          the line: `🕒 Label  [chip] [chip]`. The label is
          vertically centered against the entire chip block
          even when chips wrap to multiple lines inside the
          right column. */}
      <div className="space-y-2">
        <LabeledChipRow icon={Clock} label={t("howUsedLabel")}>
          <Badge tone="muted">
            {usageDuration} · {frequency}
          </Badge>
          {slot ? <Chip>{slot}</Chip> : null}
        </LabeledChipRow>

        {response || repurchase ? (
          <LabeledChipRow icon={TrendingUp} label={t("outcomeLabel")}>
            {response ? <Chip>{response}</Chip> : null}
            <Chip>{t("repurchase", { value: repurchase ?? t("unknown") })}</Chip>
          </LabeledChipRow>
        ) : null}

        {profileFacets.length > 0 || concernFacets.length > 0 ? (
          <LabeledChipRow icon={User} label={t("reviewerLabel")}>
            {profileFacets.map((facet) => (
              <Chip key={facet}>{facet}</Chip>
            ))}
            {concernFacets.map((facet) => (
              <Chip key={facet}>{facet}</Chip>
            ))}
          </LabeledChipRow>
        ) : null}
      </div>
    </div>
  );
}

/* Label + chips layout, responsive:
 *
 *  - Mobile (<sm): label stacks ABOVE the chips so chips get the
 *    full card width instead of squeezing into ~150px next to a
 *    120px label. A row that would have wrapped to 3 chip-lines
 *    typically wraps to 2 with the extra width.
 *  - sm+: label and chips share a row, `items-center` keeps the
 *    label vertically centered against the entire chip block
 *    even when chips themselves wrap to multiple lines.
 *
 * Chips always live in their own inner `flex-wrap` container
 * so the wrapping behaviour stays predictable across viewports. */
function LabeledChipRow({
  children,
  icon: Icon,
  label,
}: {
  children: ReactNode;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
      <p className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[11px] font-semibold text-muted">
        <Icon className="h-3 w-3" />
        {label}
      </p>
      <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function ratingLabel(value: number | null, emptyLabel: string): string {
  return value === null ? emptyLabel : `${value}/5`;
}

function EvidenceMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    /* Mobile-tight padding so 3 tiles fit on one row at ~320px
       card width without overflow or wrapped value text. */
    <div className="min-w-0 rounded-lg border border-border bg-surface-muted px-2 py-1.5 sm:px-2.5 sm:py-2">
      <span className="flex min-w-0 items-center gap-1 text-[11px] font-medium text-muted">
        <Icon className="h-3 w-3 shrink-0" />
        <span className="truncate">{label}</span>
      </span>
      <strong className="mt-1 block text-sm text-foreground">{value}</strong>
    </div>
  );
}
