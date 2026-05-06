"use client";

import { Clock4, Info, Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatIsoTime12h } from "@/lib/suggestion-daypart";
import type { ApplicationLog } from "@/types/application-tracking";

type Props = {
  existingLog: ApplicationLog;
  t: ReturnType<typeof useTranslations>;
};

export function ApplicationEditHistoryFooter({ existingLog, t }: Props) {
  return (
    <div className="mb-3">
      <div
        data-testid="application-edit-history-warning"
        className="flex flex-col gap-2 rounded-2xl border border-[color:rgba(184,84,10,0.3)] bg-warning-soft px-3.5 py-3 text-xs leading-snug text-[color:var(--note-warm-fg)]"
      >
        <div className="flex items-center gap-2 font-semibold">
          <Pencil className="h-3.5 w-3.5" />
          <span>{t("editHistory.willMarkAsEdited")}</span>{" "}
          <span className="uppercase tracking-[0.06em]">
            {t("editHistory.editedMarker")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock4 className="h-3.5 w-3.5" />
          {t("editHistory.firstSavedAt", {
            time: formatIsoTime12h(existingLog.firstRecordedAt),
          })}
        </div>
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{t("editHistory.versionsAreKept")}</span>
        </div>
      </div>
    </div>
  );
}
