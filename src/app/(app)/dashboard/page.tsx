"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { HeaderContextSubtitle } from "@/components/app/header-context-subtitle";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { DashboardClimatePanel } from "@/components/dashboard/dashboard-climate-panel";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { UpcomingFeatures } from "@/components/dashboard/upcoming-features";
import { CompactSimplificationAlert } from "@/components/skin-journal/simplification-banner";
import { buildJournalUploadHref } from "@/components/skin-journal/journal-navigation";
import { buildHeadline } from "@/components/today-suggestion/today-page-utils";
import { useTodayEntry } from "@/hooks/use-skin-journal";
import { useSkinProfile } from "@/hooks/use-skin-profile";
import { useTodaysSuggestion } from "@/hooks/use-suggestions";
import { useAuthStore } from "@/stores/auth-store";

function todayDateInTimeZone(timeZone: string, nowIso: string): string {
  const now = new Date(nowIso);
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);
  } catch {
    return new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);
  }
}

function isAfterEightAm(value: string): boolean {
  const d = new Date(value);
  return d.getHours() >= 8;
}

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const tNudge = useTranslations("dashboardJournal");
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [renderedAt] = useState(() => new Date().toISOString());
  const { data: today, isLoading } = useTodayEntry();
  const todaysSuggestion = useTodaysSuggestion();
  const skinProfile = useSkinProfile();
  const showNudge = isAfterEightAm(renderedAt) && !today?.entry?.has_photo;
  const timeZone = todaysSuggestion.data?.timeZone ?? user?.timeZone ?? "UTC";
  const headline = useMemo(
    () =>
      buildHeadline(
        todaysSuggestion.data?.date ?? todayDateInTimeZone(timeZone, renderedAt),
        timeZone,
      ),
    [renderedAt, todaysSuggestion.data?.date, timeZone],
  );

  return (
    <div>
      <PageHeader
        title={t("welcome", { firstName: user?.firstName ?? "" })}
        subtitle={
          <HeaderContextSubtitle
            generatedAt={todaysSuggestion.data?.generatedAt ?? renderedAt}
            timeZone={timeZone}
            city={skinProfile.data?.city ?? null}
            locationLoading={skinProfile.isLoading}
            headline={headline}
          />
        }
      />

      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <div className="mx-auto mt-6 flex max-w-4xl flex-col gap-4">
          <CompactSimplificationAlert />
          <DashboardClimatePanel
            environment={todaysSuggestion.data?.environmentSummary ?? null}
          />
          {showNudge ? (
            <div className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center">
                <div
                  aria-hidden
                  className="grid h-14 w-14 shrink-0 place-items-center rounded-[14px] bg-accent-soft text-2xl leading-none"
                >
                  📷
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">
                    {tNudge("missingPhotoTitle")}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {tNudge("missingPhotoBody")}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => router.push(buildJournalUploadHref())}
                >
                  {tNudge("openJournal")}
                </Button>
              </div>
            </div>
          ) : null}

          <UpcomingFeatures />
        </div>
      )}
    </div>
  );
}
