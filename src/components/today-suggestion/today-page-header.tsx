import { HeaderContextSubtitle } from "@/components/app/header-context-subtitle";
import { PageHeader } from "@/components/app/page-header";
import { TodayPageHeaderActions } from "@/components/today-suggestion/today-page-header-actions";
import type { TodaysSuggestionResponse } from "@/types/suggestions";

interface TodayPageHeaderProps {
  title: string;
  generatedAt: string;
  timeZone: string;
  city: string | null | undefined;
  locationLoading: boolean;
  headline: string;
  hasData: boolean;
  routineBreak: TodaysSuggestionResponse["routineBreak"] | undefined;
  quickSuggestionDisabled: boolean;
  onQuickSuggestion: () => void;
  onReportReaction: () => void;
  onStartBreak: () => void;
}

export function TodayPageHeader({
  title,
  generatedAt,
  timeZone,
  city,
  locationLoading,
  headline,
  hasData,
  routineBreak,
  quickSuggestionDisabled,
  onQuickSuggestion,
  onReportReaction,
  onStartBreak,
}: TodayPageHeaderProps) {
  return (
    <PageHeader
      title={title}
      subtitle={
        <HeaderContextSubtitle
          generatedAt={generatedAt}
          timeZone={timeZone}
          city={city ?? null}
          locationLoading={locationLoading}
          headline={headline}
        />
      }
      action={
        <TodayPageHeaderActions
          hasData={hasData}
          routineBreak={routineBreak}
          quickSuggestionDisabled={quickSuggestionDisabled}
          onQuickSuggestion={onQuickSuggestion}
          onReportReaction={onReportReaction}
          onStartBreak={onStartBreak}
        />
      }
    />
  );
}
