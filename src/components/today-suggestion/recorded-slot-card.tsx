"use client";

import { Check, Clock4, Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatIsoTime12h, formatSlotTime12h } from "@/lib/suggestion-daypart";
import { cn } from "@/lib/utils";
import { SuggestionDaypartIcon } from "@/components/today-suggestion/daypart-icon";
import {
  SuggestionModeBadge,
  SuggestionStatusPill,
} from "@/components/today-suggestion/mode-badge";
import { SuggestionStepRow } from "@/components/today-suggestion/step-row";
import type { ApplicationLogItem } from "@/types/application-tracking";
import type { TodaysSuggestionSlot } from "@/types/suggestions";

type Props = {
  slot: TodaysSuggestionSlot;
  applicationLogId: string;
  onEdit?: (slot: TodaysSuggestionSlot, applicationLogId: string) => void;
};

export function RecordedSlotCard({ slot, applicationLogId, onEdit }: Props) {
  const t = useTranslations("todaysSuggestion.slot");
  const suggestion = slot.suggestion!;
  const applicationLog = slot.applicationLog;
  const items = applicationLog?.items ?? [];
  const appliedAt = applicationLog?.appliedAt ?? slot.recording?.appliedAt;

  return (
    <article
      className={cn(
        "rounded-3xl border p-4 shadow-[var(--shadow-soft)]",
        "border-[color:rgba(47,122,82,0.22)] bg-[color:color-mix(in_srgb,var(--surface)_88%,var(--accent-soft))]",
      )}
    >
      <header className="mb-3 flex items-start gap-3">
        <SuggestionDaypartIcon daypart={suggestion.daypart} />
        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-bold leading-tight text-foreground">
            {formatSlotTime12h(slot.slotTime)}
          </p>
          <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
            {t("appliedSummary", {
              count: slot.recording?.appliedCount ?? items.length,
              total: slot.recording?.totalItems ?? suggestion.steps.length,
            })}
          </p>
          {appliedAt ? (
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted">
              <Clock4 className="h-3 w-3" />
              {t("appliedAt", { time: formatIsoTime12h(appliedAt) })}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap justify-end gap-1.5">
          <SuggestionStatusPill
            variant="applied"
            icon={<Check className="h-3 w-3" />}
          >
            {t("applied")}
          </SuggestionStatusPill>
          {slot.recording?.hasBeenEdited ? (
            <SuggestionStatusPill variant="edited">
              {t("edited")}
            </SuggestionStatusPill>
          ) : null}
          <SuggestionModeBadge mode={suggestion.mode} />
        </div>
      </header>

      {items.length > 0 ? (
        <RecordedApplicationList items={items} />
      ) : (
        <ul className="flex flex-col gap-2">
          {suggestion.steps
            .slice()
            .sort((a, b) => a.stepOrder - b.stepOrder)
            .map((step) => (
              <li key={step.id}>
                <SuggestionStepRow step={step} compactApplied />
              </li>
            ))}
        </ul>
      )}

      {applicationLog?.generalNotes ? (
        <p className="mt-3 rounded-2xl bg-surface/70 px-3 py-2 text-xs leading-relaxed text-muted">
          {applicationLog.generalNotes}
        </p>
      ) : null}

      <div className="mt-3.5 flex items-center justify-between">
        <span className="text-xs text-muted">
          {items.length > 0
            ? t("recordedActualItems")
            : t("recordedMatchesSuggestion")}
        </span>
        <button
          type="button"
          onClick={() => onEdit?.(slot, applicationLogId)}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-surface-muted"
        >
          <Pencil className="h-3.5 w-3.5" />
          {t("edit")}
        </button>
      </div>
    </article>
  );
}

function RecordedApplicationList({ items }: { items: ApplicationLogItem[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items
        .slice()
        .sort((a, b) => a.stepOrder - b.stepOrder)
        .map((item) => (
          <li key={item.id}>
            <RecordedApplicationItem item={item} />
          </li>
        ))}
    </ul>
  );
}

function RecordedApplicationItem({ item }: { item: ApplicationLogItem }) {
  const t = useTranslations("todaysSuggestion.slot.recordedItem");
  const product = resolveAppliedProduct(item);
  const suggestedName = [item.productBrand, item.productName]
    .filter(Boolean)
    .join(" ");
  return (
    <div className="rounded-2xl border border-border bg-surface px-3 py-2.5">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
            item.status === "applied" && "bg-accent-soft text-accent-strong",
            item.status === "skipped" && "bg-surface-muted text-muted",
            item.status === "substituted" &&
              "bg-warning-soft text-[color:var(--note-warm-fg)]",
          )}
        >
          {t(item.status)}
        </span>
        <div className="min-w-0 flex-1">
          {product.brand ? (
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
              {product.brand}
            </p>
          ) : null}
          <p className="text-sm font-semibold leading-tight text-foreground">
            {product.name || item.stepLabel || t("unknownProduct")}
          </p>
          {item.status === "substituted" && suggestedName ? (
            <p className="mt-0.5 text-xs text-muted">
              {t("insteadOf", { name: suggestedName })}
            </p>
          ) : null}
          {item.notes || item.substitutionReason ? (
            <p className="mt-1 text-xs leading-snug text-muted">
              {item.substitutionReason ?? item.notes}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function resolveAppliedProduct(item: ApplicationLogItem) {
  if (item.status === "substituted") {
    return {
      brand:
        item.substitutedWithProduct?.brand ??
        item.adHocBrand ??
        item.appliedSnapshot?.brand ??
        null,
      name:
        item.substitutedWithProduct?.name ??
        item.adHocName ??
        item.appliedSnapshot?.name ??
        null,
    };
  }
  return {
    brand: item.product?.brand ?? item.adHocBrand ?? item.productBrand,
    name: item.product?.name ?? item.adHocName ?? item.productName,
  };
}
