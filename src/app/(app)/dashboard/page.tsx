"use client";

import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/app/page-header";
import { useAuthStore } from "@/stores/auth-store";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const user = useAuthStore((s) => s.user);

  return (
    <div>
      <PageHeader
        title={t("welcome", { firstName: user?.firstName ?? "" })}
        subtitle={t("subtitle")}
      />
    </div>
  );
}
