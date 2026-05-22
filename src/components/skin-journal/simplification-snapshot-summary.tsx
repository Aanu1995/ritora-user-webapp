"use client";

import { useLocale, useTranslations } from "next-intl";
import { formatJournalShortDate } from "./journal-date";

type SnapshotSlot = {
  steps?: unknown[];
};

type SnapshotSummary = {
  capturedAt: string | null;
  slotCount: number;
  stepCount: number;
};

interface SimplificationSnapshotSummaryProps {
  snapshot: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function summarizeScheduleSnapshot(
  snapshot: unknown,
): SnapshotSummary | null {
  if (!isRecord(snapshot)) {
    return null;
  }

  const slots = Array.isArray(snapshot.slots)
    ? snapshot.slots.filter(isRecord)
    : null;
  if (!slots) {
    return null;
  }

  const stepCount = slots.reduce((count, slot: SnapshotSlot) => {
    return count + (Array.isArray(slot.steps) ? slot.steps.length : 0);
  }, 0);

  return {
    capturedAt:
      typeof snapshot.captured_at === "string" ? snapshot.captured_at : null,
    slotCount: slots.length,
    stepCount,
  };
}

export function SimplificationSnapshotSummary({
  snapshot,
}: SimplificationSnapshotSummaryProps) {
  const locale = useLocale();
  const t = useTranslations("journal.simplification.detail");
  const summary = summarizeScheduleSnapshot(snapshot);

  if (!summary) {
    return (
      <div className="mt-3 rounded-xl border border-border bg-surface-muted p-3 text-sm text-muted">
        {t("unsupportedSnapshot")}
      </div>
    );
  }

  const capturedDate = summary.capturedAt
    ? formatJournalShortDate(summary.capturedAt.slice(0, 10), locale)
    : null;

  return (
    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
      <div className="rounded-xl border border-border bg-surface-muted p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          {t("snapshotSlotsLabel")}
        </p>
        <p className="mt-1 text-lg font-bold">{summary.slotCount}</p>
      </div>
      <div className="rounded-xl border border-border bg-surface-muted p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          {t("snapshotStepsLabel")}
        </p>
        <p className="mt-1 text-lg font-bold">{summary.stepCount}</p>
      </div>
      <div className="rounded-xl border border-border bg-surface-muted p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          {t("snapshotCapturedLabel")}
        </p>
        <p className="mt-1 text-sm font-semibold">
          {capturedDate ?? t("snapshotCapturedUnknown")}
        </p>
      </div>
    </div>
  );
}
