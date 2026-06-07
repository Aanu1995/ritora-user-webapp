"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { JournalAlertButton } from "@/components/skin-journal/journal-alert-button";

type JournalPageActionsProps = {
  hasTodayEntry: boolean;
  photoActionsDisabled: boolean;
  onOpenUpload: () => void;
};

export function JournalPageActions({
  hasTodayEntry,
  photoActionsDisabled,
  onOpenUpload,
}: JournalPageActionsProps) {
  const t = useTranslations("journal");

  return (
    <div className="flex items-center gap-2">
      <JournalAlertButton />
      <Button
        size="sm"
        onClick={onOpenUpload}
        disabled={hasTodayEntry || photoActionsDisabled}
        aria-label={t("fab")}
        className="w-7 px-0 sm:w-auto sm:px-4"
      >
        <Plus className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{t("fab")}</span>
      </Button>
    </div>
  );
}
