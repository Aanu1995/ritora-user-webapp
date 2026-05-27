import { useLocalAnalysisFeedback } from "@/hooks/use-skin-journal";
import type {
  AnalysisFeedback,
  AnalysisFeedbackReason,
  AnalysisFeedbackVote,
  JournalEntry,
} from "@/types/skin-journal";

export type DayDetailAnalysisFeedbackPayload = {
  vote: AnalysisFeedbackVote;
  reason?: AnalysisFeedbackReason | null;
  note?: string | null;
};

function isFeedbackForCurrentInterpretation(
  entry: JournalEntry,
  feedback: AnalysisFeedback | null | undefined,
): feedback is AnalysisFeedback {
  if (!feedback) return false;
  const currentVersion =
    entry.analysis_interpretation?.version ?? entry.analysis_version ?? null;
  return (
    !feedback.interpretation_version ||
    !currentVersion ||
    feedback.interpretation_version === currentVersion
  );
}

export function selectCurrentAnalysisFeedback(
  entry: JournalEntry,
  ...candidates: Array<AnalysisFeedback | null | undefined>
): AnalysisFeedback | null {
  return candidates.find((candidate) =>
    isFeedbackForCurrentInterpretation(entry, candidate),
  ) ?? null;
}

export function useDayDetailAnalysisFeedback(
  entry: JournalEntry | null,
  override: AnalysisFeedback | null | undefined,
) {
  const localFeedback = useLocalAnalysisFeedback(entry?.id);

  if (!entry) {
    return {
      hasSubmittedFeedback: false,
      visibleFeedback: null,
    };
  }

  const visibleFeedback = selectCurrentAnalysisFeedback(
    entry,
    override,
    localFeedback.data,
    entry.analysis_feedback,
  );

  return {
    hasSubmittedFeedback:
      Boolean(visibleFeedback) || entry.analysis_feedback_submitted === true,
    visibleFeedback,
  };
}
