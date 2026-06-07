"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { Chip } from "@/components/skin-journal/chip";
import { DayDetailPanel } from "@/components/skin-journal/day-detail";
import { JournalComingSoon } from "@/components/skin-journal/journal-coming-soon";
import { JournalEmptyState } from "@/components/skin-journal/journal-empty-state";
import { JournalCalendar } from "@/components/skin-journal/journal-calendar";
import { PhotoGrid } from "@/components/skin-journal/photo-grid";
import {
  PhotoFilterKind,
  type AnalysisFeedbackReason,
  type AnalysisFeedbackVote,
  type CalendarPayload,
  type DayDetail,
  type JournalEntry,
  type JournalInsight,
  type JournalInsightsMeta,
  type InsightAction,
  type InsightWindow,
  type PhotoFilterId,
  type PhotoFilterOption,
  type PhotoMonthItem,
  type Wrapped,
} from "@/types/skin-journal";

interface JournalTabPanelsProps {
  photos: JournalEntry[];
  filteredPhotos: JournalEntry[];
  totalPhotoCount: number;
  hasMoreFilteredPhotos: boolean;
  isFetchingMoreFilteredPhotos: boolean;
  onLoadMoreFilteredPhotos: () => void;
  photoFilters: PhotoFilterOption[];
  selectedPhotoFilter: PhotoFilterId;
  insights: JournalInsight[];
  insightsMeta: JournalInsightsMeta | null;
  insightsLoading: boolean;
  insightsWindow: InsightWindow;
  onInsightsWindowChange: (window: InsightWindow) => void;
  onRefreshInsights: () => void;
  isRefreshingInsights: boolean;
  wrapped: Wrapped[];
  calendarData: CalendarPayload | undefined;
  calendarLoading: boolean;
  trackedMonths: PhotoMonthItem[];
  dayDetail: DayDetail | null;
  dayLoading: boolean;
  aiActionsDisabled?: boolean;
  photoActionsDisabled?: boolean;
  selectedDate: string;
  todayLocalDate: string;
  monthLabel: string;
  onChangeMonth: (delta: -1 | 1) => void;
  onSelectMonth: (month: string) => void;
  onSelectDate: (date: string) => void;
  onOpenUpload?: () => void;
  onOpenCompare: (fromDate?: string, toDate?: string) => void;
  onOpenInsightEntries: (entryIds: string[]) => void;
  onOpenProduct: (productId: string) => void;
  onOpenSettings: (tab: string) => void;
  onRecordInsightAction?: (id: string, action: InsightAction) => void;
  onPhotoFilterChange: (filter: PhotoFilterId) => void;
  onEditEntry?: (entry: JournalEntry) => void;
  onRetryAnalysis?: (entry: JournalEntry) => void;
  onAnalysisFeedback?: (
    entry: JournalEntry,
    feedback: {
      vote: AnalysisFeedbackVote;
      reason?: AnalysisFeedbackReason | null;
      note?: string | null;
    },
  ) => void;
  analysisFeedbackDisabled?: boolean;
  onReinterpretAnalysis?: (entry: JournalEntry) => void;
  reinterpretAnalysisDisabled?: boolean;
  onReplacePhoto?: (entry: JournalEntry) => void;
  onDismissInsight: (id: string) => void;
}

export function JournalTabPanels({
  filteredPhotos,
  totalPhotoCount,
  hasMoreFilteredPhotos,
  isFetchingMoreFilteredPhotos,
  onLoadMoreFilteredPhotos,
  photoFilters,
  selectedPhotoFilter,
  calendarData,
  calendarLoading,
  trackedMonths,
  dayDetail,
  dayLoading,
  aiActionsDisabled = false,
  photoActionsDisabled = false,
  selectedDate,
  todayLocalDate,
  monthLabel,
  onChangeMonth,
  onSelectMonth,
  onSelectDate,
  onOpenUpload,
  onOpenCompare,
  onPhotoFilterChange,
  onEditEntry,
  onRetryAnalysis,
  onAnalysisFeedback,
  analysisFeedbackDisabled = false,
  onReinterpretAnalysis,
  reinterpretAnalysisDisabled = false,
  onReplacePhoto,
}: JournalTabPanelsProps) {
  const tEmpty = useTranslations("journal.empty");
  const tPhotosTab = useTranslations("journal.photos");
  const tConcerns = useTranslations("journal.concerns");
  const tComingSoon = useTranslations("journal.comingSoon");

  const visiblePhotoFilters =
    photoFilters.length > 0
      ? photoFilters
      : [
          {
            id: "all" as PhotoFilterId,
            kind: PhotoFilterKind.All,
            value: null,
            count: totalPhotoCount,
          },
        ];

  return (
    <div className="mx-auto max-w-7xl">
      <TabsContent value="calendar" className="relative mt-4">
        {totalPhotoCount === 0 && !calendarLoading ? (
          <JournalEmptyState
            icon="📸"
            title={tEmpty("title")}
            body={tEmpty("body")}
            cta={tEmpty("addFirst")}
            ctaDisabled={photoActionsDisabled}
            onCta={onOpenUpload}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:h-[calc(100dvh-280px)] lg:max-h-[calc(100dvh-280px)] lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:overflow-hidden">
            <div className="min-h-0 lg:overflow-y-auto lg:pr-2">
              <JournalCalendar
                payload={calendarData}
                isLoading={calendarLoading}
                selectedDate={selectedDate}
                onSelectDate={onSelectDate}
                todayLocalDate={todayLocalDate}
                onChangeMonth={onChangeMonth}
                monthLabel={monthLabel}
                monthOptions={trackedMonths}
                onSelectMonth={onSelectMonth}
              />
            </div>
            <div className="min-h-0 lg:overflow-y-auto lg:pr-2">
              <DayDetailPanel
                detail={dayDetail}
                isLoading={dayLoading}
                isToday={selectedDate === todayLocalDate}
                onAddPhoto={onOpenUpload}
                onEditEntry={onEditEntry}
                photoActionsDisabled={photoActionsDisabled}
                retryAnalysisDisabled={aiActionsDisabled}
                onRetryAnalysis={onRetryAnalysis}
                analysisFeedbackDisabled={analysisFeedbackDisabled}
                onAnalysisFeedback={onAnalysisFeedback}
                reinterpretAnalysisDisabled={reinterpretAnalysisDisabled}
                onReinterpretAnalysis={onReinterpretAnalysis}
                onReplacePhoto={onReplacePhoto}
              />
            </div>
          </div>
        )}
      </TabsContent>

      <TabsContent value="photos" className="mt-4">
        {totalPhotoCount === 0 ? (
          <JournalEmptyState
            icon="📸"
            title={tPhotosTab("emptyTitle")}
            body={tPhotosTab("emptyBody")}
            cta={tEmpty("addFirst")}
            ctaDisabled={photoActionsDisabled}
            onCta={onOpenUpload}
          />
        ) : (
          <>
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 [scrollbar-width:none] sm:flex-wrap [&::-webkit-scrollbar]:hidden">
                {visiblePhotoFilters.map((filter) => {
                  const isSelected = selectedPhotoFilter === filter.id;
                  const label =
                    filter.kind === PhotoFilterKind.All
                      ? tPhotosTab("filtersAll")
                      : filter.kind === PhotoFilterKind.Reaction
                        ? tPhotosTab("filterReaction")
                        : tPhotosTab("filterConcern", {
                            concern: filter.value
                              ? tConcerns(filter.value)
                              : tPhotosTab("unknownConcern"),
                          });
                  return (
                    <Chip
                      key={filter.id}
                      asButton
                      selected={isSelected}
                      variant={
                        filter.kind === PhotoFilterKind.All && isSelected
                          ? "accent"
                          : undefined
                      }
                      onClick={() => onPhotoFilterChange(filter.id)}
                    >
                      <span>{label}</span>
                      <span className="ml-1 rounded-full bg-accent-soft px-1 text-[10px] text-accent-strong">
                        {filter.count}
                      </span>
                    </Chip>
                  );
                })}
              </div>
              <Button
                size="sm"
                onClick={() => onOpenCompare()}
                className="w-full sm:w-auto"
              >
                {tPhotosTab("compareCta")}
              </Button>
            </div>
            {filteredPhotos.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[color:var(--border-strong)] bg-accent-soft/30 p-8 text-center text-sm text-muted">
                {tPhotosTab("noFilterMatches")}
              </div>
            ) : (
              <PhotoGrid
                entries={filteredPhotos}
                hasNextPage={hasMoreFilteredPhotos}
                isFetchingNextPage={isFetchingMoreFilteredPhotos}
                onLoadMore={onLoadMoreFilteredPhotos}
              />
            )}
          </>
        )}
      </TabsContent>

      <TabsContent value="insights" className="mt-4">
        <JournalComingSoon
          icon="✨"
          tone="ai"
          badge={tComingSoon("badge")}
          title={tComingSoon("insights.title")}
          body={tComingSoon("insights.body")}
        />
      </TabsContent>

      <TabsContent value="wrapped" className="mt-4">
        <JournalComingSoon
          icon="🎞️"
          tone="secondary"
          badge={tComingSoon("badge")}
          title={tComingSoon("wrapped.title")}
          body={tComingSoon("wrapped.body")}
        />
      </TabsContent>
    </div>
  );
}
