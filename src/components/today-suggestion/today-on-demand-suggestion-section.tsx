"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRetryOnDemandSuggestion } from "@/hooks/use-suggestions";
import { getApiErrorMessage } from "@/lib/api-error";
import { OnDemandSuggestionSection } from "./on-demand-suggestion-section";
import type {
  TodaysOnDemandSuggestion,
  TodaysSuggestionSlot,
} from "@/types/suggestions";

type Props = {
  suggestions: TodaysOnDemandSuggestion[];
  onRecord: (slot: TodaysSuggestionSlot) => void;
  onEdit: (slot: TodaysSuggestionSlot, applicationLogId: string) => void;
  onShowDetail: (slot: TodaysSuggestionSlot) => void;
  timeZone?: string;
  nowMs: number;
};

export function TodayOnDemandSuggestionSection({
  suggestions,
  onRecord,
  onEdit,
  onShowDetail,
  timeZone,
  nowMs,
}: Props) {
  const t = useTranslations("todaysSuggestion.page");
  const retryOnDemandSuggestion = useRetryOnDemandSuggestion();

  return (
    <OnDemandSuggestionSection
      suggestions={suggestions}
      retryingSuggestionId={
        retryOnDemandSuggestion.isPending
          ? retryOnDemandSuggestion.variables
          : null
      }
      onRetry={(suggestionId) => {
        retryOnDemandSuggestion.mutate(suggestionId, {
          onSuccess: () => {
            toast.success(t("quickSuggestionQueued"));
          },
          onError: (error) => {
            toast.error(
              getApiErrorMessage(error) ?? t("quickSuggestionFailed"),
            );
          },
        });
      }}
      onRecord={onRecord}
      onEdit={onEdit}
      onShowDetail={onShowDetail}
      timeZone={timeZone}
      nowMs={nowMs}
    />
  );
}
