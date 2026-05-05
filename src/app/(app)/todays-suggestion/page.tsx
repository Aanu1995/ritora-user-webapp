"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bell, History, MoonStar, Moon, Sun } from "lucide-react";
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
import { SuggestionDetailDrawer } from "@/components/today-suggestion/suggestion-detail-drawer";
import { SuggestionSlotCard } from "@/components/today-suggestion/slot-card";
import { TodayGapRecommendationSection } from "@/components/today-suggestion/today-gap-recommendation-section";
import { regenerateSimplifiedSuggestions } from "@/components/today-suggestion/today-normal-routine";
import { TodaysSuggestionSkeleton } from "@/components/today-suggestion/todays-suggestion-skeleton";
import { useApplicationLog } from "@/hooks/use-application-tracking";
import { useAuthStore } from "@/stores/auth-store";
import {
  useNormalRoutineToday,
  useRegenerateSuggestion,
  useTodaysSuggestion,
} from "@/hooks/use-suggestions";
import { NOTIFICATION_SETTINGS_ROUTE } from "@/constants/app-routes";
import type {
  SuggestionDaypart,
  SuggestionGapRecommendation,
  SuggestionInstance,
  TodaysSuggestionSlot,
} from "@/types/suggestions";

export default function TodaysSuggestionPage() {
  const t = useTranslations("todaysSuggestion.page");
  const todaysSuggestion = useTodaysSuggestion();
  const normalRoutine = useNormalRoutineToday();
  const regenerateSuggestion = useRegenerateSuggestion();
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

  if (data && data.slots.length === 0) {
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

  // Compose the daily timeline. Banners sit before the first daypart group.
  return (
    <div>
      <PageHeader
        title={t("title")}
        subtitle={headline}
        action={headerAction}
      />

      <div className="mx-auto w-full lg:w-[70%]">
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

        <RecordingReminderBanner
          slots={data.slots}
          onRecord={(target) => setRecordSlot(target)}
        />

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
    </div>
  );
}

function LockedDayBanners() {
  const t = useTranslations("todaysSuggestion.lockedDay");
  return (
    <div className="mb-3 mt-3 flex flex-col gap-2">
      <div className="flex items-start gap-3 rounded-[18px] border border-[color:var(--note-cool-border)] bg-[color:var(--note-cool-bg)] px-4 py-3.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-[rgba(99,102,241,0.16)] text-[color:var(--note-cool-fg)]">
          <MoonStar className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="mb-0.5 text-sm font-semibold text-[color:var(--note-cool-fg)]">
            {t("leadTitle")}
          </p>
          <p className="text-[12.5px] leading-[1.45] text-muted">
            {t("leadBody")}
          </p>
        </div>
      </div>
      <div className="flex items-start gap-3 rounded-[18px] border border-[color:var(--ai-border)] bg-[color:var(--ai-soft)] px-4 py-3.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-[color:var(--ai-bg)] text-[color:var(--ai-strong)]">
          <Bell className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="mb-0.5 text-sm font-semibold text-[color:var(--ai-fg)]">
            {t("notifyTitle")}
          </p>
          <p className="text-[12.5px] leading-[1.45] text-muted">
            {t.rich("notifyBody", {
              link: (chunks) => (
                <Link
                  href={NOTIFICATION_SETTINGS_ROUTE}
                  className="font-semibold text-[color:var(--ai-fg)]"
                >
                  {chunks}
                </Link>
              ),
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

function SectionGroup({
  daypart,
  children,
}: {
  daypart: SuggestionDaypart;
  children: React.ReactNode;
}) {
  const t = useTranslations("todaysSuggestion.section");
  const Icon = daypart === "evening" ? Moon : Sun;
  return (
    <section className="mt-6">
      <p className="mb-2 ml-1 inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.1em] text-muted">
        <Icon className="h-3 w-3" />
        {t(daypart)}
      </p>
      {children}
    </section>
  );
}

function groupSlotsByDaypart(slots: TodaysSuggestionSlot[]) {
  const grouped: Record<SuggestionDaypart, TodaysSuggestionSlot[]> = {
    morning: [],
    noon: [],
    evening: [],
  };
  for (const slot of slots) {
    grouped[slot.daypart].push(slot);
  }
  for (const daypart of Object.keys(grouped) as SuggestionDaypart[]) {
    grouped[daypart].sort((a, b) => a.slotTime.localeCompare(b.slotTime));
  }
  return grouped;
}

function firstGapRecommendation(slots: TodaysSuggestionSlot[]): {
  suggestionId: string | null;
  recommendation: SuggestionGapRecommendation | null;
} {
  const suggestion = slots.find(
    (slot) => slot.suggestion?.gapRecommendations.length,
  )?.suggestion;
  return {
    suggestionId: suggestion?.id ?? null,
    recommendation: suggestion?.gapRecommendations[0] ?? null,
  };
}

function buildHeadline(
  date: string | undefined,
  timeZone: string,
  now: Date,
): string {
  if (!date) return "";
  try {
    const datePart = new Intl.DateTimeFormat(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      timeZone,
    }).format(new Date(`${date}T12:00:00Z`));
    const timePart = new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
      timeZone,
    }).format(now);
    const cityPart = timeZone.split("/").pop()?.replace(/_/g, " ") ?? timeZone;
    return `${datePart} · ${timePart} · ${cityPart}`;
  } catch {
    return date;
  }
}
