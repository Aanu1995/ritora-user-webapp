"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ShelfProductPickerPagination } from "@/components/shelf/shelf-product-picker-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { SmoothImage } from "@/components/ui/smooth-image";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useShelfProducts } from "@/hooks/use-shelf";
import { useShelfDateContext } from "@/hooks/use-shelf-time-zone";
import {
  ShelfCategoryFilter,
  ShelfSort,
  ShelfStatFilter,
  ShelfStatus,
  type ShelfProduct,
} from "@/types/shelf";

export type ApplicationSelectableProduct = {
  id: string;
  brand: string;
  name: string;
  category: string;
  imageUrl: string | null;
  status: string;
};

type Props = {
  disabled?: boolean;
  onSelect: (product: ApplicationSelectableProduct) => void;
};

export function ApplicationProductPicker({ disabled, onSelect }: Props) {
  const t = useTranslations("todaysSuggestion.recordSheet.productPicker");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 250);
  const shelfDateContext = useShelfDateContext();
  const productsQuery = useShelfProducts(
    {
      stat: ShelfStatFilter.All,
      category: ShelfCategoryFilter.All,
      search: debouncedSearch,
      sort: ShelfSort.Alphabetical,
    },
    shelfDateContext,
  );
  const products = productsQuery.data ?? [];

  return (
    <div className="rounded-2xl border border-border bg-surface p-3">
      <label className="relative block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          disabled={disabled}
          placeholder={t("searchPlaceholder")}
          className="h-10 w-full rounded-xl border border-[color:var(--border-strong)] bg-surface pl-9 pr-3 text-sm text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
        />
      </label>
      <div className="mt-2 max-h-52 overflow-y-auto">
        {productsQuery.isLoading ? (
          <ul className="space-y-2" aria-label={t("loading")}>
            {Array.from({ length: 3 }).map((_, index) => (
              <li key={index} className="flex items-center gap-2">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </li>
            ))}
          </ul>
        ) : products.length === 0 ? (
          <p className="px-1 py-3 text-sm text-muted">{t("empty")}</p>
        ) : (
          <ul className="space-y-1">
            {products.map((product) => (
              <li key={product.id}>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelect(toSelectableProduct(product))}
                  className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left transition hover:bg-accent-soft disabled:opacity-60"
                >
                  <ProductThumb product={product} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-muted">
                      {product.identity.brand}
                    </span>
                    <span className="block truncate text-sm font-semibold text-foreground">
                      {product.identity.name}
                    </span>
                  </span>
                  {product.status !== ShelfStatus.Active ? (
                    <span className="rounded-full border border-border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
                      {t(statusLabelKey(product.status))}
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        )}
        <ShelfProductPickerPagination
          className="px-2 py-2"
          disabled={disabled}
          hasNextPage={Boolean(productsQuery.hasNextPage)}
          isFetchNextPageError={Boolean(productsQuery.isFetchNextPageError)}
          isFetchingNextPage={productsQuery.isFetchingNextPage}
          loadMoreErrorLabel={t("loadMoreError")}
          loadMoreLabel={t("loadMore")}
          loadingMoreLabel={t("loadingMore")}
          retryLabel={t("retry")}
          onLoadMore={productsQuery.fetchNextPage}
        />
      </div>
    </div>
  );
}

function statusLabelKey(
  status: ShelfStatus,
): "statusActive" | "statusArchived" | "statusFinished" {
  if (status === ShelfStatus.FinishedUp) return "statusFinished";
  if (status === ShelfStatus.Archived) return "statusArchived";
  return "statusActive";
}

function ProductThumb({ product }: { product: ShelfProduct }) {
  const imageUrl = product.identity.imageUrls?.[0] ?? null;
  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-accent-soft/40 text-xs font-bold text-accent-strong">
      {imageUrl ? (
        <SmoothImage
          src={imageUrl}
          alt=""
          sizes="36px"
          className="h-full w-full rounded-lg"
          fallback={
            <span className="grid h-full w-full place-items-center">
              {product.identity.category.slice(0, 1).toUpperCase()}
            </span>
          }
        />
      ) : (
        product.identity.category.slice(0, 1).toUpperCase()
      )}
    </span>
  );
}

function toSelectableProduct(product: ShelfProduct): ApplicationSelectableProduct {
  return {
    id: product.id,
    brand: product.identity.brand,
    name: product.identity.name,
    category: product.identity.category,
    imageUrl: product.identity.imageUrls?.[0] ?? null,
    status: product.status,
  };
}
