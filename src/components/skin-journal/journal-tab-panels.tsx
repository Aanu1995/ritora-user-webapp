"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import {
  CheckInRadarChart,
  ConcernTrendChart,
  ReactionFrequencyChart,
} from "@/components/skin-journal/charts";
import { Chip } from "@/components/skin-journal/chip";
import { DayDetailPanel } from "@/components/skin-journal/day-detail";
import { DoctorReferralCard } from "@/components/skin-journal/doctor-referral-card";
import { InsightCard } from "@/components/skin-journal/insight-card";
import { JournalCalendar } from "@/components/skin-journal/journal-calendar";
import { PhotoGrid } from "@/components/skin-journal/photo-grid";
import { WrappedList } from "@/components/skin-journal/wrapped-list";
import type {
  CalendarPayload,
  DayDetail,
  JournalEntry,
  JournalInsight,
  Wrapped,
} from "@/types/skin-journal";

interface JournalEmptyStateProps {
  icon: string;
  title: string;
  body: string;
  cta?: string;
  onCta?: () => void;
  tone?: "accent" | "ai" | "secondary";
}

interface JournalTabPanelsProps {
  photos: JournalEntry[];
  insights: JournalInsight[];
  wrapped: Wrapped[];
  calendarData: CalendarPayload | undefined;
  calendarLoading: boolean;
  dayDetail: DayDetail | null;
  dayLoading: boolean;
  selectedDate: string;
  todayLocalDate: string;
  monthLabel: string;
  onChangeMonth: (delta: -1 | 1) => void;
  onSelectDate: (date: string) => void;
  onOpenUpload?: () => void;
  onOpenCompare: () => void;
  onOpenExport: () => void;
  onRetryAnalysis: (entry: JournalEntry) => void;
  onReplacePhoto?: (entry: JournalEntry) => void;
  onDeleteEntry: (entry: JournalEntry) => void;
  onDismissInsight: (id: string) => void;
}

function emptyStateToneClass(tone: JournalEmptyStateProps["tone"]): string {
  if (tone === "ai") {
    return "bg-[color:var(--ai-bg)]";
  }

  if (tone === "secondary") {
    return "bg-secondary-soft";
  }

  return "bg-accent-soft";
}

function JournalEmptyState({
  icon,
  title,
  body,
  cta,
  onCta,
  tone = "accent",
}: JournalEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface px-6 py-16 text-center">
      <div
        aria-hidden
        className={`mx-auto grid h-24 w-24 place-items-center rounded-3xl text-[40px] leading-none ${emptyStateToneClass(tone)}`}
      >
        {icon}
      </div>
      <h3 className="mt-4 font-display text-lg font-bold">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-md text-sm text-muted">{body}</p>
      {cta && onCta ? (
        <Button className="mt-4" onClick={onCta}>
          {cta}
        </Button>
      ) : null}
    </div>
  );
}

export function JournalTabPanels({
  photos,
  insights,
  wrapped,
  calendarData,
  calendarLoading,
  dayDetail,
  dayLoading,
  selectedDate,
  todayLocalDate,
  monthLabel,
  onChangeMonth,
  onSelectDate,
  onOpenUpload,
  onOpenCompare,
  onOpenExport,
  onRetryAnalysis,
  onReplacePhoto,
  onDeleteEntry,
  onDismissInsight,
}: JournalTabPanelsProps) {
  const tEmpty = useTranslations("journal.empty");
  const tPhotosTab = useTranslations("journal.photos");
  const tInsights = useTranslations("journal.insightsTab");
  const tWrapped = useTranslations("journal.wrapped");

  const referralInsight = insights.find((insight) => insight.kind === "referral");
  const otherInsights = insights.filter(
    (insight) => insight.kind !== "referral",
  );

  return (
    <div className="mx-auto max-w-5xl">
      <TabsContent value="calendar" className="relative mt-4">
        {photos.length === 0 && !calendarLoading ? (
          <JournalEmptyState
            icon="📸"
            title={tEmpty("title")}
            body={tEmpty("body")}
            cta={tEmpty("addFirst")}
            onCta={onOpenUpload}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:h-[calc(100dvh-260px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:overflow-hidden">
            <div className="min-h-0 lg:overflow-y-auto lg:pr-2">
              <JournalCalendar
                payload={calendarData}
                isLoading={calendarLoading}
                selectedDate={selectedDate}
                onSelectDate={onSelectDate}
                todayLocalDate={todayLocalDate}
                onChangeMonth={onChangeMonth}
                monthLabel={monthLabel}
              />
            </div>
            <div className="min-h-0 lg:overflow-y-auto lg:pr-2">
              <DayDetailPanel
                detail={dayDetail}
                isLoading={dayLoading}
                isToday={selectedDate === todayLocalDate}
                onAddPhoto={onOpenUpload}
                onRetryAnalysis={onRetryAnalysis}
                onReplacePhoto={onReplacePhoto}
                onDeleteEntry={onDeleteEntry}
              />
            </div>
          </div>
        )}
      </TabsContent>

      <TabsContent value="photos" className="mt-4">
        {photos.length === 0 ? (
          <JournalEmptyState
            icon="📸"
            title={tPhotosTab("emptyTitle")}
            body={tPhotosTab("emptyBody")}
            cta={tEmpty("addFirst")}
            onCta={onOpenUpload}
          />
        ) : (
          <>
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 [scrollbar-width:none] sm:flex-wrap [&::-webkit-scrollbar]:hidden">
                <Chip selected variant="accent">
                  {tPhotosTab("filtersAll")}
                </Chip>
                <Chip>{tPhotosTab("filterReaction")}</Chip>
                <Chip>{tPhotosTab("filterAcne")}</Chip>
                <Chip>{tPhotosTab("filterRedness")}</Chip>
                <Chip>{tPhotosTab("filterAngleHeadOn")}</Chip>
                <Chip>{tPhotosTab("filterLast30")}</Chip>
              </div>
              <Button
                size="sm"
                onClick={onOpenCompare}
                className="w-full sm:w-auto"
              >
                {tPhotosTab("compareCta")}
              </Button>
            </div>
            <PhotoGrid entries={photos} />
          </>
        )}
      </TabsContent>

      <TabsContent value="insights" className="mt-4">
        <p className="mb-3 text-sm text-muted">{tInsights("subtitle")}</p>
        {photos.length === 0 ? (
          <JournalEmptyState
            icon="✨"
            title={tInsights("empty.title")}
            body={tInsights("empty.body")}
            tone="ai"
          />
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <ConcernTrendChart entries={photos} />
              <ReactionFrequencyChart entries={photos} />
              <CheckInRadarChart entries={photos} />
            </div>
            <div className="space-y-3">
              {referralInsight ? (
                <DoctorReferralCard
                  insight={referralInsight}
                  onDismiss={() => onDismissInsight(referralInsight.id)}
                  onExport={onOpenExport}
                />
              ) : null}
              {otherInsights.map((insight) => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  onDismiss={() => onDismissInsight(insight.id)}
                />
              ))}
            </div>
          </div>
        )}
      </TabsContent>

      <TabsContent value="wrapped" className="mt-4">
        <div className="mb-4">
          <h3 className="font-display text-lg font-bold">
            {tWrapped("title")}
          </h3>
          <p className="mt-1 text-xs text-muted">{tWrapped("subtitle")}</p>
        </div>
        {wrapped.length === 0 ? (
          <JournalEmptyState
            icon="🎞️"
            title={tWrapped("empty.title")}
            body={tWrapped("empty.body")}
            tone="secondary"
          />
        ) : (
          <WrappedList wrapped={wrapped} />
        )}
      </TabsContent>
    </div>
  );
}
