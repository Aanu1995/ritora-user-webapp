"use client";

import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Chip } from "./chip";
import type { ReactionReport } from "@/types/skin-journal";

interface DayDetailReactionReportProps {
  report: ReactionReport;
}

export function DayDetailReactionReport({
  report,
}: DayDetailReactionReportProps) {
  const t = useTranslations("journal.upload.reactionReport");

  return (
    <div className="mt-3 rounded-2xl border border-danger/30 bg-danger-soft/40 p-3.5 sm:p-4">
      <div className="flex items-center gap-2.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-danger text-white">
          <AlertTriangle className="h-4 w-4" />
        </span>
        <p className="text-sm font-semibold text-foreground">
          {t("savedTitle")}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Chip variant="danger" selected>
          {t(`severity.${report.severity}`)}
        </Chip>
        {report.symptoms.map((symptom) => (
          <Chip key={symptom} variant="danger">
            {t(`symptoms.${symptom}`)}
          </Chip>
        ))}
        {report.onset ? <Chip>{t(`onset.${report.onset}`)}</Chip> : null}
        {report.locations?.map((location) => (
          <Chip key={location}>{t(`locations.${location}`)}</Chip>
        ))}
        {report.suspected_trigger ? (
          <Chip variant="warning">
            {t(`triggers.${report.suspected_trigger}`)}
          </Chip>
        ) : null}
      </div>

      {report.red_flags?.length ? (
        <div className="mt-3">
          <p className="mb-1.5 text-xs font-semibold text-danger">
            {t("redFlagsLabel")}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {report.red_flags.map((flag) => (
              <Chip key={flag} variant="danger" selected>
                {t(`redFlags.${flag}`)}
              </Chip>
            ))}
          </div>
        </div>
      ) : null}

      {report.note ? (
        <p className="mt-3 border-l-2 border-danger/30 pl-3 text-sm italic leading-relaxed text-foreground/90">
          &ldquo;{report.note}&rdquo;
        </p>
      ) : null}
    </div>
  );
}
