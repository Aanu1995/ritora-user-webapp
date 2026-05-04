"use client";

import {
  Check,
  CircleSlash,
  Clock4,
  Info,
  Package,
  Pencil,
  Repeat2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { formatIsoTime12h } from "@/lib/suggestion-daypart";
import { cn } from "@/lib/utils";
import type {
  ApplicationItemStatus,
  ApplicationLog,
} from "@/types/application-tracking";

export type ApplicationRecordRowState = {
  stepOrder: number;
  suggestionStepId: string | null;
  inventoryProductId: string | null;
  productBrand: string | null;
  productName: string | null;
  stepLabel: string | null;
  status: ApplicationItemStatus;
  substitutedWithProductId: string | null;
  notes: string | null;
};

export function ApplicationRecordRow({
  row,
  disabled = false,
  onChangeStatus,
  t,
}: {
  row: ApplicationRecordRowState;
  disabled?: boolean;
  onChangeStatus: (status: ApplicationItemStatus) => void;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <li className="flex items-start gap-3 border-b border-border py-3 last:border-b-0">
      <div className="grid h-12 w-10 shrink-0 place-items-center rounded-md border border-border bg-surface">
        <Package className="h-4 w-4 text-muted" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        {row.productBrand ? (
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted">
            {row.productBrand}
          </div>
        ) : null}
        <div className="text-sm font-semibold leading-tight text-foreground">
          {row.productName ?? row.stepLabel ?? ""}
        </div>
        <div className="mt-0.5 text-xs text-muted">{t("rowSuggestedTag")}</div>
      </div>
      <div className="flex shrink-0 gap-1">
        <RecordActionButton
          aria-label={t("rowActionApplied")}
          active={row.status === "applied"}
          disabled={disabled}
          onClick={() => onChangeStatus("applied")}
          tone="applied"
        >
          <Check className="h-3.5 w-3.5" />
        </RecordActionButton>
        <RecordActionButton
          aria-label={t("rowActionSkipped")}
          active={row.status === "skipped"}
          disabled={disabled}
          onClick={() => onChangeStatus("skipped")}
          tone="skipped"
        >
          <CircleSlash className="h-3.5 w-3.5" />
        </RecordActionButton>
        <RecordActionButton
          aria-label={t("rowActionSubstituted")}
          active={row.status === "substituted"}
          disabled={disabled}
          onClick={() => onChangeStatus("substituted")}
          tone="substituted"
        >
          <Repeat2 className="h-3.5 w-3.5" />
        </RecordActionButton>
      </div>
    </li>
  );
}

export function ApplicationEditHistoryFooter({
  existingLog,
  t,
}: {
  existingLog: ApplicationLog;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className="mb-3 flex flex-col gap-1.5 rounded-2xl border border-[color:rgba(184,84,10,0.3)] bg-warning-soft px-3.5 py-3 text-xs text-[color:var(--note-warm-fg)]">
      <div className="flex items-center gap-2 font-semibold">
        <Pencil className="h-3 w-3" />
        {t("editHistory.willMarkAsEdited")}
      </div>
      <div className="flex items-center gap-2">
        <Clock4 className="h-3 w-3" />
        {t("editHistory.firstSavedAt", {
          time: formatIsoTime12h(existingLog.firstRecordedAt),
        })}
      </div>
      <div className="flex items-start gap-2">
        <Info className="mt-0.5 h-3 w-3" />
        {t("editHistory.versionsAreKept")}
      </div>
    </div>
  );
}

function RecordActionButton({
  active,
  onClick,
  tone,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  active: boolean;
  tone: "applied" | "skipped" | "substituted";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "grid h-8 w-8 place-items-center rounded-lg border bg-surface text-muted transition",
        active &&
          tone === "applied" &&
          "border-[color:var(--accent)] bg-[color:var(--accent)] text-white",
        active &&
          tone === "skipped" &&
          "border-[color:var(--border-strong)] bg-surface-muted text-foreground",
        active &&
          tone === "substituted" &&
          "border-[color:var(--note-warm-border)] bg-[color:var(--note-warm-bg)] text-[color:var(--note-warm-fg)]",
        !active && "border-border hover:bg-surface-muted",
        rest.disabled && "cursor-not-allowed opacity-60",
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
