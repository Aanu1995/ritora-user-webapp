"use client";

import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/app/page-header";
import { UpcomingFeatures } from "@/components/dashboard/upcoming-features";
import { useAuthStore } from "@/stores/auth-store";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const user = useAuthStore((s) => s.user);

  return (
    <div>
      {/* Header stays at the page level so its vertical position matches
          every other page that uses PageHeader (skin-profile, settings,
          todays-suggestion, etc.). */}
      <PageHeader
        title={t("welcome", { firstName: user?.firstName ?? "" })}
        subtitle={t("subtitle")}
      />

      {/* Content is intentionally narrower than the header. */}
      <div className="mx-auto mt-6 flex max-w-4xl flex-col gap-6 pb-24">
        <UpcomingFeatures />
      </div>
    </div>
  );
}
