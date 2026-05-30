"use client";

import { ArrowRight, BadgeCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { QueryKey } from "@/constants/query-keys";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/api-error";
import { cn } from "@/lib/utils";
import {
  signalCommunityReviewOutcome,
  signalCommunityRoutineOutcome,
} from "@/services/community.service";
import type {
  CommunityOutcomeSignal,
  CommunityOutcomeSignalCounts,
  CommunityOutcomeSignalInput,
  CommunityOutcomeSignalResponse,
} from "@/types/community";
import { useCommunityTranslatedOptions } from "./community-i18n-options";
import {
  PRIMARY_SIGNALS,
  SIGNAL_ICON_CLASS,
  SIGNAL_META,
  SIGNAL_PILL_CLASS,
} from "./community-outcome-signal-meta";
import { OutcomeSignalDialog } from "./community-outcome-signal-dialog";
import { CommunityReviewResultsSheet } from "./community-review-results-sheet";
import { InlineSpinner } from "./community-shared";

type CommunityOutcomeSignalsProps = {
  canSignalOutcome?: boolean;
  contentId: string;
  /** Title of the reviewed product / shared playbook. Used as a
   * subtitle in the "Community results" sheet so the user keeps
   * the context of what they clicked into. */
  contentTitle?: string;
  contentType: "routine" | "review";
  counts: CommunityOutcomeSignalCounts;
};

/* ===========================================================
 * Outcome signals — semantic icon row for the community card.
 *
 * The previous design used the same `CheckCircle2` for every
 * signal, which read as "this is positive feedback" even for
 * "Did not work" and "Caused irritation." Each signal now gets
 * its own tone-coded icon and color, so the eye can tell a
 * positive vote from a negative one at a glance.
 *
 * Icon mapping is deliberate:
 *   - ThumbsUp + accent: worked_for_me_too
 *   - Sparkles + ai: worked_with_changes
 *   - CircleDot + muted: mixed_result
 *   - ThumbsDown + danger: did_not_work
 *   - AlertTriangle + warning: caused_irritation
 *
 * Each signal renders as a button with the icon AND a short
 * label visible at all times, so users can understand what each
 * icon means without a tooltip. A Tooltip is still wrapped on
 * top, surfacing the full, formal label from the existing
 * `options.outcomeSignals` translation block for screen readers
 * and on-hover discovery.
 * ========================================================= */

export function CommunityOutcomeSignals({
  canSignalOutcome = true,
  contentId,
  contentTitle,
  contentType,
  counts,
}: CommunityOutcomeSignalsProps) {
  const t = useTranslations("community.outcomeSignals");
  const tShort = useTranslations("community.outcomeSignals.shortLabels");
  const options = useCommunityTranslatedOptions();
  const sectionLabel =
    contentType === "review" ? t("reviewDialogTitle") : t("dialogTitle");
  const queryClient = useQueryClient();
  const [selectedSignal, setSelectedSignal] =
    useState<CommunityOutcomeSignal | null>(null);
  const [resultsOpen, setResultsOpen] = useState(false);
  const signal = useMutation<
    CommunityOutcomeSignalResponse,
    Error,
    CommunityOutcomeSignalInput
  >({
    mutationFn: (input: CommunityOutcomeSignalInput) =>
      contentType === "review"
        ? signalCommunityReviewOutcome(contentId, input)
        : signalCommunityRoutineOutcome(contentId, input),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({
        queryKey: [QueryKey.CommunityHome],
      });
      void queryClient.invalidateQueries({
        queryKey: [
          contentType === "review"
            ? QueryKey.CommunityReviews
            : QueryKey.CommunityRoutines,
        ],
      });
      void queryClient.invalidateQueries({
        queryKey: [QueryKey.CommunityReviewResults, contentId],
      });
      toast.success(
        result.noteModerationStatus === "published"
          ? t("addedToast")
          : t("addedWithModeratedNoteToast"),
      );
      setSelectedSignal(null);
    },
    onError: (error) => {
      if (isOwnContentSignalError(error)) {
        toast.error(
          contentType === "review"
            ? t("reviewOwnContentToast")
            : t("routineOwnContentToast"),
        );
        return;
      }
      toast.error(t("failedToast"));
    },
  });
  const worked = counts.worked_for_me_too + counts.worked_with_changes;
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  const confirmedLabel =
    contentType === "review"
      ? t("reviewConfirmed", { worked, total })
      : t("confirmed", { worked, total });
  const helper = contentType === "review" ? t("reviewHelper") : t("helper");

  return (
    <TooltipProvider delayDuration={150}>
      {/* The signal section sits as a top-divided block on the
          card body instead of a nested rounded card, so the
          card reads as one continuous surface rather than a
          stack of boxes-in-boxes. */}
      <section
        aria-label={sectionLabel}
        className="mt-4 border-t border-border pt-4"
      >
        {/* Header: confirmed-count summary on the left, the
            "View community results" action inline on the right
            (review surfaces only, when there's something to
            see). Putting the action next to the number it
            expands keeps them visually associated, instead of
            stranding the button in its own right-aligned row
            below the pills.

            On narrow phones we let the count label flex
            (`min-w-0 flex-1`) so its leading icon stays
            aligned with the card's left rule, and the action
            button stays pinned to the right edge with
            `shrink-0`. The button uses negative-x and
            negative-y margins so its hit area extends to the
            card edge without making the label appear visually
            inset — the smaller `-mr-2` corrects for the
            ghost-button's internal padding. */}
        <header className="flex items-center justify-between gap-2">
          <p className="inline-flex min-w-0 flex-1 items-center gap-1.5 text-sm font-semibold text-foreground">
            <BadgeCheck className="h-4 w-4 shrink-0 text-accent-strong" />
            <span className="min-w-0 truncate">{confirmedLabel}</span>
          </p>
          {contentType === "review" && total > 0 ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="-mr-2 shrink-0 whitespace-nowrap px-2 text-accent-strong"
              onClick={() => setResultsOpen(true)}
            >
              {t("viewResults")}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          ) : null}
        </header>
        <p className="mt-1 text-xs leading-5 text-muted">{helper}</p>

        {/* Horizontal pills: icon + short label + count all on
            one line, wrapped in a flex-wrap. Compresses the
            section's height significantly compared to the
            vertical grid-of-cards layout. Each pill carries a
            tone-tinted surface so the foreground label is never
            sitting on the same color as the card under it. */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {PRIMARY_SIGNALS.map((value) => {
            const meta = SIGNAL_META[value];
            const fullLabel =
              options.outcomeSignals.find((item) => item.value === value)
                ?.label ?? value;
            const shortLabel = tShort(value);
            const loading =
              signal.isPending && signal.variables?.signal === value;
            const count = counts[value];
            const disabled = signal.isPending || !canSignalOutcome;
            return (
              <Tooltip key={value}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label={fullLabel}
                    disabled={disabled}
                    onClick={() => setSelectedSignal(value)}
                    className={cn(
                      "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition disabled:cursor-not-allowed disabled:opacity-60",
                      SIGNAL_PILL_CLASS[meta.tone],
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                        SIGNAL_ICON_CLASS[meta.tone],
                      )}
                    >
                      {loading ? (
                        <InlineSpinner />
                      ) : (
                        <meta.Icon className="h-3 w-3" />
                      )}
                    </span>
                    <span className="font-medium text-foreground">
                      {shortLabel}
                    </span>
                    <span className="font-bold tabular-nums text-foreground">
                      {count}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[14rem] text-xs">
                  {fullLabel}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        <OutcomeSignalDialog
          contentType={contentType}
          isPending={signal.isPending}
          mutate={signal.mutate}
          onOpenChange={(open) => {
            if (!open && !signal.isPending) setSelectedSignal(null);
          }}
          open={selectedSignal !== null}
          selectedSignal={selectedSignal}
        />
        {contentType === "review" ? (
          <CommunityReviewResultsSheet
            open={resultsOpen}
            onOpenChange={setResultsOpen}
            reviewId={contentId}
            productName={contentTitle}
          />
        ) : null}
      </section>
    </TooltipProvider>
  );
}

function isOwnContentSignalError(error: unknown): boolean {
  const message = getApiErrorMessage(error)?.toLowerCase() ?? "";
  return (
    getApiErrorStatus(error) === 403 && message.includes("your own content")
  );
}
