"use client";

import { useTranslations } from "next-intl";
import { Stethoscope, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { JournalInsight } from "@/types/skin-journal";

interface DoctorReferralCardProps {
  insight: JournalInsight;
  onExport?: () => void;
  onDismiss?: () => void;
}

export function DoctorReferralCard({
  insight,
  onExport,
  onDismiss,
}: DoctorReferralCardProps) {
  const t = useTranslations("journal.insightsTab");
  return (
    <div className="rounded-2xl border border-[color:var(--warning-border)] bg-warning-soft border-l-4 border-l-[color:var(--warning)] p-4">
      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-muted">
        <Stethoscope className="h-3.5 w-3.5" />
        {t("kinds.referral")}
      </span>
      <p className="mt-1.5 text-sm font-bold leading-relaxed">
        {insight.summary}
      </p>
      {insight.supporting_data ? (
        <p className="mt-1 text-xs leading-relaxed text-muted">
          This is a precautionary nudge, not a diagnosis. We can package your
          recent entries into a sharable summary for your appointment.
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button onClick={onExport}>
          <Download className="h-3.5 w-3.5" />
          {t("exportHistory")}
        </Button>
        {onDismiss ? (
          <Button variant="ghost" size="sm" onClick={onDismiss}>
            {t("notNow")}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
