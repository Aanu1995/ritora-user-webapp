"use client";

import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/app/page-header";

export default function ShelfPage() {
  const t = useTranslations("sidebar");

  return (
    <div>
      <PageHeader
        title={t("items.shelf")}
        subtitle={t("descriptions.shelfDescription")}
      />
    </div>
  );
}
