"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppRoute, NOTIFICATION_SETTINGS_ROUTE } from "@/constants/app-routes";
import { useJournalUiStore } from "@/stores/journal-ui-store";
import {
  useCalendar,
  useDay,
  useDismissInsight,
  useInsights,
  useJournalStats,
  usePhotoDates,
  usePhotoFilters,
  useRecordInsightAction,
  usePhotos,
  useWrappedList,
  useRetryAnalysis,
  useStartSimplification,
  useTodayEntry,
} from "@/hooks/use-skin-journal";
import { StatStrip } from "@/components/skin-journal/stat-strip";
import { JournalPageActions } from "@/components/skin-journal/journal-page-actions";
import { ReactionDetectedModal } from "@/components/skin-journal/reaction-detected-modal";
import { DermatologistExportModal } from "@/components/skin-journal/dermatologist-export-modal";
import { JournalTabPanels } from "@/components/skin-journal/journal-tab-panels";
import { resolveCanonicalTodayDate } from "@/components/skin-journal/journal-date";
import { JournalUploadMode } from "@/components/skin-journal/journal-navigation";
import { useJournalCapabilityFlags } from "@/components/skin-journal/use-journal-capability-flags";
import { useJournalProfileGate } from "@/components/skin-journal/use-journal-profile-gate";
import { PhotoFilterStaticId, type PhotoFilterId } from "@/types/skin-journal";

function formatLocalYmd(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function todayLocal(): { ymd: string; year: number; month: number } {
  const d = new Date();
  return {
    ymd: formatLocalYmd(d),
    year: d.getFullYear(),
    month: d.getMonth() + 1,
  };
}

export default function JournalPage() {
  const locale = useLocale();
  const t = useTranslations("journal");
  const tReaction = useTranslations("journal.reaction");
  const router = useRouter();
  const { openTodayUpload, profileGateDialog } = useJournalProfileGate();
  const { aiActionsDisabled, photoActionsDisabled } =
    useJournalCapabilityFlags();

  const todayInfo = useMemo(() => todayLocal(), []);

  const tab = useJournalUiStore((s) => s.currentTab);
  const setTab = useJournalUiStore((s) => s.setCurrentTab);
  const selectedDate = useJournalUiStore((s) => s.selectedDate);
  const setSelectedDate = useJournalUiStore((s) => s.setSelectedDate);
  const insightsWindow = useJournalUiStore((s) => s.insightsWindow);
  const setInsightsWindow = useJournalUiStore((s) => s.setInsightsWindow);
  const setCompareDates = useJournalUiStore((s) => s.setCompareDates);
  const { data: todayPayload } = useTodayEntry();
  const todayDate = resolveCanonicalTodayDate(todayPayload?.date, todayInfo.ymd);
  const effectiveSelectedDate = selectedDate ?? todayDate;
  const canUploadForSelectedDate = effectiveSelectedDate === todayDate;

  const [year, setYear] = useState(todayInfo.year);
  const [monthNum, setMonthNum] = useState(todayInfo.month);
  const [selectedPhotoFilter, setSelectedPhotoFilter] =
    useState<PhotoFilterId>(PhotoFilterStaticId.All);
  const isPhotoFilterActive = selectedPhotoFilter !== PhotoFilterStaticId.All;
  const monthString = `${year}-${String(monthNum).padStart(2, "0")}`;
  const monthLabel = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(new Date(year, monthNum - 1, 1));

  const { data: calendarData, isLoading: calendarLoading } =
    useCalendar(monthString);
  const { data: stats } = useJournalStats();
  const { data: dayDetail, isLoading: dayLoading } =
    useDay(effectiveSelectedDate);
  const photosQuery = usePhotos({});
  const filteredPhotosQuery = usePhotos(
    {
      filter: selectedPhotoFilter,
    },
    { enabled: isPhotoFilterActive },
  );
  const { data: photoFilterIndex } = usePhotoFilters();
  const { data: photoDateIndex } = usePhotoDates();
  const {
    data: insightsPayload,
    isLoading: insightsLoading,
    isFetching: insightsFetching,
    refetch: refetchInsights,
  } = useInsights({
    window: insightsWindow,
    locale,
  });
  const insights = insightsPayload?.insights ?? [];
  const { data: wrapped = [] } = useWrappedList();

  const startSimplification = useStartSimplification();
  const dismissInsight = useDismissInsight();
  const recordInsightAction = useRecordInsightAction();
  const retryAnalysis = useRetryAnalysis();
  const photos = useMemo(
    () => photosQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [photosQuery.data],
  );
  const filteredPhotos = useMemo(
    () =>
      isPhotoFilterActive
        ? (filteredPhotosQuery.data?.pages.flatMap((page) => page.items) ?? [])
        : photos,
    [filteredPhotosQuery.data, isPhotoFilterActive, photos],
  );
  const totalPhotoCount =
    photoFilterIndex?.filters.find(
      (filter) => filter.id === PhotoFilterStaticId.All,
    )?.count ??
    photoDateIndex?.dates.length ??
    photos.length;

  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [dismissedReactionEntryId, setDismissedReactionEntryId] =
    useState<string | null>(null);

  const todayEntry = todayPayload?.entry ?? null;
  const hasTodayEntry = Boolean(todayEntry);
  const reactionEntry =
    todayEntry?.has_reaction && todayEntry.analysis_observations
      ? todayEntry
      : null;
  const shouldShowReactionModal =
    !!reactionEntry &&
    reactionEntry.id !== dismissedReactionEntryId &&
    (reactionEntry.analysis_observations?.reaction_signals?.confidence ?? 0) >=
      0.6;

  const handleChangeMonth = (delta: -1 | 1) => {
    let next = monthNum + delta;
    let nextYear = year;
    if (next < 1) {
      next = 12;
      nextYear -= 1;
    }
    if (next > 12) {
      next = 1;
      nextYear += 1;
    }
    setMonthNum(next);
    setYear(nextYear);
  };

  const handleSelectMonth = (nextMonth: string) => {
    const [nextYear, nextMonthNum] = nextMonth
      .split("-")
      .map((part) => parseInt(part, 10));
    setYear(nextYear);
    setMonthNum(nextMonthNum);
  };

  const handleSimplify = () => {
    if (!reactionEntry || aiActionsDisabled) return;
    startSimplification.mutate({
      reason: tReaction("simplificationReason", {
        date: reactionEntry.entry_date,
      }),
    });
    setDismissedReactionEntryId(reactionEntry.id);
  };

  const handleOpenCompare = (fromDate?: string, toDate?: string) => {
    if (fromDate && toDate) {
      setCompareDates(fromDate, toDate);
    }
    router.push(`${AppRoute.Journal}/compare`);
  };

  const handleOpenInsightEntries = (entryIds: string[]) => {
    const photoDateByEntryId = new Map(
      photoDateIndex?.dates.map((item) => [item.entry_id, item.date]) ?? [],
    );
    const photoByEntryId = new Map(
      photos.map((photo) => [photo.id, photo.entry_date]),
    );
    const date = entryIds
      .map((entryId) => photoDateByEntryId.get(entryId) ?? photoByEntryId.get(entryId))
      .find((entryDate): entryDate is string => !!entryDate);

    if (!date) {
      return;
    }

    const [nextYear, nextMonthNum] = date
      .split("-")
      .map((part) => parseInt(part, 10));
    setYear(nextYear);
    setMonthNum(nextMonthNum);
    setSelectedDate(date);
    setTab("calendar");
  };

  const handleOpenSettings = (settingsTab: string) => {
    router.push(
      settingsTab === "notifications"
        ? NOTIFICATION_SETTINGS_ROUTE
        : AppRoute.Settings,
    );
  };

  return (
    <div>
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        action={
          <JournalPageActions
            hasTodayEntry={hasTodayEntry}
            photoActionsDisabled={photoActionsDisabled}
            onOpenExport={() => setExportModalOpen(true)}
            onOpenUpload={() => openTodayUpload()}
          />
        }
      />

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as typeof tab)}
      >
        <div className="sticky top-[88px] z-[5] -mx-4 bg-background px-4 pt-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="mx-auto max-w-7xl pb-3">
            <StatStrip stats={stats} />
          </div>
          <div className="mx-auto max-w-7xl overflow-x-auto border-b border-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <TabsList className="border-b-0">
              <TabsTrigger value="calendar">{t("tabs.calendar")}</TabsTrigger>
              <TabsTrigger value="photos">
                {t("tabs.photos")}
                {totalPhotoCount ? (
                  <span className="ml-1.5 rounded-full bg-surface-muted px-1.5 py-0.5 text-[10px] font-bold text-muted">
                    {totalPhotoCount}
                  </span>
                ) : null}
              </TabsTrigger>
              <TabsTrigger value="insights">
                {t("tabs.insights")}
                {insights.length ? (
                  <span className="ml-1.5 rounded-full bg-surface-muted px-1.5 py-0.5 text-[10px] font-bold text-muted">
                    {insights.length}
                  </span>
                ) : null}
              </TabsTrigger>
              <TabsTrigger value="wrapped">
                {t("tabs.wrapped")}
                {wrapped.length ? (
                  <span className="ml-1.5 rounded-full bg-surface-muted px-1.5 py-0.5 text-[10px] font-bold text-muted">
                    {wrapped.length}
                  </span>
                ) : null}
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <JournalTabPanels
          photos={photos}
          filteredPhotos={filteredPhotos}
          totalPhotoCount={totalPhotoCount}
          hasMoreFilteredPhotos={
            isPhotoFilterActive
              ? filteredPhotosQuery.hasNextPage
              : photosQuery.hasNextPage
          }
          isFetchingMoreFilteredPhotos={
            isPhotoFilterActive
              ? filteredPhotosQuery.isFetchingNextPage
              : photosQuery.isFetchingNextPage
          }
          onLoadMoreFilteredPhotos={() => {
            void (isPhotoFilterActive
              ? filteredPhotosQuery
              : photosQuery
            ).fetchNextPage();
          }}
          photoFilters={photoFilterIndex?.filters ?? []}
          selectedPhotoFilter={selectedPhotoFilter}
          insights={insights}
          insightsMeta={insightsPayload?.meta ?? null}
          insightsLoading={insightsLoading}
          insightsWindow={insightsWindow}
          onInsightsWindowChange={setInsightsWindow}
          onRefreshInsights={() => {
            if (aiActionsDisabled) {
              return;
            }
            void refetchInsights();
          }}
          isRefreshingInsights={insightsFetching && !insightsLoading}
          wrapped={wrapped}
          calendarData={calendarData}
          calendarLoading={calendarLoading}
          aiActionsDisabled={aiActionsDisabled}
          photoActionsDisabled={photoActionsDisabled}
          trackedMonths={photoDateIndex?.months ?? []}
          dayDetail={dayDetail ?? null}
          dayLoading={dayLoading}
          selectedDate={effectiveSelectedDate}
          todayLocalDate={todayDate}
          monthLabel={monthLabel}
          onChangeMonth={handleChangeMonth}
          onSelectMonth={handleSelectMonth}
          onSelectDate={setSelectedDate}
          onOpenUpload={
            canUploadForSelectedDate && !hasTodayEntry
              ? () => {
                  if (!photoActionsDisabled) openTodayUpload();
                }
              : undefined
          }
          onOpenCompare={handleOpenCompare}
          onOpenExport={() => setExportModalOpen(true)}
          onOpenInsightEntries={handleOpenInsightEntries}
          onOpenProduct={(productId) =>
            router.push(`${AppRoute.Shelf}/${productId}`)
          }
          onOpenSettings={handleOpenSettings}
          onRecordInsightAction={(id, action) =>
            recordInsightAction.mutate({ id, action_kind: action.kind })
          }
          onPhotoFilterChange={setSelectedPhotoFilter}
          onEditEntry={
            canUploadForSelectedDate
              ? () => openTodayUpload(JournalUploadMode.Edit)
              : undefined
          }
          onRetryAnalysis={(entry) => {
            if (!aiActionsDisabled) retryAnalysis.mutate(entry.id);
          }}
          onReplacePhoto={
            canUploadForSelectedDate
              ? () => {
                  if (!photoActionsDisabled) {
                    openTodayUpload(JournalUploadMode.Edit);
                  }
                }
              : undefined
          }
          onDismissInsight={(id) => dismissInsight.mutate(id)}
        />
      </Tabs>

      <DermatologistExportModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
      />

      {reactionEntry?.analysis_observations ? (
        <ReactionDetectedModal
          open={shouldShowReactionModal}
          onOpenChange={(open) => {
            if (!open) setDismissedReactionEntryId(reactionEntry.id);
          }}
          severity={
            reactionEntry.analysis_observations.reaction_signals
              .reaction_severity
          }
          indicators={
            reactionEntry.analysis_observations.reaction_signals.indicators
          }
          date={reactionEntry.entry_date}
          simplifyDisabled={aiActionsDisabled}
          onSimplify={handleSimplify}
          onKeep={() => setDismissedReactionEntryId(reactionEntry.id)}
        />
      ) : null}

      {profileGateDialog}
    </div>
  );
}
