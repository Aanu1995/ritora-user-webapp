"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { History, Hourglass } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { RetryPanel } from "@/components/ui/retry-panel";
import { DaySummaryPills } from "@/components/today-suggestion/day-summary-pills";
import { NoCurrentSlotEmptyState } from "@/components/today-suggestion/empty-states";
import { ReactionBanner } from "@/components/today-suggestion/reaction-banner";
import { RecordApplicationSheet } from "@/components/today-suggestion/record-application-sheet";
import { RecordingReminderBanner } from "@/components/today-suggestion/recording-reminder-banner";
import { RoutineBreakBanner } from "@/components/today-suggestion/routine-break-banner";
import { RoutineBreakStartDialog } from "@/components/today-suggestion/routine-break-start-dialog";
import { SuggestionDetailDrawer } from "@/components/today-suggestion/suggestion-detail-drawer";
import { SuggestionSlotCard } from "@/components/today-suggestion/slot-card";
import { TodayGapRecommendationSection } from "@/components/today-suggestion/today-gap-recommendation-section";
import { regenerateSimplifiedSuggestions } from "@/components/today-suggestion/today-normal-routine";
import {
  buildHeadline,
  firstGapRecommendation,
  groupSlotsByDaypart,
} from "@/components/today-suggestion/today-page-utils";
import {
  LockedDayBanners,
  SectionGroup,
} from "@/components/today-suggestion/today-timeline-layout";
import { TodaysSuggestionSkeleton } from "@/components/today-suggestion/todays-suggestion-skeleton";
import { useApplicationLog } from "@/hooks/use-application-tracking";
import { useAuthStore } from "@/stores/auth-store";
import {
  useNormalRoutineToday,
  useRegenerateSuggestion,
  useResumeRoutineBreak,
  useStartRoutineBreak,
  useTodaysSuggestion,
  useUpdateRoutineBreak,
} from "@/hooks/use-suggestions";
import { getApiErrorMessage } from "@/lib/api-error";
import type {
  SuggestionInstance,
  TodaysSuggestionSlot,
} from "@/types/suggestions";

export default function TodaysSuggestionPage() {
  const t = useTranslations("todaysSuggestion.page");
  const todaysSuggestion = useTodaysSuggestion();
  const normalRoutine = useNormalRoutineToday();
  const regenerateSuggestion = useRegenerateSuggestion();
  const resumeRoutineBreak = useResumeRoutineBreak();
  const startRoutineBreak = useStartRoutineBreak();
  const updateRoutineBreak = useUpdateRoutineBreak();
  const userTimeZone = useAuthStore((s) => s.user?.timeZone) ?? "UTC";

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(interval);
  }, []);

  const data = todaysSuggestion.data;

  const [recordSlot, setRecordSlot] = useState<TodaysSuggestionSlot | null>(
    null,
  );
  const [startBreakOpen, setStartBreakOpen] = useState(false);
  const [editSlot, setEditSlot] = useState<{
    slot: TodaysSuggestionSlot;
    applicationLogId: string;
  } | null>(null);
  const [detailSuggestion, setDetailSuggestion] =
    useState<SuggestionInstance | null>(null);

  const editApplicationQuery = useApplicationLog(editSlot?.applicationLogId);
  const editingExistingLog = editApplicationQuery.data ?? null;

  const closeRecord = () => setRecordSlot(null);
  const closeEdit = () => setEditSlot(null);
  const closeDetail = () => setDetailSuggestion(null);
  const showRoutineBreakError = (error: unknown) => {
    toast.error(getApiErrorMessage(error) ?? t("routineBreakActionFailed"));
  };

  const groupedSlots = useMemo(
    () => groupSlotsByDaypart(data?.slots ?? []),
    [data?.slots],
  );

  const headline = useMemo(
    () => buildHeadline(data?.date, userTimeZone, now),
    [data?.date, userTimeZone, now],
  );
  const headerAction = (
    <div className="flex shrink-0 gap-1.5">
      {data && !data.routineBreak ? (
        <Button
          type="button"
          size="sm"
          aria-label={t("takeBreak")}
          onClick={() => setStartBreakOpen(true)}
          className="w-7 border border-[color:var(--note-warm-border)] bg-[color:var(--note-warm-bg)] px-0 text-[color:var(--note-warm-fg)] shadow-none hover:bg-[color:var(--note-warm-bg)] hover:opacity-90 sm:w-auto sm:px-4"
        >
          <Hourglass className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t("takeBreak")}</span>
        </Button>
      ) : null}
      <Button
        asChild
        variant="outline"
        size="sm"
        aria-label={t("history")}
        className="w-7 px-0 sm:w-auto sm:px-4"
      >
        <Link href="/history">
          <History className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t("history")}</span>
        </Link>
      </Button>
    </div>
  );
  const routineBreakStartDialog = (
    <RoutineBreakStartDialog
      open={startBreakOpen}
      isStarting={startRoutineBreak.isPending}
      onOpenChange={setStartBreakOpen}
      onStart={(payload) => {
        startRoutineBreak.mutate(payload, {
          onSuccess: () => {
            setStartBreakOpen(false);
            toast.success(t("routineBreakStarted"));
          },
          onError: showRoutineBreakError,
        });
      }}
    />
  );

  if (todaysSuggestion.isLoading) {
    return (
      <div>
        <PageHeader
          title={t("title")}
          subtitle={headline}
          action={headerAction}
        />
        <TodaysSuggestionSkeleton />
      </div>
    );
  }

  if (todaysSuggestion.isError) {
    return (
      <div>
        <PageHeader
          title={t("title")}
          subtitle={headline}
          action={headerAction}
        />
        <div className="mx-auto w-full lg:w-[70%]">
          <RetryPanel
            title={t("errorTitle")}
            description={t("error")}
            actionLabel={t("retry")}
            onAction={() => {
              void todaysSuggestion.refetch();
            }}
          />
        </div>
      </div>
    );
  }

  if (data && data.slots.length === 0 && !data.routineBreak) {
    return (
      <div>
        <PageHeader
          title={t("title")}
          subtitle={headline}
          action={headerAction}
        />
        <div className="mx-auto w-full lg:w-[70%]">
          <NoCurrentSlotEmptyState nextSlotLabel={t("nextSlotTomorrow")} />
        </div>
        {routineBreakStartDialog}
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <PageHeader
          title={t("title")}
          subtitle={headline}
          action={headerAction}
        />
        <TodaysSuggestionSkeleton />
      </div>
    );
  }

  const routineBreak = data.routineBreak;

  // Compose the daily timeline. Banners sit before the first daypart group.
  return (
    <div>
      <PageHeader
        title={t("title")}
        subtitle={headline}
        action={headerAction}
      />

      <div className="mx-auto w-full lg:w-[70%]">
        {routineBreak ? (
          <RoutineBreakBanner
            key={`${routineBreak.id}:${routineBreak.endsAt ?? "none"}`}
            routineBreak={routineBreak}
            isResuming={resumeRoutineBreak.isPending}
            isUpdating={updateRoutineBreak.isPending}
            onResume={() => {
              resumeRoutineBreak.mutate(undefined, {
                onSuccess: () => {
                  toast.success(t("routineBreakResumed"));
                },
                onError: showRoutineBreakError,
              });
            }}
            onUpdateEndsAt={(payload) => {
              updateRoutineBreak.mutate(
                { id: routineBreak.id, payload },
                {
                  onSuccess: () => {
                    toast.success(t("routineBreakResumeUpdated"));
                  },
                  onError: showRoutineBreakError,
                },
              );
            }}
          />
        ) : null}

        {data.reactionAlert ? (
          <ReactionBanner
            alert={data.reactionAlert}
            isResetting={
              normalRoutine.isPending ||
              regenerateSuggestion.isPending
            }
            onResetToNormalRoutine={
              data.reactionAlert.canUseNormalRoutine
                ? () => {
                    normalRoutine.mutate(undefined, {
                      onSuccess: () => {
                        regenerateSimplifiedSuggestions(data.slots, (id) =>
                          regenerateSuggestion.mutate({
                            id,
                            payload: {
                              reason: "normal_routine_requested",
                            },
                          }),
                        );
                        void todaysSuggestion.refetch();
                        toast.success(t("normalRoutineRestored"));
                      },
                    });
                  }
                : undefined
            }
          />
        ) : null}

        {routineBreak ? null : (
          <RecordingReminderBanner
            slots={data.slots}
            onRecord={(target) => setRecordSlot(target)}
          />
        )}

        <DaySummaryPills data={data} />

        {data.slots.length > 0 && data.slots.every((s) => !s.isVisible) ? (
          <LockedDayBanners />
        ) : null}

        {(["morning", "noon", "evening"] as const).map((daypart) => {
          const slots = groupedSlots[daypart];
          if (slots.length === 0) return null;
          return (
            <SectionGroup key={daypart} daypart={daypart}>
              <ul className="flex flex-col gap-3">
                {slots.map((slot) => (
                  <li key={slot.slotId}>
                    <SuggestionSlotCard
                      slot={slot}
                      onRecord={(target) => setRecordSlot(target)}
                      onEdit={(target, applicationLogId) =>
                        setEditSlot({ slot: target, applicationLogId })
                      }
                      onShowDetail={(target) =>
                        target.suggestion
                          ? setDetailSuggestion(target.suggestion)
                          : undefined
                      }
                      onCustomize={(target) => setRecordSlot(target)}
                    />
                  </li>
                ))}
              </ul>
            </SectionGroup>
          );
        })}

        <TodayGapRecommendationSection
          {...firstGapRecommendation(data.slots)}
        />
      </div>

      <RecordApplicationSheet
        open={recordSlot !== null}
        onOpenChange={(open) => (open ? null : closeRecord())}
        mode={recordSlot ? { kind: "record", slot: recordSlot } : null}
        onSaved={closeRecord}
      />

      <RecordApplicationSheet
        open={editSlot !== null && editingExistingLog !== null}
        onOpenChange={(open) => (open ? null : closeEdit())}
        mode={
          editSlot && editingExistingLog
            ? {
                kind: "edit",
                slot: editSlot.slot,
                existingLog: editingExistingLog,
              }
            : null
        }
        onSaved={closeEdit}
      />

      <SuggestionDetailDrawer
        open={detailSuggestion !== null}
        onOpenChange={(open) => (open ? null : closeDetail())}
        suggestion={detailSuggestion}
        onMarkApplied={() => {
          if (!detailSuggestion) return;
          const slot = data.slots.find(
            (s) => s.suggestion?.id === detailSuggestion.id,
          );
          if (slot) {
            setDetailSuggestion(null);
            setRecordSlot(slot);
          }
        }}
      />

      {routineBreakStartDialog}
    </div>
  );
}
