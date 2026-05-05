"use client";

import {
  Check,
  CircleSlash,
  Clock4,
  Info,
  Package,
  Pencil,
  Repeat2,
  Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  ApplicationProductPicker,
  type ApplicationSelectableProduct,
} from "@/components/today-suggestion/application-product-picker";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { formatIsoTime12h } from "@/lib/suggestion-daypart";
import { cn } from "@/lib/utils";
import type {
  ApplicationItemStatus,
  ApplicationLog,
  ApplicationLogVersion,
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
  substitutionReason: string | null;
  isAdHoc: boolean;
  adHocBrand: string | null;
  adHocName: string | null;
  notes: string | null;
  appliedAt: string | null;
};

export function ApplicationRecordRow({
  row,
  disabled = false,
  onChangeStatus,
  onPatch,
  onRemove,
  t,
}: {
  row: ApplicationRecordRowState;
  disabled?: boolean;
  onChangeStatus: (status: ApplicationItemStatus) => void;
  onPatch: (patch: Partial<ApplicationRecordRowState>) => void;
  onRemove?: () => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const selectedSubstitute = row.substitutedWithProductId
    ? t("substitution.selectedShelf")
    : row.isAdHoc && row.status === "substituted"
      ? [row.adHocBrand, row.adHocName].filter(Boolean).join(" ")
      : null;
  return (
    <li className="border-b border-border py-3 last:border-b-0">
      <div className="flex items-start gap-3">
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
            {row.productName ?? row.stepLabel ?? row.adHocName ?? ""}
          </div>
          <div className="mt-0.5 text-xs text-muted">
            {row.suggestionStepId ? t("rowSuggestedTag") : t("rowAddedTag")}
          </div>
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
          {onRemove ? (
            <RecordActionButton
              aria-label={t("rowActionRemove")}
              active={false}
              disabled={disabled}
              onClick={onRemove}
              tone="skipped"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </RecordActionButton>
          ) : null}
        </div>
      </div>
      {row.status === "substituted" ? (
        <div className="mt-3 space-y-2 rounded-2xl bg-surface-muted p-3">
          <p className="text-xs font-semibold text-foreground">
            {selectedSubstitute
              ? t("substitution.selected", { name: selectedSubstitute })
              : t("substitution.chooseProduct")}
          </p>
          <ApplicationProductPicker
            disabled={disabled}
            onSelect={(product) => onSelectSubstitute(product, onPatch)}
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              value={row.adHocBrand ?? ""}
              onChange={(event) =>
                onPatch({
                  isAdHoc: true,
                  substitutedWithProductId: null,
                  adHocBrand: event.target.value,
                })
              }
              disabled={disabled}
              placeholder={t("substitution.offShelfBrand")}
              className="h-10 rounded-xl border border-border bg-surface px-3 text-sm text-foreground"
            />
            <input
              value={row.adHocName ?? ""}
              onChange={(event) =>
                onPatch({
                  isAdHoc: true,
                  substitutedWithProductId: null,
                  adHocName: event.target.value,
                })
              }
              disabled={disabled}
              placeholder={t("substitution.offShelfName")}
              className="h-10 rounded-xl border border-border bg-surface px-3 text-sm text-foreground"
            />
          </div>
          <textarea
            rows={2}
            value={row.substitutionReason ?? ""}
            onChange={(event) =>
              onPatch({ substitutionReason: event.target.value })
            }
            disabled={disabled}
            placeholder={t("substitution.reasonPlaceholder")}
            className="w-full resize-y rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground"
          />
        </div>
      ) : null}
      {row.isAdHoc && !row.suggestionStepId ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <input
            value={row.adHocBrand ?? ""}
            onChange={(event) =>
              onPatch({
                productBrand: event.target.value,
                adHocBrand: event.target.value,
              })
            }
            disabled={disabled}
            placeholder={t("substitution.offShelfBrand")}
            className="h-10 rounded-xl border border-border bg-surface-muted px-3 text-sm text-foreground"
          />
          <input
            value={row.adHocName ?? ""}
            onChange={(event) =>
              onPatch({
                productName: event.target.value,
                adHocName: event.target.value,
              })
            }
            disabled={disabled}
            placeholder={t("substitution.offShelfName")}
            className="h-10 rounded-xl border border-border bg-surface-muted px-3 text-sm text-foreground"
          />
        </div>
      ) : null}
      <input
        value={row.notes ?? ""}
        onChange={(event) => onPatch({ notes: event.target.value })}
        disabled={disabled}
        placeholder={t("rowNotesPlaceholder")}
        className="mt-2 h-9 w-full rounded-xl border border-border bg-surface-muted px-3 text-xs text-foreground"
      />
    </li>
  );
}

function onSelectSubstitute(
  product: ApplicationSelectableProduct,
  onPatch: (patch: Partial<ApplicationRecordRowState>) => void,
) {
  onPatch({
    substitutedWithProductId: product.id,
    isAdHoc: false,
    adHocBrand: null,
    adHocName: null,
  });
}

export function ApplicationEditHistoryFooter({
  existingLog,
  isLoadingVersions,
  t,
  versions,
}: {
  existingLog: ApplicationLog;
  isLoadingVersions: boolean;
  t: ReturnType<typeof useTranslations>;
  versions: ApplicationLogVersion[];
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
      <div className="mt-2 border-t border-[color:rgba(184,84,10,0.18)] pt-2">
        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide">
          {t("editHistory.versionListTitle")}
        </p>
        {isLoadingVersions ? (
          <div className="flex items-center gap-2">
            <LoadingIndicator size="sm" />
            <span>{t("editHistory.loadingVersions")}</span>
          </div>
        ) : versions.length > 0 ? (
          <ol className="flex flex-col gap-1.5">
            {versions.map((version) => (
              <ApplicationVersionRow
                key={version.id}
                version={version}
                t={t}
              />
            ))}
          </ol>
        ) : (
          <p>{t("editHistory.noVersions")}</p>
        )}
      </div>
    </div>
  );
}

function ApplicationVersionRow({
  t,
  version,
}: {
  t: ReturnType<typeof useTranslations>;
  version: ApplicationLogVersion;
}) {
  return (
    <li className="rounded-xl bg-surface/70 px-2.5 py-2 text-[11.5px]">
      <div className="flex items-center justify-between gap-2 font-semibold">
        <span>{t("editHistory.versionLabel", { version: version.version })}</span>
        <span>{formatIsoTime12h(version.editedAt)}</span>
      </div>
      <p className="mt-0.5 leading-snug">
        {version.editReason?.trim() || t("editHistory.initialSave")}
      </p>
    </li>
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
