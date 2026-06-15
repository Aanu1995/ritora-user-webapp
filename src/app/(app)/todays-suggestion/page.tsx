"use client";
import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RetryPanel } from "@/components/ui/retry-panel";
import { NoCurrentSlotEmptyState } from "@/components/today-suggestion/empty-states";
import { onDemandToSlot } from "@/components/today-suggestion/on-demand-suggestion-adapter";
import { SuggestionSlotCard } from "@/components/today-suggestion/slot-card";
import { TodayOnDemandSuggestionSection } from "@/components/today-suggestion/today-on-demand-suggestion-section";
import { TodayGapRecommendationSection } from "@/components/today-suggestion/today-gap-recommendation-section";
import {
  TodayPageDialogs,
  type TodayEditSlot,
} from "@/components/today-suggestion/today-page-dialogs";
import { TodayPageHeader } from "@/components/today-suggestion/today-page-header";
import { TodayStatusStack } from "@/components/today-suggestion/today-status-stack";
import { regenerateSimplifiedSuggestions } from "@/components/today-suggestion/today-normal-routine";
import { useTodayPageClock } from "@/hooks/use-today-page-clock";
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
import {
  JournalUploadMode,
  buildJournalUploadHref,
} from "@/components/skin-journal/journal-navigation";
import { useAuthStore } from "@/stores/auth-store";
import {
  useNormalRoutineToday,
  useRegenerateSuggestion,
  useResumeRoutineBreak,
  useStartRoutineBreak,
  useTodaysSuggestion,
  useUpdateRoutineBreak,
} from "@/hooks/use-suggestions";
import {
  isCapabilityDisabled,
  useUserCapabilities,
} from "@/hooks/use-user-capabilities";
import { AppRoute } from "@/constants/app-routes";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/api-error";
import { isSkinProfileReady } from "@/lib/skin-profile-readiness";
import { useSkinProfile } from "@/hooks/use-skin-profile";
import type {
  SuggestionInstance,
  TodaysSuggestionSlot,
  UpdateRoutineBreakPayload,
} from "@/types/suggestions";

export default function TodaysSuggestionPage() {
  const t = useTranslations("todaysSuggestion.page");
  const tPrerequisites = useTranslations("todaysSuggestion.prerequisites");
  const locale = useLocale();
  const router = useRouter();
  const todaysSuggestion = useTodaysSuggestion();
  const normalRoutine = useNormalRoutineToday();
  const regenerateSuggestion = useRegenerateSuggestion();
  const resumeRoutineBreak = useResumeRoutineBreak();
  const startRoutineBreak = useStartRoutineBreak();
  const updateRoutineBreak = useUpdateRoutineBreak();
  const userTimeZone = useAuthStore((s) => s.user?.timeZone) ?? "UTC";
  const skinProfile = useSkinProfile();
  const capabilities = useUserCapabilities();
  const isAiDisabled = isCapabilityDisabled(capabilities.aiGeneration);
  const canUsePersonalizedActions = isSkinProfileReady(skinProfile.data);
  const profileFetchFailed =
    skinProfile.isError && getApiErrorStatus(skinProfile.error) !== 404;
  const profileDialogDescription = profileFetchFailed
    ? tPrerequisites("profile.loadError")
    : tPrerequisites("profile.body");
  const now = useTodayPageClock();
  const nowMs = now.getTime();

  const data = todaysSuggestion.data;

  const [recordSlot, setRecordSlot] = useState<TodaysSuggestionSlot | null>(
    null,
  );
  const [startBreakOpen, setStartBreakOpen] = useState(false);
  const [profileRequiredOpen, setProfileRequiredOpen] = useState(false);
  const quickSuggestionFlow = useTodayQuickSuggestionFlow({
    disabled: isAiDisabled,
  });
  const [editSlot, setEditSlot] = useState<TodayEditSlot | null>(null);
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
  const openSkinProfile = () => {
    setProfileRequiredOpen(false);
    router.push(AppRoute.SkinProfile);
  };
  const openProfileRequiredDialog = () => {
    if (skinProfile.isLoading) {
      return;
    }

    setProfileRequiredOpen(true);
  };
  const openQuickSuggestion = () => {
    if (!canUsePersonalizedActions) {
      openProfileRequiredDialog();
      return;
    }

    quickSuggestionFlow.openQuickSuggestion();
  };
  const openJournalUpload = () => {
    if (!canUsePersonalizedActions) {
      openProfileRequiredDialog();
      return;
    }

    router.push(`${AppRoute.Journal}/upload`);
  };
  const openReactionReport = () => {
    if (!canUsePersonalizedActions) {
      openProfileRequiredDialog();
      return;
    }

    router.push(
      buildJournalUploadHref({
        mode: JournalUploadMode.Edit,
        reaction: true,
      }),
    );
  };
  const resumeBreak = () => {
    resumeRoutineBreak.mutate(undefined, {
      onSuccess: () => {
        toast.success(t("routineBreakResumed"));
      },
      onError: showRoutineBreakError,
    });
  };
  const updateBreak = (payload: UpdateRoutineBreakPayload) => {
    if (!data?.routineBreak) return;
    updateRoutineBreak.mutate(
      { id: data.routineBreak.id, payload },
      {
        onSuccess: () => {
          toast.success(t("routineBreakResumeUpdated"));
        },
        onError: showRoutineBreakError,
      },
    );
  };
  const resetToNormalRoutine = () => {
    if (isAiDisabled || !data) return;
    normalRoutine.mutate(undefined, {
      onSuccess: () => {
        regenerateSimplifiedSuggestions(data.slots, (id) =>
          regenerateSuggestion.mutate({
            id,
            payload: { reason: "normal_routine_requested" },
          }),
        );
        void todaysSuggestion.refetch();
        toast.success(t("normalRoutineRestored"));
      },
    });
  };

  const groupedSlots = useMemo(
    () => groupSlotsByDaypart(data?.slots ?? []),
    [data?.slots],
  );

  const headline = useMemo(
    () => buildHeadline(data?.date, userTimeZone, locale),
    [data?.date, locale, userTimeZone],
  );
  const pageHeader = (
    <TodayPageHeader
      title={t("title")}
      generatedAt={data?.generatedAt ?? now.toISOString()}
      timeZone={data?.timeZone ?? userTimeZone}
      city={skinProfile.data?.city}
      locationLoading={skinProfile.isLoading}
      headline={headline}
      hasData={Boolean(data)}
      routineBreak={data?.routineBreak}
      quickSuggestionDisabled={isAiDisabled || skinProfile.isLoading}
      onQuickSuggestion={openQuickSuggestion}
      onReportReaction={openReactionReport}
      onStartBreak={() => setStartBreakOpen(true)}
    />
  );
  const pageDialogs = (
    <TodayPageDialogs
      recordSlot={recordSlot}
      editSlot={editSlot}
      editingExistingLog={editingExistingLog}
      detailSuggestion={detailSuggestion}
      startBreakOpen={startBreakOpen}
      isStartingRoutineBreak={startRoutineBreak.isPending}
      quickSuggestionDialogs={quickSuggestionFlow.dialogs}
      profileRequiredOpen={profileRequiredOpen}
      profileGateTitle={tPrerequisites("profile.title")}
      profileGateDescription={profileDialogDescription}
      profileGateConfirmLabel={tPrerequisites("profile.cta")}
      timeZone={userTimeZone}
      onRecordClose={closeRecord}
      onEditClose={closeEdit}
      onDetailClose={closeDetail}
      onMarkDetailApplied={() => openRecordForSuggestion(detailSuggestion)}
      onStartBreakOpenChange={setStartBreakOpen}
      onProfileRequiredOpenChange={setProfileRequiredOpen}
      onProfileGateConfirm={openSkinProfile}
      onStartBreak={(payload) => {
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
        {pageDialogs}
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
        {pageDialogs}
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
          <NoCurrentSlotEmptyState
            nextSlotLabel={t("nextSlotTomorrow")}
            photoActionDisabled={skinProfile.isLoading}
            onPhotoAction={openJournalUpload}
          />
        </div>
        {pageDialogs}
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        {pageHeader}
        <TodaysSuggestionSkeleton />
        {pageDialogs}
      </div>
    );
  }

  return (
    <div>
      {pageHeader}

      <div className="mx-auto w-full lg:w-[70%]">
        <TodayStatusStack
          data={data}
          isResettingReaction={
            normalRoutine.isPending || regenerateSuggestion.isPending
          }
          resetReactionDisabled={isAiDisabled}
          aiConsentMissing={quickSuggestionFlow.aiConsentMissing}
          isGrantingAiConsent={quickSuggestionFlow.isGrantingAiConsent}
          userTimeZone={userTimeZone}
          onGrantAiConsentForScheduled={
            quickSuggestionFlow.grantAiConsentForScheduled
          }
          onRecord={setRecordSlot}
          onResetToNormalRoutine={resetToNormalRoutine}
          onResumeRoutineBreak={resumeBreak}
          onUpdateRoutineBreak={updateBreak}
          routineBreakIsResuming={resumeRoutineBreak.isPending}
          routineBreakIsUpdating={updateRoutineBreak.isPending}
        />

        <TodayOnDemandSuggestionSection
          suggestions={data.onDemandSuggestions}
          onRecord={(target) => setRecordSlot(target)}
          onEdit={(target, applicationLogId) =>
            setEditSlot({ slot: target, applicationLogId })
          }
          onShowDetail={(target) =>
            target.suggestion ? setDetailSuggestion(target.suggestion) : undefined
          }
          retryDisabled={isAiDisabled}
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

      {pageDialogs}
    </div>
  );
}
