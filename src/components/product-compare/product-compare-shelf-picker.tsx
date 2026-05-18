"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ShelfProduct } from "@/types/shelf";

type Props = {
  variant: "quickCheck" | "shelf";
  products: ShelfProduct[];
  selectedIds: string[];
  isLoading: boolean;
  maxSelectable: number;
  onToggle: (id: string) => void;
};

export function ProductCompareShelfPicker({
  variant,
  products,
  selectedIds,
  isLoading,
  maxSelectable,
  onToggle,
}: Props) {
  const t = useTranslations(`productCompare.${variant}.sheet`);
  const tCat = useTranslations("shelf.category");
  const baseId = useId();
  const isMaxReached = selectedIds.length >= maxSelectable;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {products.map((product) => {
        const checked = selectedIds.includes(product.id);
        const disabled = !checked && isMaxReached;
        const id = `${baseId}-${product.id}`;

        return (
          <div
            key={product.id}
            className={cn(
              "flex items-center gap-3 rounded-xl border p-3 transition",
              checked
                ? "border-accent/40 bg-accent-soft/60"
                : disabled
                  ? "border-border bg-surface opacity-50"
                  : "border-border bg-surface hover:bg-surface-muted",
            )}
          >
            <Checkbox
              id={id}
              checked={checked}
              disabled={disabled}
              onCheckedChange={() => onToggle(product.id)}
              className="cursor-pointer"
            />
            <label
              htmlFor={id}
              className={cn(
                "min-w-0 flex-1",
                disabled ? "cursor-not-allowed" : "cursor-pointer",
              )}
            >
              <span className="block truncate text-sm font-semibold text-foreground">
                {product.identity.brand
                  ? `${product.identity.brand} ${product.identity.name}`
                  : product.identity.name}
              </span>
              <span className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-muted">
                <span className="inline-flex items-center rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em]">
                  {tCat(product.identity.category)}
                </span>
                <span aria-hidden>·</span>
                <span>
                  {t("ingredientCount", {
                    count: product.identity.inciIngredients.length,
                  })}
                </span>
              </span>
            </label>
          </div>
        );
      })}
    </div>
  );
}
