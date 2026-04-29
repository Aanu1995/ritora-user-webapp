"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { UpcomingFeatures } from "@/components/dashboard/upcoming-features";
import { CompactSimplificationAlert } from "@/components/skin-journal/simplification-banner";
import { buildJournalUploadHref } from "@/components/skin-journal/journal-navigation";
import { useTodayEntry } from "@/hooks/use-skin-journal";
import { useAuthStore } from "@/stores/auth-store";

function isAfterEightAm(): boolean {
  const d = new Date();
  return d.getHours() >= 8;
}

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const tNudge = useTranslations("dashboardJournal");
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const { data: today, isLoading } = useTodayEntry();
  const showNudge = isAfterEightAm() && !today?.entry?.has_photo;

  return (
    <div>
      <PageHeader
        title={t("welcome", { firstName: user?.firstName ?? "" })}
        subtitle={t("subtitle")}
      />

      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <div className="mx-auto mt-6 flex max-w-4xl flex-col gap-4">
          <CompactSimplificationAlert />
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
