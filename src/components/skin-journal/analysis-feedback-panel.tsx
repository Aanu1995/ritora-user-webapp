"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, MessageCircle, ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { Textarea } from "@/components/ui/textarea";
import { Chip } from "./chip";
import {
  ANALYSIS_FEEDBACK_REASONS,
  AnalysisFeedbackReason,
  AnalysisFeedbackVote,
} from "@/types/skin-journal";

/* ===========================================================
 * Analysis feedback panel — "Was this helpful?"
 *
 * Sits below the photo analysis as a self-contained card. The
 * previous version rendered as a translucent strip with a
 * `text-xs text-muted` prompt, so the feedback ask read more
 * like an aside than an actual moment to vote. The redesign:
 *
 *   - Solid `bg-surface` card with a clear header (icon avatar
 *     + sentence-case prompt + supporting subtitle).
 *   - Vote buttons are tone-coded when selected: helpful uses
 *     `secondary` (accent-soft) and not-helpful uses `outline`
 *     (so a positive vote feels positive, a negative one
 *     doesn't look like an alarm).
 *   - After voting helpful (no reason form to fill), a small
 *     "Thanks for the feedback." confirmation appears so the
 *     user knows the submission landed.
 *   - Reason picker uses `Chip` instead of `Button`, which is
 *     the right primitive for a multi-option-but-one-selected
 *     control and reads as more compact / less heavy than a
 *     row of buttons.
 *   - Textarea has a live character counter so users know they
 *     have a 500-char budget without trial-and-error.
 * ========================================================= */

export type AnalysisFeedbackPayload = {
  vote: AnalysisFeedbackVote;
  reason?: AnalysisFeedbackReason | null;
  note?: string | null;
};

type AnalysisFeedbackPanelProps = {
  feedbackVote?: AnalysisFeedbackVote | null;
  feedbackReason?: AnalysisFeedbackReason | null;
  feedbackNote?: string | null;
  feedbackDisabled?: boolean;
  onFeedback: (feedback: AnalysisFeedbackPayload) => void;
};

const NOTE_MAX_LENGTH = 500;

export function AnalysisFeedbackPanel({
  feedbackVote = null,
  feedbackReason = null,
  feedbackNote = null,
  feedbackDisabled = false,
  onFeedback,
}: AnalysisFeedbackPanelProps) {
  const t = useTranslations("journal.analysis");
  const [showReasonForm, setShowReasonForm] = useState(
    feedbackVote === AnalysisFeedbackVote.NotHelpful && !feedbackReason,
  );
  const [selectedReason, setSelectedReason] =
    useState<AnalysisFeedbackReason | null>(feedbackReason);
  const [feedbackNoteDraft, setFeedbackNoteDraft] = useState(
    feedbackNote ?? "",
  );
  const noteValue = feedbackNoteDraft.trim();
  const notHelpfulSubmitDisabled = feedbackDisabled || selectedReason === null;
  const hasSubmittedVote = feedbackVote !== null;
  const showThanks = hasSubmittedVote && !showReasonForm && !feedbackDisabled;

  const submitHelpfulFeedback = () => {
    setShowReasonForm(false);
    setSelectedReason(null);
    setFeedbackNoteDraft("");
    onFeedback({
      note: null,
      reason: null,
      vote: AnalysisFeedbackVote.Helpful,
    });
  };

  const openNotHelpfulForm = () => {
    setShowReasonForm(true);
    if (feedbackReason) {
      setSelectedReason(feedbackReason);
    }
  };

  const submitNotHelpfulFeedback = () => {
    if (!selectedReason) return;
    setShowReasonForm(false);
    onFeedback({
      note: noteValue.length > 0 ? noteValue : null,
      reason: selectedReason,
      vote: AnalysisFeedbackVote.NotHelpful,
    });
  };

  const isHelpfulSelected = feedbackVote === AnalysisFeedbackVote.Helpful;
  const isNotHelpfulSelected =
    feedbackVote === AnalysisFeedbackVote.NotHelpful;

  return (
    <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      {/* Header — icon avatar + prompt + subtitle on the left,
          vote buttons on the right. Wraps cleanly on mobile so
          the buttons sit below the prompt instead of cramming. */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span
            aria-hidden
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent-strong"
          >
            <MessageCircle className="h-4.5 w-4.5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {feedbackDisabled ? (
                <LoadingIndicator size="sm" label={t("feedback.saving")} />
              ) : (
                t("feedback.prompt")
              )}
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted">
              {t("feedback.subtitle")}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:self-center">
          <Button
            type="button"
            size="sm"
            variant={isHelpfulSelected ? "secondary" : "outline"}
            aria-pressed={isHelpfulSelected}
            disabled={feedbackDisabled}
            onClick={submitHelpfulFeedback}
          >
            <ThumbsUp className="h-3.5 w-3.5" />
            {t("feedback.helpful")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant={isNotHelpfulSelected ? "secondary" : "outline"}
            aria-pressed={isNotHelpfulSelected}
            disabled={feedbackDisabled}
            onClick={openNotHelpfulForm}
          >
            <ThumbsDown className="h-3.5 w-3.5" />
            {t("feedback.notHelpful")}
          </Button>
        </div>
      </div>

      {showThanks ? (
        <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-accent-strong">
          <CheckCircle2 aria-hidden className="h-3.5 w-3.5" />
          {t("feedback.thanks")}
        </p>
      ) : null}

      {showReasonForm ? (
        <div className="mt-4 space-y-4 border-t border-border pt-4">
          <div>
            <p className="text-sm font-semibold text-foreground">
              {t("feedback.reasonPrompt")}
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted">
              {t("feedback.reasonHelp")}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {ANALYSIS_FEEDBACK_REASONS.map((reason) => (
                <Chip
                  key={reason}
                  asButton
                  selected={selectedReason === reason}
                  onClick={() =>
                    feedbackDisabled ? null : setSelectedReason(reason)
                  }
                  className="px-2.5 py-1"
                  ariaLabel={t(`feedback.reasons.${reason}`)}
                >
                  {t(`feedback.reasons.${reason}`)}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="analysis-feedback-note"
                className="text-sm font-semibold text-foreground"
              >
                {t("feedback.noteLabel")}
              </label>
              <span
                className="text-[11px] tabular-nums text-muted"
                aria-live="polite"
              >
                {t("feedback.noteCount", {
                  count: feedbackNoteDraft.length,
                  max: NOTE_MAX_LENGTH,
                })}
              </span>
            </div>
            <Textarea
              id="analysis-feedback-note"
              className="mt-2"
              value={feedbackNoteDraft}
              rows={3}
              maxLength={NOTE_MAX_LENGTH}
              disabled={feedbackDisabled}
              placeholder={t("feedback.notePlaceholder")}
              aria-label={t("feedback.noteLabel")}
              onChange={(event) => setFeedbackNoteDraft(event.target.value)}
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              disabled={notHelpfulSubmitDisabled}
              onClick={submitNotHelpfulFeedback}
            >
              {t("feedback.submit")}
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
