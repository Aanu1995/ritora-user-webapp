"use client";

import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/app/page-header";

export default function NotificationsPage() {
  const t = useTranslations("sidebar");

  return (
    <div>
      <PageHeader
        title={t("items.notifications")}
        subtitle={t("descriptions.notificationsDescription")}
      />
    </div>
  );
}
