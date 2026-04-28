"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { BulkActionToolbar } from "./bulk-action-toolbar";
import { ProductGrid } from "./product-grid";
import { ProductGridSkeleton } from "./product-grid-skeleton";
import { ProductList } from "./product-list";
import { ProductListSkeleton } from "./product-list-skeleton";
import { ShelfEmptyState } from "./shelf-empty-state";
import { ShelfFilterBar } from "./shelf-filter-bar";
import { Button } from "@/components/ui/button";
import {
  ConfirmDialog,
  ConfirmDialogTone,
} from "@/components/ui/confirm-dialog";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { RetryPanel } from "@/components/ui/retry-panel";
import { AppRoute } from "@/constants/app-routes";
import { useAutoLoadMore } from "@/hooks/use-auto-load-more";
import { useShelfDateContext } from "@/hooks/use-shelf-time-zone";
import {
  useArchiveProducts,
  useDeleteProducts,
  useMarkFinished,
  useShelfProducts,
  useShelfStats,
} from "@/hooks/use-shelf";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { saveCurrentAppScrollPosition } from "@/lib/app-scroll-restoration";
import { useShelfUiStore } from "@/stores/shelf-ui-store";
import {
  ShelfCategoryFilter,
  ShelfStatFilter,
  ShelfViewMode,
  type ShelfListFilters,
} from "@/types/shelf";

export function ShelfPage() {
  const t = useTranslations("shelf");
  const tBulk = useTranslations("shelf.bulk");
  const tEmpty = useTranslations("shelf.empty");
  const router = useRouter();
  const shelfDateContext = useShelfDateContext();

  const stat = useShelfUiStore((s) => s.stat);
  const setStat = useShelfUiStore((s) => s.setStat);
  const sort = useShelfUiStore((s) => s.sort);
  const setSort = useShelfUiStore((s) => s.setSort);
  const view = useShelfUiStore((s) => s.view);
  const setView = useShelfUiStore((s) => s.setView);
  const activeCategory = useShelfUiStore((s) => s.activeCategory);
  const setActiveCategory = useShelfUiStore((s) => s.setActiveCategory);
  const search = useShelfUiStore((s) => s.search);
  const setSearch = useShelfUiStore((s) => s.setSearch);
  const selectedIds = useShelfUiStore((s) => s.selectedIds);
  const toggleSelected = useShelfUiStore((s) => s.toggleSelected);
  const clearSelection = useShelfUiStore((s) => s.clearSelection);

  const debouncedSearch = useDebouncedValue(search, 300);
  const filters: ShelfListFilters = useMemo(
    () => ({
      stat,
      category: activeCategory,
      search: debouncedSearch,
      sort,
    }),
    [stat, activeCategory, debouncedSearch, sort],
  );

  const products = useShelfProducts(filters, shelfDateContext);
  const stats = useShelfStats(shelfDateContext);
  const archive = useArchiveProducts();
  const finish = useMarkFinished();
  const remove = useDeleteProducts();

  const selectedArray = useMemo(() => Array.from(selectedIds), [selectedIds]);

  const handleArchive = () => {
    archive.archive(selectedArray, {
      onSuccess: () => {
        toast.success(t("actions.archive"));
        clearSelection();
      },
    });
  };
  const handleFinish = () => {
    finish.markFinished(selectedArray, {
      onSuccess: () => {
        toast.success(t("actions.markFinished"));
        clearSelection();
      },
    });
  };
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const handleDeleteRequest = () => {
    setDeleteConfirmOpen(true);
  };
  const handleDeleteConfirm = () => {
    remove.mutate(selectedArray, {
      onSuccess: () => {
        toast.success(t("actions.delete"));
        setDeleteConfirmOpen(false);
        clearSelection();
      },
    });
  };

  const isLoading = products.isPending;
  const productList = products.data ?? [];
  const hasLoadError = products.isError && productList.length === 0;
  const canLoadMore = Boolean(products.hasNextPage);
  const hasLoadMoreError = Boolean(products.isFetchNextPageError);
  const isEmpty =
    !isLoading &&
    !hasLoadError &&
    productList.length === 0 &&
    stat === ShelfStatFilter.All &&
    activeCategory === ShelfCategoryFilter.All &&
    !debouncedSearch.trim();
  const loadMoreSentinelRef = useAutoLoadMore({
    enabled:
      !isLoading &&
      !hasLoadError &&
      !isEmpty &&
      productList.length > 0 &&
      !hasLoadMoreError,
    hasNextPage: canLoadMore,
    isFetchingNextPage: products.isFetchingNextPage,
    onLoadMore: () => {
      void products.fetchNextPage();
    },
  });

  const navigateFromShelf = (href: string) => {
    saveCurrentAppScrollPosition(AppRoute.Shelf);
    router.push(href);
  };

  let content: ReactNode;

  if (isLoading) {
    content =
      view === ShelfViewMode.List ? (
        <ProductListSkeleton />
      ) : (
        <ProductGridSkeleton />
      );
  } else if (hasLoadError) {
    content = (
      <div className="flex flex-1 items-center justify-center">
        <RetryPanel
          title={t("errors.loadShelfTitle")}
          description={t("errors.loadShelfDescription")}
          actionLabel={t("errors.retry")}
          onAction={() => {
            void products.refetch();
          }}
        />
      </div>
    );
  } else if (isEmpty) {
    content = (
      <div className="flex flex-1 items-center justify-center">
        <ShelfEmptyState
          onAddFirst={() => navigateFromShelf(`${AppRoute.Shelf}/new`)}
        />
      </div>
    );
  } else if (productList.length === 0) {
    content = (
      <p className="rounded-2xl border border-dashed border-border-strong p-8 text-center text-sm text-muted">
        {tEmpty("filtered")}
      </p>
    );
  } else if (view === ShelfViewMode.List) {
    content = (
      <ProductList
        products={productList}
        timeZone={shelfDateContext.timeZone}
        selectedIds={selectedIds}
        onOpen={(id) => navigateFromShelf(`${AppRoute.Shelf}/${id}`)}
        onToggleSelect={toggleSelected}
      />
    );
  } else {
    content = (
      <ProductGrid
        products={productList}
        timeZone={shelfDateContext.timeZone}
        selectedIds={selectedIds}
        onOpen={(id) => navigateFromShelf(`${AppRoute.Shelf}/${id}`)}
        onToggleSelect={toggleSelected}
      />
    );
  }

  const centerEmptyStates = isEmpty || hasLoadError;
  const wrapperPadding = centerEmptyStates ? "pb-2" : "pb-24";
  const wrapperLayout = centerEmptyStates ? "flex min-h-full flex-col" : "";
  const contentLayout = centerEmptyStates ? "flex-1" : "";
  const showAutoLoadState =
    canLoadMore || products.isFetchingNextPage || hasLoadMoreError;

  return (
    <div className={`mx-auto max-w-360 ${wrapperPadding} ${wrapperLayout}`}>
      {/* Sticky composite header — title + subtitle + action, then filter bar */}
      <div className="sticky top-0 z-10 -mx-4 bg-background/95 px-4 pb-3 pt-4 backdrop-blur sm:-mx-6 sm:px-6 sm:pt-6 lg:-mx-8 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {t("title")}
            </h1>
            <p className="mt-0.5 truncate text-xs text-muted sm:text-sm">
              {t("pageSubtitle")}
            </p>
          </div>
          <div className="shrink-0">
            <Button
              size="sm"
              onClick={() => navigateFromShelf(`${AppRoute.Shelf}/new`)}
              aria-label={t("actions.add")}
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t("actions.add")}</span>
            </Button>
          </div>
        </div>

        <div className="mt-4">
          <ShelfFilterBar
            search={search}
            onSearchChange={setSearch}
            status={stat}
            onStatusChange={setStat}
            counts={statsToCounts(stats.data)}
            category={activeCategory}
            onCategoryChange={setActiveCategory}
            sort={sort}
            onSortChange={setSort}
            view={view}
            onViewChange={setView}
          />
        </div>
      </div>

      <div className={`mt-6 flex flex-col gap-5 ${contentLayout}`}>
        {content}

        {showAutoLoadState ? (
          <div className="flex flex-col items-center gap-2 pt-2">
            {hasLoadMoreError ? (
              <>
                <p className="text-sm text-danger" role="alert">
                  {t("errors.loadMore")}
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    void products.fetchNextPage();
                  }}
                >
                  {t("errors.retry")}
                </Button>
              </>
            ) : products.isFetchingNextPage ? (
              <LoadingIndicator label={t("actions.loadingMore")} size="sm" />
            ) : null}
            <div
              ref={loadMoreSentinelRef}
              data-testid="shelf-auto-load-sentinel"
              aria-hidden="true"
              className="h-px w-full"
            />
          </div>
        ) : null}
      </div>

      <BulkActionToolbar
        selectedCount={selectedArray.length}
        onArchive={handleArchive}
        onMarkFinished={handleFinish}
        onDelete={handleDeleteRequest}
        onClear={clearSelection}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title={
          selectedArray.length === 1
            ? tBulk("deleteConfirmTitleSingle")
            : tBulk("deleteConfirmTitle", { count: selectedArray.length })
        }
        description={tBulk("deleteConfirmBody")}
        confirmLabel={t("actions.delete")}
        cancelLabel={tBulk("deleteConfirmCancel")}
        onConfirm={handleDeleteConfirm}
        tone={ConfirmDialogTone.Danger}
        isPending={archive.isPending || finish.isPending || remove.isPending}
      />
    </div>
  );
}

function statsToCounts(
  data: Record<string, number> | undefined,
): Partial<Record<ShelfStatFilter, number>> {
  if (!data) {
    return {};
  }
  const counts: Partial<Record<ShelfStatFilter, number>> = {};
  for (const stat of Object.values(ShelfStatFilter)) {
    if (data[stat] !== undefined) {
      counts[stat] = data[stat];
    }
  }
  return counts;
}
