"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { HeaderContextSubtitle } from "@/components/app/header-context-subtitle";
import { PageHeader } from "@/components/app/page-header";
import { ContactSupportButton } from "@/components/support/contact-support-button";
import { Button } from "@/components/ui/button";
import { DashboardClimatePanel } from "@/components/dashboard/dashboard-climate-panel";
import { DashboardFreshAccount } from "@/components/dashboard/dashboard-fresh-account";
import { DashboardLatestSuggestion } from "@/components/dashboard/dashboard-latest-suggestion";
import { pickDashboardLatestSlot } from "@/components/dashboard/dashboard-latest-suggestion-utils";
import {
  DashboardGreetingKey,
  getDashboardGreetingKey,
  getDashboardSetupProgress,
  getTodayDateInTimeZone,
  isFreshDashboardAccount,
  shouldShowJournalPhotoNudge,
} from "@/components/dashboard/dashboard-logic";
import { DashboardPromises } from "@/components/dashboard/dashboard-promises";
import { DashboardSetupChecklist } from "@/components/dashboard/dashboard-setup-checklist";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { CompactSimplificationAlert } from "@/components/skin-journal/simplification-banner";
import { buildJournalUploadHref } from "@/components/skin-journal/journal-navigation";
import { buildHeadline } from "@/components/today-suggestion/today-page-utils";
import { useSchedule } from "@/hooks/use-schedule";
import { useShelfStats } from "@/hooks/use-shelf";
import { useShelfDateContext } from "@/hooks/use-shelf-time-zone";
import { useTodayEntry } from "@/hooks/use-skin-journal";
import { useSkinProfile } from "@/hooks/use-skin-profile";
import { useTodaysSuggestion } from "@/hooks/use-suggestions";
import { getApiErrorStatus } from "@/lib/api-error";
import { useAuthStore } from "@/stores/auth-store";

type DashboardHeaderProps = {
  city: string | null;
  firstName: string;
  generatedAt: string;
  greetingKey: DashboardGreetingKey;
  headline: string;
  locationLoading: boolean;
  timeZone: string;
};

function DashboardHeader({
  city,
  firstName,
  generatedAt,
  greetingKey,
  headline,
  locationLoading,
  timeZone,
}: DashboardHeaderProps) {
  const t = useTranslations("dashboard");

  return (
    <PageHeader
      title={t(`greeting.${greetingKey}`, { firstName })}
      subtitle={
        <HeaderContextSubtitle
          generatedAt={generatedAt}
          timeZone={timeZone}
          city={city}
          locationLoading={locationLoading}
          headline={headline}
        />
      }
      action={<ContactSupportButton variant="outline" size="sm" />}
    />
  );
}

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const tNudge = useTranslations("dashboardJournal");
  const locale = useLocale();
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [renderedAt] = useState(() => new Date().toISOString());
  const { data: today, isLoading } = useTodayEntry();
  const todaysSuggestion = useTodaysSuggestion();
  const skinProfile = useSkinProfile();
  const shelfDateContext = useShelfDateContext();
  const shelfStats = useShelfStats(shelfDateContext);
  const schedule = useSchedule();
  const timeZone = todaysSuggestion.data?.timeZone ?? user?.timeZone ?? "UTC";
  const greetingKey = getDashboardGreetingKey(timeZone, renderedAt);
  const headline = useMemo(
    () =>
      buildHeadline(
        todaysSuggestion.data?.date ??
          getTodayDateInTimeZone(timeZone, renderedAt),
        timeZone,
        locale,
      ),
    [locale, renderedAt, todaysSuggestion.data?.date, timeZone],
  );

  const isLoadingDashboard =
    isLoading ||
    skinProfile.isLoading ||
    shelfStats.isLoading ||
    schedule.isLoading ||
    todaysSuggestion.isLoading;
  const profileStatus = getApiErrorStatus(skinProfile.error);
  const isFreshAccount = isFreshDashboardAccount({
    isLoading: isLoadingDashboard,
    profileErrorStatus: skinProfile.isError ? profileStatus : undefined,
    skinProfile: skinProfile.data,
  });
  const { profileDone, routineDone, shelfDone } = getDashboardSetupProgress({
    scheduleSlots: schedule.data?.slots,
    shelfStats: shelfStats.data,
    skinProfile: skinProfile.data,
  });
  const showNudge = shouldShowJournalPhotoNudge({
    hasPhoto: Boolean(today?.entry?.has_photo),
    nowIso: renderedAt,
    timeZone,
  });
  const latestSuggestionSlot = useMemo(
    () => pickDashboardLatestSlot(todaysSuggestion.data),
    [todaysSuggestion.data],
  );

  if (isLoadingDashboard) {
    return (
      <div>
        <DashboardHeader
          city={skinProfile.data?.city ?? null}
          firstName={user?.firstName ?? ""}
          generatedAt={todaysSuggestion.data?.generatedAt ?? renderedAt}
          greetingKey={greetingKey}
          headline={headline}
          locationLoading={skinProfile.isLoading}
          timeZone={timeZone}
        />
        <DashboardSkeleton />
      </div>
    );
  }

  if (isFreshAccount) {
    return (
      <div>
        <PageHeader
          title={t("fresh.welcome", { firstName: user?.firstName ?? "" })}
          subtitle={t("fresh.subtitle")}
          action={<ContactSupportButton variant="outline" size="sm" />}
        />
        <DashboardFreshAccount
          profileDone={profileDone}
          shelfDone={shelfDone}
          routineDone={routineDone}
        />
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader
        city={skinProfile.data?.city ?? null}
        firstName={user?.firstName ?? ""}
        generatedAt={todaysSuggestion.data?.generatedAt ?? renderedAt}
        greetingKey={greetingKey}
        headline={headline}
        locationLoading={skinProfile.isLoading}
        timeZone={timeZone}
      />

      <div className="mx-auto mt-6 flex max-w-4xl flex-col gap-4">
        {skinProfile.data?.city ? (
          <DashboardClimatePanel
            environment={todaysSuggestion.data?.environmentSummary ?? null}
          />
        ) : null}
        {latestSuggestionSlot ? (
          <DashboardLatestSuggestion
            slot={latestSuggestionSlot}
            timeZone={timeZone}
            nowMs={new Date(renderedAt).getTime()}
          />
        ) : null}
        <CompactSimplificationAlert />
        <DashboardSetupChecklist
          profileDone={profileDone}
          shelfDone={shelfDone}
          routineDone={routineDone}
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

        <DashboardPromises />
      </div>
    </div>
  );
}
