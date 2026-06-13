"use client";

import { Plus, TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { JournalAlertButton } from "@/components/skin-journal/journal-alert-button";

type JournalPageActionsProps = {
  hasTodayEntry: boolean;
  photoActionsDisabled: boolean;
  onOpenUpload: () => void;
  onReportReaction: () => void;
};

export function JournalPageActions({
  hasTodayEntry,
  photoActionsDisabled,
  onOpenUpload,
  onReportReaction,
}: JournalPageActionsProps) {
  const t = useTranslations("journal");

  return (
    <div className="flex items-center gap-2">
      <JournalAlertButton />
      <Button
        size="sm"
        variant="outline"
        onClick={onReportReaction}
        className="border-danger/40 bg-surface px-2 text-danger hover:-translate-y-0.5 hover:border-danger/40 hover:bg-surface hover:text-danger hover:opacity-95 focus-visible:ring-danger/30 sm:px-3"
      >
        <TriangleAlert className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{t("reportReaction")}</span>
      </Button>
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
