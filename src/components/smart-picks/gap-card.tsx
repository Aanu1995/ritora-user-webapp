"use client";

import { useTranslations } from "next-intl";
import { RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { SMART_PICKS_GAP_KIND } from "@/types/smart-picks";
import type { SmartPicksGap } from "@/types/smart-picks";
import type { SuggestionGapActionKind } from "@/types/suggestions";
import { ProductPickPanel } from "./product-pick-panel";

interface GapCardProps {
  gap: SmartPicksGap;
  highlighted: boolean;
  pending: boolean;
  onAction: (pickId: string, action: SuggestionGapActionKind) => void;
}

export function GapCard({
  gap,
  highlighted,
  pending,
  onAction,
}: GapCardProps) {
  const t = useTranslations("smartPicks.page");

  return (
    <article
      id={`smart-pick-gap-${gap.normalizedKey}`}
      className={cn(
        "rounded-lg border bg-surface p-4 transition",
        highlighted ? "border-accent-strong shadow-hero" : "border-border",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase text-accent-strong">
            {t(`priority.${gap.priority}`)}
          </div>
          <h3 className="mt-1 text-base font-bold text-foreground">
            {gap.ingredientOrCategory}
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted">{gap.reason}</p>
        </div>
        {gap.goalAlignment ? (
          <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-strong">
            {gap.goalAlignment}
          </span>
        ) : null}
      </div>

      {gap.gapKind === SMART_PICKS_GAP_KIND.Replacement &&
      gap.replacementFor ? (
        <ReplacementEvidence gap={gap} />
      ) : null}

      {gap.pick ? (
        <ProductPickPanel
          pick={gap.pick}
          pending={pending}
          onAction={onAction}
        />
      ) : (
        <div className="mt-4 rounded-lg border border-dashed border-border p-4 text-sm text-muted">
          {t("gap.noPick")}
        </div>
      )}
    </article>
  );
}

function ReplacementEvidence({ gap }: { gap: SmartPicksGap }) {
  const t = useTranslations("smartPicks.page");
  const replacement = gap.replacementFor;
  if (!replacement) return null;

  return (
    <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-950">
      <div className="flex items-start gap-2">
        <RefreshCcw className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <div className="text-sm font-semibold">
            {t("replacement.title", {
              productName: replacement.productName,
            })}
          </div>
          <p className="mt-1 text-xs leading-5">
            {replacement.replacementReason ?? gap.reason}
          </p>
          <p className="mt-2 text-xs leading-5">{t("replacement.caveat")}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold">
            <span className="rounded-full bg-white/75 px-2.5 py-1">
              {t("replacement.usage90", {
                count: replacement.usageDaysLast90,
              })}
            </span>
            <span className="rounded-full bg-white/75 px-2.5 py-1">
              {t("replacement.photos", {
                count: replacement.photoCheckpoints,
              })}
            </span>
            {replacement.reactionSignalCount > 0 ? (
              <span className="rounded-full bg-white/75 px-2.5 py-1">
                {t("replacement.reactions", {
                  count: replacement.reactionSignalCount,
                })}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
