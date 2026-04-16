"use client";

import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/app/page-header";

export default function HistoryPage() {
  const t = useTranslations("sidebar");

  return (
    <div>
      <PageHeader
        title={t("items.history")}
        subtitle={t("descriptions.historyDescription")}
      />
    </div>
  );
}
