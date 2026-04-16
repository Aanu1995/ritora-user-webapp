"use client";

import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/app/page-header";

export default function JournalPage() {
  const t = useTranslations("sidebar");

  return (
    <div>
      <PageHeader
        title={t("items.skinJournal")}
        subtitle={t("descriptions.skinJournalDescription")}
      />
    </div>
  );
}
