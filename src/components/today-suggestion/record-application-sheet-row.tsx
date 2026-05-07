"use client";

import { Check, CircleSlash, Package, Repeat2, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  ApplicationProductPicker,
  type ApplicationSelectableProduct,
} from "@/components/today-suggestion/application-product-picker";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ApplicationItemStatus } from "@/types/application-tracking";

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
  imageUrl = null,
  disabled = false,
  onChangeStatus,
  onPatch,
  onRemove,
  t,
}: {
  row: ApplicationRecordRowState;
  imageUrl?: string | null;
  disabled?: boolean;
  onChangeStatus: (status: ApplicationItemStatus) => void;
  onPatch: (patch: Partial<ApplicationRecordRowState>) => void;
  onRemove?: () => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const selectedSubstitute = row.substitutedWithProductId
    ? t("substitution.selectedShelf")
    : row.status === "substituted"
      ? [row.adHocBrand, row.adHocName].filter(Boolean).join(" ")
      : null;
  const productLabel = row.productName ?? row.adHocName ?? row.stepLabel ?? "";
  return (
    <li className="border-b border-border py-3 last:border-b-0">
      <TooltipProvider delayDuration={150}>
        <div className="flex items-start gap-3">
          <ProductImageTile
            imageUrl={imageUrl}
            label={productLabel}
            stepOrder={row.stepOrder}
          />
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
            <RecordActionTooltip label={t("tooltips.applied")}>
              <RecordActionButton
                aria-label={t("rowActionApplied")}
                active={row.status === "applied"}
                disabled={disabled}
                onClick={() => onChangeStatus("applied")}
                tone="applied"
              >
                <Check className="h-3.5 w-3.5" />
              </RecordActionButton>
            </RecordActionTooltip>
            <RecordActionTooltip label={t("tooltips.skipped")}>
              <RecordActionButton
                aria-label={t("rowActionSkipped")}
                active={row.status === "skipped"}
                disabled={disabled}
                onClick={() => onChangeStatus("skipped")}
                tone="skipped"
              >
                <CircleSlash className="h-3.5 w-3.5" />
              </RecordActionButton>
            </RecordActionTooltip>
            <RecordActionTooltip label={t("tooltips.substituted")}>
              <RecordActionButton
                aria-label={t("rowActionSubstituted")}
                active={row.status === "substituted"}
                disabled={disabled}
                onClick={() => onChangeStatus("substituted")}
                tone="substituted"
              >
                <Repeat2 className="h-3.5 w-3.5" />
              </RecordActionButton>
            </RecordActionTooltip>
            {onRemove ? (
              <RecordActionTooltip label={t("tooltips.remove")}>
                <button
                  type="button"
                  aria-label={t("rowActionRemove")}
                  disabled={disabled}
                  onClick={onRemove}
                  className={cn(
                    "grid h-8 w-8 place-items-center rounded-lg border border-[color:rgba(179,38,30,0.28)] bg-danger-soft text-[color:var(--danger)] transition hover:bg-[color:rgba(179,38,30,0.18)]",
                    disabled && "cursor-not-allowed opacity-60",
                  )}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </RecordActionTooltip>
            ) : null}
          </div>
        </div>
      </TooltipProvider>
      {row.status === "substituted" ? (
        <div className="mt-3 space-y-2 rounded-2xl border border-[color:rgba(47,122,82,0.22)] bg-accent-soft/40 p-3">
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
              className="h-10 rounded-xl border border-[color:var(--border-strong)] bg-surface px-3 text-sm text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
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
              className="h-10 rounded-xl border border-[color:var(--border-strong)] bg-surface px-3 text-sm text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
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
            className="w-full resize-y rounded-xl border border-[color:var(--border-strong)] bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
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
            className="h-10 rounded-xl border border-[color:var(--border-strong)] bg-surface px-3 text-sm text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
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
            className="h-10 rounded-xl border border-[color:var(--border-strong)] bg-surface px-3 text-sm text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
          />
        </div>
      ) : null}
      <input
        value={row.notes ?? ""}
        onChange={(event) => onPatch({ notes: event.target.value })}
        disabled={disabled}
        placeholder={t("rowNotesPlaceholder")}
        className="mt-2 h-9 w-full rounded-xl border border-[color:var(--border-strong)] bg-surface px-3 text-xs text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
      />
    </li>
  );
}

function RecordActionTooltip({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent sideOffset={6}>{label}</TooltipContent>
    </Tooltip>
  );
}

const PRODUCT_TILE_GRADIENTS: ReadonlyArray<{
  from: string;
  to: string;
  fg: string;
}> = [
  {
    from: "var(--accent-soft)",
    to: "var(--accent-glow)",
    fg: "var(--accent-strong)",
  },
  {
    from: "var(--secondary-soft)",
    to: "var(--accent-soft)",
    fg: "var(--secondary)",
  },
  {
    from: "var(--accent-soft)",
    to: "var(--surface-muted)",
    fg: "var(--accent-strong)",
  },
  {
    from: "var(--note-cool-bg)",
    to: "var(--accent-soft)",
    fg: "var(--note-cool-fg)",
  },
  { from: "var(--ai-soft)", to: "var(--accent-soft)", fg: "var(--ai-fg)" },
  {
    from: "var(--accent-glow)",
    to: "var(--surface)",
    fg: "var(--accent-strong)",
  },
];

function ProductImageTile({
  imageUrl,
  label,
  stepOrder,
}: {
  imageUrl: string | null;
  label: string;
  stepOrder: number;
}) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={label || ""}
        className="h-12 w-10 shrink-0 rounded-md border border-border bg-surface object-cover"
      />
    );
  }
  const seed = (stepOrder + 1) * 17 + label.length * 31;
  const palette = PRODUCT_TILE_GRADIENTS[seed % PRODUCT_TILE_GRADIENTS.length]!;
  const initial = label.trim().charAt(0).toUpperCase();
  return (
    <div
      aria-hidden
      className="grid h-12 w-10 shrink-0 place-items-center rounded-md border border-border text-[12px] font-bold"
      style={{
        background: `linear-gradient(160deg, ${palette.from}, ${palette.to})`,
        color: palette.fg,
      }}
    >
      {initial || <Package className="h-4 w-4" />}
    </div>
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
        "grid h-8 w-8 place-items-center rounded-lg border border-[color:var(--border-strong)] bg-surface text-muted transition",
        active &&
          tone === "applied" &&
          "border-[color:var(--accent)] bg-[color:var(--accent)] text-white",
        active &&
          tone === "skipped" &&
          "border-[color:var(--accent-strong)] bg-accent-soft text-accent-strong",
        active &&
          tone === "substituted" &&
          "border-[color:var(--note-cool-border)] bg-[color:var(--note-cool-bg)] text-[color:var(--note-cool-fg)]",
        !active && "hover:bg-accent-soft hover:text-accent-strong",
        rest.disabled && "cursor-not-allowed opacity-60",
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
