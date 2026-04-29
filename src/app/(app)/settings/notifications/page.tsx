"use client";

import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/app/page-header";
import { NotificationsTab } from "@/components/settings/notifications-tab";

export default function SettingsNotificationsPage() {
  const t = useTranslations("settingsNotifications");

  return (
    <div>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <div className="max-w-2xl">
        <NotificationsTab />
      </div>
    </div>
  );
}
