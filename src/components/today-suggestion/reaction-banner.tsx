"use client";

import Link from "next/link";
import { Image as ImageIcon, TriangleAlert, Undo2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { TodaysSuggestionReactionAlert } from "@/types/suggestions";

type Props = {
  alert: TodaysSuggestionReactionAlert;
  onResetToNormalRoutine?: () => void;
};

/**
 * Mockup 05: top banner that explains a possible reaction has been detected
 * in today's photo and the routine has been simplified to barrier mode.
 */
export function ReactionBanner({ alert, onResetToNormalRoutine }: Props) {
  const t = useTranslations("todaysSuggestion.reactionBanner");

  return (
    <div
      role="alert"
      className="mb-4 flex items-start gap-3 rounded-2xl border border-[color:rgba(179,38,30,0.28)] bg-danger-soft px-4 py-3.5"
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[color:rgba(179,38,30,0.18)] text-[color:var(--danger)]">
        <TriangleAlert className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[color:var(--danger)]">
          {t("title")}
        </p>
        <p className="mt-0.5 text-[12.5px] leading-snug text-muted">
          {alert.summary}
        </p>
        {alert.pausedActiveNames.length > 0 ? (
          <p className="mt-1 text-[11.5px] text-muted">
            {t("paused", {
              names: alert.pausedActiveNames.join(", "),
            })}
          </p>
        ) : null}
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Link
            href={`/journal?date=${alert.detectedAt.slice(0, 10)}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent-strong transition hover:bg-accent-soft/80"
          >
            <ImageIcon className="h-3 w-3" />
            {t("viewPhoto")}
          </Link>
          {onResetToNormalRoutine ? (
            <button
              type="button"
              onClick={onResetToNormalRoutine}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-semibold text-foreground transition hover:bg-surface-muted"
            >
              <Undo2 className="h-3 w-3" />
              {t("resetRoutine")}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
