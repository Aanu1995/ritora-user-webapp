"use client";

import { useTranslations } from "next-intl";
import { NotificationPreferencesForm } from "@/components/settings/notification-preferences-form";
import { NotificationSettingsSkeleton } from "@/components/settings/notification-settings-skeleton";
import { RetryPanel } from "@/components/ui/retry-panel";
import { useNotificationPreferences } from "@/hooks/use-notifications";
import { useAuthStore } from "@/stores/auth-store";

export function NotificationsTab() {
  const t = useTranslations("settingsNotifications");
  const authLoading = useAuthStore((s) => s.isLoading);
  const preferencesQuery = useNotificationPreferences();
  const prefs = preferencesQuery.data;

  if (authLoading || (!prefs && preferencesQuery.isLoading)) {
    return <NotificationSettingsSkeleton includeHeader={false} />;
  }

  if (!prefs) {
    return (
      <RetryPanel
        title={t("errors.loadTitle")}
        description={t("errors.loadBody")}
        actionLabel={t("errors.retry")}
        onAction={() => {
          void preferencesQuery.refetch();
        }}
      />
    );
  }

  return <NotificationPreferencesForm preferences={prefs} />;
}
