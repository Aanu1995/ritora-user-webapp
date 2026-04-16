"use client";

import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/app/page-header";

export default function InsightsPage() {
  const t = useTranslations("sidebar");

  return (
    <div>
      <PageHeader
        title={t("items.insights")}
        subtitle={t("descriptions.insightsDescription")}
      />
    </div>
  );
}
