"use client";

import { GitCompareArrows, RotateCcw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AppRoute } from "@/constants/app-routes";
import { useCompareProducts } from "@/hooks/use-ingredients";
import { useAllShelfProducts } from "@/hooks/use-shelf";
import { useShelfDateContext } from "@/hooks/use-shelf-time-zone";
import { normalizeLocale } from "@/i18n/config";
import { CompareInfoPopover } from "./compare-info-popover";
import { ProductCompareResult } from "./product-compare-result";
import { ProductCompareShelfPicker } from "./product-compare-shelf-picker";
import {
  ProductCompareGoal,
  ProductCompareItemKind,
  type ProductCompareItemInput,
} from "@/types/ingredients";
import {
  ShelfCategoryFilter,
  ShelfSort,
  ShelfStatFilter,
  ShelfStatus,
} from "@/types/shelf";

const MAX_CANDIDATES = 3;

type Props = {
  anchor: ProductCompareItemInput;
  anchorLabel: string;
  excludeProductIds?: string[];
  trigger?: ReactNode;
};

const DEFAULT_FILTERS = {
  stat: ShelfStatFilter.All,
  category: ShelfCategoryFilter.All,
  search: "",
  sort: ShelfSort.RecentlyAdded,
};

export function QuickCheckProductCompareSheet({
  anchor,
  anchorLabel,
  excludeProductIds = [],
  trigger,
}: Props) {
  const t = useTranslations("productCompare.quickCheck.sheet");
  const locale = normalizeLocale(useLocale());
  const shelfDateContext = useShelfDateContext();
  const shelfProducts = useAllShelfProducts(DEFAULT_FILTERS, shelfDateContext);
  const compare = useCompareProducts();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const excluded = new Set(excludeProductIds);
  const candidates = shelfProducts.data.filter(
    (product) =>
      product.status === ShelfStatus.Active &&
      !excluded.has(product.id) &&
      product.identity.inciIngredients.length > 0,
  );

  const hasResult = Boolean(compare.data);
  const isCompareDisabled =
    selectedIds.length === 0 ||
    selectedIds.length > MAX_CANDIDATES ||
    compare.isPending;

  const toggleSelected = (id: string) => {
    setSelectedIds((current) => {
      if (current.includes(id)) {
        return current.filter((itemId) => itemId !== id);
      }
      if (current.length >= MAX_CANDIDATES) {
        return current;
      }
      return [...current, id];
    });
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const runCompare = () => {
    compare.mutate(
      {
        goal: ProductCompareGoal.NewProductDecision,
        anchor,
        candidates: selectedIds.map((productId) => ({
          kind: ProductCompareItemKind.ShelfProduct,
          productId,
        })),
        language: locale,
      },
      {
        onError: () => {
          toast.error(t("error"));
        },
      },
    );
  };

  const buttonContent = (() => {
    if (compare.isPending) {
      return <LoadingIndicator label={t("comparing")} size="sm" />;
    }
    if (hasResult) {
      return (
        <>
          <RotateCcw className="h-4 w-4" aria-hidden />
          {t("compareAgain")}
        </>
      );
    }
    if (selectedIds.length === 0) {
      return (
        <>
          <GitCompareArrows className="h-4 w-4" aria-hidden />
          {t("compareCta")}
        </>
      );
    }
    return (
      <>
        <GitCompareArrows className="h-4 w-4" aria-hidden />
        {t("compareSelected", { count: selectedIds.length })}
      </>
    );
  })();

  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="secondary">
            <GitCompareArrows className="h-4 w-4" aria-hidden />
            {t("trigger")}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
      >
        <header className="shrink-0 border-b border-border bg-surface px-5 pb-4 pt-6">
          <div className="flex items-start justify-between gap-3 pr-8">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <SheetTitle className="font-display text-lg font-bold -tracking-[0.01em] text-foreground">
                  {t("title")}
                </SheetTitle>
                <CompareInfoPopover variant="quickCheck" />
              </div>
              <SheetDescription className="mt-1 text-xs leading-snug text-muted sm:text-sm">
                {t("description")}
              </SheetDescription>
            </div>
            <span
              className={`mt-0.5 shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold tabular-nums ${
                selectedIds.length > 0
                  ? "bg-accent-soft text-accent-strong"
                  : "bg-surface-muted text-muted"
              }`}
            >
              {t("selectionCount", {
                count: selectedIds.length,
                max: MAX_CANDIDATES,
              })}
            </span>
          </div>
        </header>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4">
          <div className="flex flex-col gap-4">
            <section className="rounded-2xl border border-accent/20 bg-accent-soft/40 p-4">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface text-accent-strong">
                  <Sparkles className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted">
                    {t("anchorLabel")}
                  </p>
                  <p className="mt-0.5 font-display text-sm font-bold text-foreground sm:text-[15px]">
                    {anchorLabel}
                  </p>
                </div>
              </div>
            </section>

            {compare.data ? (
              <ProductCompareResult result={compare.data} variant="quickCheck" />
            ) : null}

            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-display text-sm font-bold text-foreground">
                  {t("pickHeading")}
                </h3>
                {selectedIds.length > 0 ? (
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="cursor-pointer text-xs font-semibold text-muted hover:text-foreground"
                  >
                    {t("clearSelection")}
                  </button>
                ) : null}
              </div>
              {candidates.length > 0 ||
              shelfProducts.isLoading ||
              shelfProducts.isFetchingNextPage ? (
                <ProductCompareShelfPicker
                  variant="quickCheck"
                  products={candidates}
                  selectedIds={selectedIds}
                  isLoading={
                    shelfProducts.isLoading || shelfProducts.isFetchingNextPage
                  }
                  maxSelectable={MAX_CANDIDATES}
                  onToggle={toggleSelected}
                />
              ) : (
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface-muted p-6 text-center">
                  <p className="text-sm text-muted">{t("emptyShelf")}</p>
                  <Button asChild size="sm" variant="outline">
                    <Link href={AppRoute.Shelf}>{t("emptyShelfAction")}</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <footer className="shrink-0 border-t border-border bg-surface px-5 py-4">
          <Button
            onClick={runCompare}
            disabled={isCompareDisabled}
            className="w-full"
          >
            {buttonContent}
          </Button>
        </footer>
      </SheetContent>
    </Sheet>
  );
}
