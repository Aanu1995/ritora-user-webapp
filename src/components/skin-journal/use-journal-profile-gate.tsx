"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AppRoute } from "@/constants/app-routes";
import { useSkinProfile } from "@/hooks/use-skin-profile";
import { getApiErrorStatus } from "@/lib/api-error";
import { isSkinProfileReady } from "@/lib/skin-profile-readiness";
import {
  JournalUploadMode,
  buildJournalUploadHref,
} from "@/components/skin-journal/journal-navigation";

interface OpenTodayUploadOptions {
  reaction?: boolean;
}

export function useJournalProfileGate() {
  const t = useTranslations("journal.prerequisites.profile");
  const router = useRouter();
  const skinProfile = useSkinProfile();
  const [profileRequiredOpen, setProfileRequiredOpen] = useState(false);
  const canOpenUpload = isSkinProfileReady(skinProfile.data);
  const profileFetchFailed =
    skinProfile.isError &&
    getApiErrorStatus(skinProfile.error) !== 404;

  const openTodayUpload = (
    mode?: JournalUploadMode,
    options: OpenTodayUploadOptions = {},
  ) => {
    if (!canOpenUpload) {
      setProfileRequiredOpen(true);
      return;
    }

    router.push(buildJournalUploadHref({ mode, reaction: options.reaction }));
  };

  const profileGateDialog = (
    <ConfirmDialog
      open={profileRequiredOpen}
      onOpenChange={setProfileRequiredOpen}
      title={t("title")}
      description={profileFetchFailed ? t("loadError") : t("body")}
      confirmLabel={t("cta")}
      onConfirm={() => {
        setProfileRequiredOpen(false);
        router.push(AppRoute.SkinProfile);
      }}
    />
  );

  return { openTodayUpload, profileGateDialog };
}
