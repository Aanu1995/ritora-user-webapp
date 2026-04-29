"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Download, Plus } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AppRoute } from "@/constants/app-routes";
import { useJournalUiStore } from "@/stores/journal-ui-store";
import {
  useCalendar,
  useDay,
  useDeleteEntry,
  useDismissInsight,
  useInsights,
  useJournalStats,
  usePhotos,
  useWrappedList,
  useRetryAnalysis,
  useStartSimplification,
  useTodayEntry,
} from "@/hooks/use-skin-journal";
import { StatStrip } from "@/components/skin-journal/stat-strip";
import { SimplificationBanner } from "@/components/skin-journal/simplification-banner";
import { ReactionDetectedModal } from "@/components/skin-journal/reaction-detected-modal";
import { DermatologistExportModal } from "@/components/skin-journal/dermatologist-export-modal";
import { JournalTabPanels } from "@/components/skin-journal/journal-tab-panels";
import { resolveCanonicalTodayDate } from "@/components/skin-journal/journal-date";
import { buildJournalUploadHref } from "@/components/skin-journal/journal-navigation";
import type { JournalEntry } from "@/types/skin-journal";

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
  const tDelete = useTranslations("journal.deleteConfirm");
  const tReaction = useTranslations("journal.reaction");
  const router = useRouter();

  const todayInfo = useMemo(() => todayLocal(), []);

  const tab = useJournalUiStore((s) => s.currentTab);
  const setTab = useJournalUiStore((s) => s.setCurrentTab);
  const selectedDate = useJournalUiStore((s) => s.selectedDate);
  const setSelectedDate = useJournalUiStore((s) => s.setSelectedDate);
  const { data: todayPayload } = useTodayEntry();
  const todayDate = resolveCanonicalTodayDate(todayPayload?.date, todayInfo.ymd);
  const effectiveSelectedDate = selectedDate ?? todayDate;
  const canUploadForSelectedDate = effectiveSelectedDate === todayDate;

  const [year, setYear] = useState(todayInfo.year);
  const [monthNum, setMonthNum] = useState(todayInfo.month);
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
  const { data: photos = [] } = usePhotos({});
  const { data: insights = [] } = useInsights();
  const { data: wrapped = [] } = useWrappedList();

  const startSimplification = useStartSimplification();
  const dismissInsight = useDismissInsight();
  const retryAnalysis = useRetryAnalysis();
  const deleteEntry = useDeleteEntry();

  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [dismissedReactionEntryId, setDismissedReactionEntryId] =
    useState<string | null>(null);
  const [pendingDeleteEntry, setPendingDeleteEntry] =
    useState<JournalEntry | null>(null);

  const todayEntry = todayPayload?.entry ?? null;
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

  const handleSimplify = () => {
    if (!reactionEntry) return;
    startSimplification.mutate({
      reason: tReaction("simplificationReason", {
        date: reactionEntry.entry_date,
      }),
    });
    setDismissedReactionEntryId(reactionEntry.id);
  };

  return (
    <div>
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExportModalOpen(true)}
              aria-label={t("exportForDermatologist")}
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {t("exportForDermatologist")}
              </span>
            </Button>
            <Button
              size="sm"
              onClick={() => router.push(buildJournalUploadHref())}
              aria-label={t("fab")}
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t("fab")}</span>
            </Button>
          </div>
        }
      />

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as typeof tab)}
      >
        <div className="sticky top-0 z-20 bg-background pt-2 backdrop-blur supports-[backdrop-filter]:bg-background/85">
          <div className="mx-auto max-w-5xl space-y-3 pb-3">
            <SimplificationBanner />
            <StatStrip stats={stats} />
          </div>
          <div className="mx-auto max-w-5xl overflow-x-auto border-b border-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <TabsList className="border-b-0">
              <TabsTrigger value="calendar">{t("tabs.calendar")}</TabsTrigger>
              <TabsTrigger value="photos">
                {t("tabs.photos")}
                {photos.length ? (
                  <span className="ml-1.5 rounded-full bg-surface-muted px-1.5 py-0.5 text-[10px] font-bold text-muted">
                    {photos.length}
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
          insights={insights}
          wrapped={wrapped}
          calendarData={calendarData}
          calendarLoading={calendarLoading}
          dayDetail={dayDetail ?? null}
          dayLoading={dayLoading}
          selectedDate={effectiveSelectedDate}
          todayLocalDate={todayDate}
          monthLabel={monthLabel}
          onChangeMonth={handleChangeMonth}
          onSelectDate={setSelectedDate}
          onOpenUpload={
            canUploadForSelectedDate
              ? () => router.push(buildJournalUploadHref())
              : undefined
          }
          onOpenCompare={() => router.push(`${AppRoute.Journal}/compare`)}
          onOpenExport={() => setExportModalOpen(true)}
          onRetryAnalysis={(entry) => retryAnalysis.mutate(entry.id)}
          onReplacePhoto={
            canUploadForSelectedDate
              ? () => router.push(buildJournalUploadHref())
              : undefined
          }
          onDeleteEntry={setPendingDeleteEntry}
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
          onSimplify={handleSimplify}
          onKeep={() => setDismissedReactionEntryId(reactionEntry.id)}
        />
      ) : null}

      <AlertDialog
        open={!!pendingDeleteEntry}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteEntry(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tDelete("title")}</AlertDialogTitle>
            <AlertDialogDescription>{tDelete("body")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tDelete("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-danger text-white hover:bg-danger/90"
              onClick={() => {
                if (pendingDeleteEntry) {
                  deleteEntry.mutate(pendingDeleteEntry.id);
                  setPendingDeleteEntry(null);
                }
              }}
            >
              {tDelete("confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
