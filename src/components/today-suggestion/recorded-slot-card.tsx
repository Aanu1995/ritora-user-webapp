"use client";

import Image from "next/image";
import { Check, CircleSlash, Info, Pencil, Repeat2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatIsoTime12h, formatSlotTime12h } from "@/lib/suggestion-daypart";
import { cn } from "@/lib/utils";
import { SuggestionDaypartIcon } from "@/components/today-suggestion/daypart-icon";
import {
  SuggestionModeBadge,
  SuggestionStatusPill,
} from "@/components/today-suggestion/mode-badge";
import { productCategoryEmoji } from "@/components/today-suggestion/product-category-icon";
import { SuggestionStepRow } from "@/components/today-suggestion/step-row";
import type {
  ApplicationItemStatus,
  ApplicationLog,
  ApplicationLogItem,
} from "@/types/application-tracking";
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
  const appliedTime = appliedAt ? formatIsoTime12h(appliedAt) : null;
  const appliedCount = slot.recording?.appliedCount ?? items.length;
  const totalItems = slot.recording?.totalItems ?? suggestion.steps.length;

  return (
    <article
      className={cn(
        "rounded-3xl border p-4 shadow-[var(--shadow-soft)]",
        "border-[color:rgba(47,122,82,0.22)] bg-[color:color-mix(in_srgb,var(--surface)_88%,var(--accent-soft))]",
      )}
    >
      <header className="mb-3">
        <div className="flex items-start gap-3">
          <SuggestionDaypartIcon daypart={suggestion.daypart} />
          <p className="min-w-0 flex-1 font-display text-base font-bold leading-tight text-foreground">
            {formatSlotTime12h(slot.slotTime)}
          </p>
          <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
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
        </div>
        <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
          {appliedTime
            ? t("recordedSummary", {
                time: appliedTime,
                count: appliedCount,
                total: totalItems,
              })
            : t("appliedSummary", {
                count: appliedCount,
                total: totalItems,
              })}
        </p>
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

      {slot.recording?.hasBeenEdited ? (
        <EditedNotice applicationLog={applicationLog} items={items} />
      ) : null}

      {applicationLog?.generalNotes ? (
        <p className="mt-3 rounded-2xl bg-surface/70 px-3 py-2 text-xs leading-relaxed text-muted">
          {applicationLog.generalNotes}
        </p>
      ) : null}

      <div className="mt-3.5 flex items-center justify-between">
        <span className="text-xs text-muted">
          {[
            appliedTime ? t("recordedAt", { time: appliedTime }) : null,
            items.length > 0 ? null : t("recordedMatchesSuggestion"),
          ]
            .filter((part): part is string => Boolean(part))
            .join(" ")}
        </span>
        <button
          type="button"
          onClick={() => onEdit?.(slot, applicationLogId)}
          className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--border-strong)] bg-surface px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-accent-soft hover:text-accent-strong"
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
  const detailParts = buildItemDetailParts(item, suggestedName, t);
  const MarkerIcon = markerIconByStatus[item.status];

  return (
    <div
      data-recorded-item-status={item.status}
      className={cn(
        "flex items-start gap-3 rounded-2xl border p-2.5",
        item.status === "applied" &&
          "border-transparent bg-[color:color-mix(in_srgb,var(--surface-muted)_70%,var(--accent-soft))]",
        item.status === "substituted" &&
          "border-[color:rgba(184,84,10,0.24)] bg-[color:color-mix(in_srgb,var(--surface-muted)_72%,var(--warning-soft))]",
        item.status === "skipped" &&
          "border-transparent bg-surface-muted opacity-80",
      )}
    >
      <span
        data-testid="recorded-item-marker"
        className={cn(
          "mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full",
          item.status === "applied" && "bg-[color:var(--accent)] text-white",
          item.status === "substituted" &&
            "bg-warning-soft text-[color:var(--warning)]",
          item.status === "skipped" && "bg-surface text-muted",
        )}
        aria-label={t(item.status)}
      >
        <MarkerIcon className="h-3.5 w-3.5" />
      </span>

      <div className="grid h-12 w-10 shrink-0 place-items-center overflow-hidden rounded-md bg-surface text-base">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt=""
            width={40}
            height={48}
            className="h-full w-full object-cover"
          />
        ) : (
          <span aria-hidden>{productCategoryEmoji(product.category)}</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        {product.brand ? (
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
            {product.brand}
          </p>
        ) : null}
        <p className="text-sm font-semibold leading-tight text-foreground">
          {product.name || item.stepLabel || t("unknownProduct")}
        </p>
        {detailParts.length > 0 ? (
          <p className="mt-1 text-[11.5px] leading-snug text-muted">
            {detailParts.join(" · ")}
          </p>
        ) : null}
        {item.notes || item.substitutionReason ? (
          <p className="mt-1 text-xs leading-snug text-muted">
            {item.substitutionReason ?? item.notes}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function EditedNotice({
  applicationLog,
  items,
}: {
  applicationLog: ApplicationLog | null | undefined;
  items: ApplicationLogItem[];
}) {
  const t = useTranslations("todaysSuggestion.slot");
  const substitution = findSubstitutionSummary(items);
  const parts = [
    applicationLog?.lastEditedAt
      ? t("editedAt", { time: formatIsoTime12h(applicationLog.lastEditedAt) })
      : null,
    substitution
      ? t("editedSubstitutionSummary", substitution)
      : applicationLog?.editReason,
  ].filter((part): part is string => Boolean(part));

  if (parts.length === 0) return null;

  return (
    <div className="mt-3 flex items-start gap-2 rounded-xl border border-[color:rgba(184,84,10,0.3)] bg-warning-soft px-3 py-2 text-[11.5px] leading-snug text-[color:var(--note-warm-fg)]">
      <Info className="mt-0.5 h-3 w-3 shrink-0" />
      <span>{parts.join(" ")}</span>
    </div>
  );
}

const markerIconByStatus: Record<ApplicationItemStatus, typeof Check> = {
  applied: Check,
  skipped: CircleSlash,
  substituted: Repeat2,
};

function buildItemDetailParts(
  item: ApplicationLogItem,
  suggestedName: string,
  t: ReturnType<typeof useTranslations>,
): string[] {
  const parts: string[] = [];

  if (item.status === "substituted" && suggestedName) {
    parts.push(t("insteadOf", { name: suggestedName }));
  } else {
    parts.push(t(item.status));
  }

  if (item.itemSource !== "recommended") {
    parts.push(t("addedByYou"));
  }

  if (item.appliedAt) {
    parts.push(t("itemAppliedAt", { time: formatIsoTime12h(item.appliedAt) }));
  }

  return parts;
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
      imageUrl: item.substitutedWithProduct?.imageUrl ?? null,
      category:
        item.substitutedWithProduct?.category ??
        item.appliedSnapshot?.step_label ??
        item.stepLabel,
    };
  }
  return {
    brand: item.product?.brand ?? item.adHocBrand ?? item.productBrand,
    name: item.product?.name ?? item.adHocName ?? item.productName,
    imageUrl: item.product?.imageUrl ?? null,
    category:
      item.product?.category ??
      item.appliedSnapshot?.step_label ??
      item.stepLabel,
  };
}

function findSubstitutionSummary(items: ApplicationLogItem[]) {
  const item = items.find((candidate) => candidate.status === "substituted");
  if (!item) return null;

  const from = [item.productBrand, item.productName].filter(Boolean).join(" ");
  const product = resolveAppliedProduct(item);
  const to = [product.brand, product.name].filter(Boolean).join(" ");

  if (!from || !to) return null;
  return { from, to };
}
