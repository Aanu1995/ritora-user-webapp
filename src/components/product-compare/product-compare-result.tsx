"use client";

import {
  AlertTriangle,
  Award,
  HelpCircle,
  Layers,
  ShieldAlert,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  AnalysisSeverity,
  type ProductCompareItemResult,
  type ProductCompareReason,
  type ProductCompareResponse,
} from "@/types/ingredients";

type Props = {
  result: ProductCompareResponse;
  variant: "quickCheck" | "shelf";
};

type ItemPalette = {
  card: string;
  chip: string;
};

// Each item in the comparison gets a distinct identity color so the user can
// visually track "which product is which" while reading reasons and stats.
// Index 0 = the anchor (the product just checked), 1+ are the candidates.
const ITEM_PALETTE: readonly ItemPalette[] = [
  {
    card: "border-accent/30 bg-accent-soft",
    chip: "bg-surface text-accent-strong",
  },
  {
    card: "border-secondary/30 bg-secondary-soft",
    chip: "bg-surface text-secondary",
  },
  {
    card: "border-ai-border bg-ai-bg/40",
    chip: "bg-surface text-ai-fg",
  },
  {
    card: "border-warning/30 bg-warning-soft/70",
    chip: "bg-surface text-warning",
  },
];

const SEVERITY_REASON: Record<AnalysisSeverity, string> = {
  [AnalysisSeverity.High]:
    "border-danger/30 bg-danger-soft/60 text-foreground",
  [AnalysisSeverity.Medium]:
    "border-warning/30 bg-warning-soft/60 text-foreground",
  [AnalysisSeverity.Low]: "border-border bg-surface text-foreground",
};

export function ProductCompareResult({ result, variant }: Props) {
  const t = useTranslations(`productCompare.${variant}.result`);
  const winner = result.items.find(
    (item) => item.itemId === result.comparison.winnerItemId,
  );
  const Icon = winner ? Award : HelpCircle;

  return (
    <section className="animate-slide-up rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-soft)]">
      <header className="flex items-start gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-strong">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted">
            {t("eyebrow")}
          </p>
          <h3 className="mt-0.5 font-display text-sm font-bold text-foreground sm:text-[15px]">
            {t(`outcomes.${result.comparison.outcome}`, {
              product: winner?.name ?? t("noWinnerProduct"),
            })}
          </h3>
          <p className="mt-1 text-xs leading-snug text-muted sm:text-[13px]">
            {result.comparison.summary}
          </p>
        </div>
      </header>

      <div className="mt-4 flex flex-col gap-2">
        {result.items.map((item, index) => (
          <ProductCompareItemCard
            key={item.itemId}
            item={item}
            variant={variant}
            isWinner={item.itemId === result.comparison.winnerItemId}
            palette={ITEM_PALETTE[index % ITEM_PALETTE.length]}
          />
        ))}
      </div>

      {result.comparison.reasons.length > 0 ? (
        <ul className="mt-4 flex flex-col gap-1.5">
          {result.comparison.reasons.map((reason, index) => (
            <ReasonLine
              key={`${reason.code}:${reason.itemIds.join(",")}:${index}`}
              reason={reason}
              variant={variant}
            />
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function ProductCompareItemCard({
  item,
  variant,
  isWinner,
  palette,
}: {
  item: ProductCompareItemResult;
  variant: "quickCheck" | "shelf";
  isWinner: boolean;
  palette: ItemPalette;
}) {
  const t = useTranslations(`productCompare.${variant}.result`);
  const tCat = useTranslations("shelf.category");

  return (
    <article
      className={cn(
        "relative rounded-xl border p-3 transition",
        palette.card,
        isWinner && "ring-2 ring-accent-strong/50",
      )}
    >
      {isWinner ? (
        <span className="mb-1.5 inline-flex items-center gap-1 rounded-full bg-accent-strong px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-background">
          <Award className="h-2.5 w-2.5" aria-hidden />
          {t("winner")}
        </span>
      ) : null}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {item.brand ? `${item.brand} ${item.name}` : item.name}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-muted">
            <span className="inline-flex items-center rounded-full bg-surface/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-foreground">
              {tCat(item.category)}
            </span>
            {item.safetyScore !== null ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums",
                  palette.chip,
                )}
              >
                {item.safetyScore}
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-surface/80 px-2 py-0.5 text-[10px] font-semibold text-muted">
                {t("unknownScore")}
              </span>
            )}
            <span aria-hidden>·</span>
            <span>{t(`confidence.${item.confidence}`)}</span>
          </div>
        </div>
      </div>

      {item.keyActives.length > 0 ? (
        <p className="mt-2 text-[11px] leading-snug text-foreground/80 sm:text-xs">
          {t("keyActives", { actives: item.keyActives.join(", ") })}
        </p>
      ) : null}

      {item.conflictCount > 0 ||
      item.overlapCount > 0 ||
      item.reactionEvidenceCount > 0 ? (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {item.conflictCount > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-warning/30 bg-surface/80 px-2 py-0.5 text-[10px] font-semibold text-warning">
              <AlertTriangle className="h-2.5 w-2.5" aria-hidden />
              {t("stats.conflicts", { count: item.conflictCount })}
            </span>
          ) : null}
          {item.overlapCount > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface/80 px-2 py-0.5 text-[10px] font-semibold text-muted">
              <Layers className="h-2.5 w-2.5" aria-hidden />
              {t("stats.overlaps", { count: item.overlapCount })}
            </span>
          ) : null}
          {item.reactionEvidenceCount > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-danger/30 bg-surface/80 px-2 py-0.5 text-[10px] font-semibold text-danger">
              <ShieldAlert className="h-2.5 w-2.5" aria-hidden />
              {t("stats.reactions", { count: item.reactionEvidenceCount })}
            </span>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function ReasonLine({
  reason,
  variant,
}: {
  reason: ProductCompareReason;
  variant: "quickCheck" | "shelf";
}) {
  const t = useTranslations(`productCompare.${variant}.result`);
  const toneClass = reason.severity
    ? SEVERITY_REASON[reason.severity]
    : SEVERITY_REASON[AnalysisSeverity.Low];

  return (
    <li
      className={cn(
        "rounded-xl border px-3 py-2 text-xs leading-snug sm:text-[13px]",
        toneClass,
      )}
    >
      {t(`reasons.${reason.code}`)}
      {reason.ingredientNames.length > 0 ? (
        <span className="text-muted">
          {" "}
          {t("ingredients", {
            ingredients: reason.ingredientNames.join(", "),
          })}
        </span>
      ) : null}
    </li>
  );
}
