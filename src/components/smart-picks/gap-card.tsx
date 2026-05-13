"use client";

import { useTranslations } from "next-intl";
import { CircleAlert, Lightbulb, RefreshCcw, TimerReset } from "lucide-react";
import { cn } from "@/lib/utils";
import { SMART_PICKS_GAP_KIND } from "@/types/smart-picks";
import type { SmartPicksGap } from "@/types/smart-picks";
import type { SuggestionGapActionKind } from "@/types/suggestions";
import { ProductPickPanel } from "./product-pick-panel";

interface GapCardProps {
  gap: SmartPicksGap;
  highlighted: boolean;
  pendingPickId: string | null;
  pendingAction: SuggestionGapActionKind | null;
  actionsDisabled: boolean;
  onAction: (pickId: string, action: SuggestionGapActionKind) => void;
}

export function GapCard({
  gap,
  highlighted,
  pendingPickId,
  pendingAction,
  actionsDisabled,
  onAction,
}: GapCardProps) {
  const t = useTranslations("smartPicks.page");
  const isConsider = gap.priority === "consider";

  return (
    <article
      id={`smart-pick-gap-${gap.normalizedKey}`}
      className={cn(
        "rounded-2xl border p-4 transition sm:p-5",
        highlighted && "border-accent-strong shadow-hero",
        !highlighted && isConsider && "border-border bg-surface-muted",
        !highlighted && !isConsider && "border-border bg-surface shadow-soft",
      )}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em]",
              isConsider
                ? "border-border bg-surface text-muted"
                : "border-[color:rgba(184,84,10,0.28)] bg-warning-soft text-[color:var(--warning)]",
            )}
          >
            {isConsider ? (
              <Lightbulb className="h-2.5 w-2.5" aria-hidden="true" />
            ) : (
              <CircleAlert className="h-2.5 w-2.5" aria-hidden="true" />
            )}
            {t(`priority.${gap.priority}`)}
          </span>
          {gap.goalAlignment ? (
            <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[11px] font-semibold text-accent-strong">
              {gap.goalAlignment}
            </span>
          ) : null}
        </div>
        <h3 className="mt-1.5 font-display text-base font-bold leading-tight text-foreground sm:text-[17px]">
          {gap.ingredientOrCategory}
        </h3>
        {isConsider ? (
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            <span className="font-semibold text-foreground">
              {t("gap.whyPrefix")}
            </span>{" "}
            {gap.shortReason}
          </p>
        ) : (
          <p className="mt-2 text-sm leading-6 text-muted">{gap.reason}</p>
        )}
      </div>

      {gap.gapKind === SMART_PICKS_GAP_KIND.Replacement &&
      gap.replacementFor ? (
        <ReplacementEvidence gap={gap} />
      ) : null}

      {gap.pick ? (
        <ProductPickPanel
          pick={gap.pick}
          pendingAction={
            pendingPickId === gap.pick.id ? pendingAction : null
          }
          actionsDisabled={actionsDisabled}
          onAction={onAction}
        />
      ) : (
        <PendingPickNotice />
      )}
    </article>
  );
}

function PendingPickNotice() {
  const t = useTranslations("smartPicks.page");

  return (
    <div className="mt-4 rounded-lg border border-dashed border-border bg-surface-muted p-4">
      <div className="flex items-start gap-2 text-sm text-muted">
        <TimerReset className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <div>
          <p className="font-semibold text-foreground">
            {t("gap.noPickTitle")}
          </p>
          <p className="mt-1 leading-6">{t("gap.noPick")}</p>
        </div>
      </div>
    </div>
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
