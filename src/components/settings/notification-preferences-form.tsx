"use client";

import { useForm } from "@tanstack/react-form";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { InsightsNotificationSection } from "@/components/settings/insights-notification-section";
import {
  notificationPreferencesSchema,
  type SectionProps,
} from "@/components/settings/notification-form-controls";
import { PhotoReminderSection } from "@/components/settings/photo-reminder-section";
import { QuietHoursSection } from "@/components/settings/quiet-hours-section";
import { ReactionAlertsSection } from "@/components/settings/reaction-alerts-section";
import { TodaysSuggestionSection } from "@/components/settings/todays-suggestion-notification-section";
import { useUpdateNotificationPreferences } from "@/hooks/use-notifications";
import type {
  NotificationPreferences,
  UpdatePreferencesPayload,
} from "@/types/notifications";

export function NotificationPreferencesForm({
  preferences,
}: {
  preferences: NotificationPreferences;
}) {
  const t = useTranslations("settingsNotifications");
  const updatePrefs = useUpdateNotificationPreferences();
  const isSaving = updatePrefs.isPending;

  const form = useForm({
    defaultValues: preferences,
    validators: {
      onChange: notificationPreferencesSchema,
      onSubmit: notificationPreferencesSchema,
    },
  });

  const persistPatch = (
    nextValues: NotificationPreferences,
    patch: UpdatePreferencesPayload,
  ) => {
    const parsed = notificationPreferencesSchema.safeParse(nextValues);
    if (!parsed.success) {
      return;
    }
    updatePrefs.mutate(patch, {
      onError: () => {
        form.reset(preferences);
        toast.error(t("updateFailed"));
      },
    });
  };

  return (
    <form
      className="mt-4 space-y-4"
      onSubmit={(event) => event.preventDefault()}
      noValidate
    >
      <form.Subscribe selector={(state) => state.values}>
        {(values) => {
          const sectionProps: SectionProps = {
            values,
            isSaving,
            form,
            t,
            persistPatch,
          };

          return (
            <>
              <TodaysSuggestionSection {...sectionProps} />
              <QuietHoursSection {...sectionProps} />
              <PhotoReminderSection {...sectionProps} />
              <ReactionAlertsSection {...sectionProps} />
              <InsightsNotificationSection {...sectionProps} />
            </>
          );
        }}
      </form.Subscribe>
    </form>
  );
}
