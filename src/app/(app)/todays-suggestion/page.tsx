"use client";

import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/app/page-header";

export default function TodaysSuggestionPage() {
  const t = useTranslations("sidebar");

  return (
    <div>
      <PageHeader
        title={t("items.todaysSuggestion")}
        subtitle={t("descriptions.todaysSuggestionDescription")}
      />
    </div>
  );
}
