"use client";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { HeaderContextSubtitle } from "@/components/app/header-context-subtitle";
import { PageHeader } from "@/components/app/page-header";
import { RetryPanel } from "@/components/ui/retry-panel";
import { DaySummaryPills } from "@/components/today-suggestion/day-summary-pills";
import { NoCurrentSlotEmptyState } from "@/components/today-suggestion/empty-states";
import { ReactionBanner } from "@/components/today-suggestion/reaction-banner";
import { RecordApplicationSheet } from "@/components/today-suggestion/record-application-sheet";
import { RecordingReminderBanner } from "@/components/today-suggestion/recording-reminder-banner";
import { RoutineBreakBanner } from "@/components/today-suggestion/routine-break-banner";
import { RoutineBreakStartDialog } from "@/components/today-suggestion/routine-break-start-dialog";
import { onDemandToSlot } from "@/components/today-suggestion/on-demand-suggestion-adapter";
import { SuggestionDetailDrawer } from "@/components/today-suggestion/suggestion-detail-drawer";
import { SuggestionSlotCard } from "@/components/today-suggestion/slot-card";
import { TodayAiConsentCard } from "@/components/today-suggestion/today-ai-consent-card";
import { TodayOnDemandSuggestionSection } from "@/components/today-suggestion/today-on-demand-suggestion-section";
import { TodayGapRecommendationSection } from "@/components/today-suggestion/today-gap-recommendation-section";
import { TodayPageHeaderActions } from "@/components/today-suggestion/today-page-header-actions";
import { regenerateSimplifiedSuggestions } from "@/components/today-suggestion/today-normal-routine";
import { useTodayQuickSuggestionFlow } from "@/components/today-suggestion/use-today-quick-suggestion-flow";
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
import { useSkinProfile } from "@/hooks/use-skin-profile";
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
  const skinProfile = useSkinProfile();

  const [now, setNow] = useState(() => new Date());
  const nowMs = now.getTime();
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(interval);
  }, []);

  const data = todaysSuggestion.data;

  const [recordSlot, setRecordSlot] = useState<TodaysSuggestionSlot | null>(
    null,
  );
  const [startBreakOpen, setStartBreakOpen] = useState(false);
  const quickSuggestionFlow = useTodayQuickSuggestionFlow();
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
  const onDemandSlots = useMemo(
    () => data?.onDemandSuggestions.map(onDemandToSlot) ?? [],
    [data?.onDemandSuggestions],
  );
  const openRecordForSuggestion = (suggestion: SuggestionInstance | null) => {
    if (!suggestion || !data) return;
    const slot = [...data.slots, ...onDemandSlots].find(
      (item) => item.suggestion?.id === suggestion.id,
    );
    if (!slot) return;
    setDetailSuggestion(null);
    setRecordSlot(slot);
  };
  const showRoutineBreakError = (error: unknown) => {
    toast.error(getApiErrorMessage(error) ?? t("routineBreakActionFailed"));
  };

  const groupedSlots = useMemo(
    () => groupSlotsByDaypart(data?.slots ?? []),
    [data?.slots],
  );

  const headline = useMemo(
    () => buildHeadline(data?.date, userTimeZone),
    [data?.date, userTimeZone],
  );
  const headerSubtitle = (
    <HeaderContextSubtitle
      generatedAt={data?.generatedAt ?? now.toISOString()}
      timeZone={data?.timeZone ?? userTimeZone}
      city={skinProfile.data?.city ?? null}
      locationLoading={skinProfile.isLoading}
      headline={headline}
    />
  );
  const headerAction = (
    <TodayPageHeaderActions
      hasData={Boolean(data)}
      routineBreak={data?.routineBreak}
      onQuickSuggestion={quickSuggestionFlow.openQuickSuggestion}
      onStartBreak={() => setStartBreakOpen(true)}
    />
  );
  const pageHeader = (
    <PageHeader title={t("title")} subtitle={headerSubtitle} action={headerAction} />
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
        {pageHeader}
        <TodaysSuggestionSkeleton />
      </div>
    );
  }
  if (todaysSuggestion.isError) {
    return (
      <div>
        {pageHeader}
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

  if (
    data &&
    data.slots.length === 0 &&
    data.onDemandSuggestions.length === 0 &&
    !data.routineBreak
  ) {
    return (
      <div>
        {pageHeader}
        <div className="mx-auto w-full lg:w-[70%]">
          <NoCurrentSlotEmptyState nextSlotLabel={t("nextSlotTomorrow")} />
        </div>
        {routineBreakStartDialog}
        {quickSuggestionFlow.dialogs}
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        {pageHeader}
        <TodaysSuggestionSkeleton />
      </div>
    );
  }

  const routineBreak = data.routineBreak;

  return (
    <div>
      {pageHeader}

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
              normalRoutine.isPending || regenerateSuggestion.isPending
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

        <TodayAiConsentCard
          visible={
            quickSuggestionFlow.aiConsentMissing &&
            data.slots.length > 0 &&
            !routineBreak
          }
          pending={quickSuggestionFlow.isGrantingAiConsent}
          onGrant={quickSuggestionFlow.grantAiConsentForScheduled}
        />

        <DaySummaryPills data={data} timeZone={userTimeZone} />

        <TodayOnDemandSuggestionSection
          suggestions={data.onDemandSuggestions}
          onRecord={(target) => setRecordSlot(target)}
          onEdit={(target, applicationLogId) =>
            setEditSlot({ slot: target, applicationLogId })
          }
          onShowDetail={(target) =>
            target.suggestion ? setDetailSuggestion(target.suggestion) : undefined
          }
          timeZone={userTimeZone}
          nowMs={nowMs}
        />

        {data.slots.length > 0 && data.slots.every((s) => !s.isVisible) ? (
          <LockedDayBanners leadTimeMinutes={data.leadTimeMinutes} />
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
                      personalizationOff={
                        quickSuggestionFlow.aiConsentMissing &&
                        slot.suggestion?.requestSource === "scheduled"
                      }
                      timeZone={userTimeZone}
                      nowMs={nowMs}
                    />
                  </li>
                ))}
              </ul>
            </SectionGroup>
          );
        })}

        <TodayGapRecommendationSection
          {...firstGapRecommendation([...data.slots, ...onDemandSlots])}
        />
      </div>

      <RecordApplicationSheet
        open={recordSlot !== null}
        onOpenChange={(open) => (open ? null : closeRecord())}
        mode={recordSlot ? { kind: "record", slot: recordSlot } : null}
        onSaved={closeRecord}
        timeZone={userTimeZone}
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
        timeZone={userTimeZone}
      />

      <SuggestionDetailDrawer
        open={detailSuggestion !== null}
        onOpenChange={(open) => (open ? null : closeDetail())}
        suggestion={detailSuggestion}
        onMarkApplied={() => {
          openRecordForSuggestion(detailSuggestion);
        }}
        allowRegeneration
      />

      {routineBreakStartDialog}
      {quickSuggestionFlow.dialogs}
    </div>
  );
}
