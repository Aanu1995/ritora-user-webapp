import { Layers, Sparkles, Star, TimerReset } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CommunityReview } from "@/types/community";
import {
  humaniseCommunityTag,
  labelFromOptions,
  useCommunityTranslatedOptions,
} from "./community-i18n-options";
import { Badge, Chip } from "./community-shared";

export function ReviewEvidenceSummary({ review }: { review: CommunityReview }) {
  const t = useTranslations("community.reviewEvidence");
  const options = useCommunityTranslatedOptions();
  const facets = [
    review.safeFacets.skinType,
    review.safeFacets.sensitivityLevel,
    review.safeFacets.climateBucket,
    ...review.safeFacets.concernTags.slice(0, 3),
  ].filter(Boolean);
  const slot = labelFromOptions(options.reviewRoutineSlots, review.routineSlot);
  const response = review.skinResponse
    ? labelFromOptions(options.reviewSkinResponses, review.skinResponse)
    : null;
  const repurchase =
    labelFromOptions(options.reviewRepurchases, review.repurchase) ??
    humaniseCommunityTag(review.repurchase);

  return (
    <div className="mt-3 grid gap-3 text-xs">
      <div className="grid grid-cols-3 gap-2">
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

      <div className="flex flex-wrap gap-1.5">
        <Badge tone="muted">
          <Layers className="h-3 w-3" />
          {review.usageDuration} · {review.frequency}
        </Badge>
        {slot ? <Chip>{slot}</Chip> : null}
        {response ? <Chip>{response}</Chip> : null}
        <Chip>{t("repurchase", { value: repurchase ?? t("unknown") })}</Chip>
      </div>

      {facets.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {facets.map((facet) => (
            <Chip key={facet}>{facet}</Chip>
          ))}
        </div>
      ) : null}
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
  icon: typeof Star;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface-muted px-2.5 py-2">
      <span className="flex items-center gap-1 text-[11px] font-medium text-muted">
        <Icon className="h-3 w-3" />
        {label}
      </span>
      <strong className="mt-1 block text-sm text-foreground">{value}</strong>
    </div>
  );
}
