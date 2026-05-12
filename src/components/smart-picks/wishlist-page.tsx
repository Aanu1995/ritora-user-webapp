"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft, Bookmark, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { RetryPanel } from "@/components/ui/retry-panel";
import { AppRoute } from "@/constants/app-routes";
import {
  useDeleteSmartPicksWishlistItem,
  useSmartPicksWishlist,
} from "@/hooks/use-smart-picks";
import { SMART_PICKS_AVAILABILITY_STATUS } from "@/types/smart-picks";
import { formatPrice } from "./smart-picks-format";
import { SmartPicksSkeleton } from "./smart-picks-skeleton";

export function WishlistPage() {
  const t = useTranslations("smartPicks.page");
  const wishlist = useSmartPicksWishlist();
  const removeItem = useDeleteSmartPicksWishlistItem();

  return (
    <div>
      <PageHeader
        title={t("wishlist.title")}
        subtitle={t("wishlist.subtitle")}
        leading={
          <Link
            href={AppRoute.SmartPicks}
            aria-label={t("actions.back")}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border-strong bg-surface text-foreground hover:bg-accent-soft"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
        }
      />
      <div className="mx-auto mt-6 flex max-w-4xl flex-col gap-5">
        {wishlist.isLoading ? <SmartPicksSkeleton /> : null}
        {wishlist.isError ? (
          <RetryPanel
            title={t("error.title")}
            description={t("error.body")}
            actionLabel={t("error.retry")}
            onAction={() => {
              void wishlist.refetch();
            }}
          />
        ) : null}
        {wishlist.data?.items.length === 0 ? (
          <section
            className="rounded-2xl border border-border bg-surface px-6 py-12 text-center sm:py-16"
            aria-label={t("wishlist.emptyTitle")}
          >
            <div
              className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-accent-soft text-accent-strong sm:h-24 sm:w-24"
              aria-hidden="true"
            >
              <Bookmark className="h-8 w-8" />
            </div>
            <h2 className="mt-4 font-display text-lg font-bold text-foreground">
              {t("wishlist.emptyTitle")}
            </h2>
            <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-muted">
              {t("wishlist.emptyBody")}
            </p>
            <Button asChild className="mt-5" size="sm">
              <Link href={AppRoute.SmartPicks}>
                {t("wishlist.emptyCta")}
              </Link>
            </Button>
          </section>
        ) : null}
        {wishlist.data?.items.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {wishlist.data.items.map((item) => {
              const price = formatPrice(
                item.pick.priceCents,
                item.pick.currency,
              );
              return (
                <article
                  key={item.actionId}
                  className="rounded-lg border border-border bg-surface p-4"
                >
                  <div className="text-xs font-semibold text-muted">
                    {item.ingredientOrCategory}
                  </div>
                  <h2 className="mt-1 text-lg font-bold text-foreground">
                    {item.pick.brand} {item.pick.productName}
                  </h2>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-muted">
                      {t(`availability.status.${item.pick.availabilityStatus}`)}
                    </span>
                    {item.pick.availabilityStatus !==
                    SMART_PICKS_AVAILABILITY_STATUS.Local ? (
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">
                        {t("availability.bestMatch")}
                      </span>
                    ) : null}
                  </div>
                  {item.reason ? (
                    <p className="mt-2 text-sm text-muted">{item.reason}</p>
                  ) : null}
                  {item.pick.recommendationRankReason ? (
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {item.pick.recommendationRankReason}
                    </p>
                  ) : null}
                  {item.pick.retailerDataStale ? (
                    <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
                      {t("retailers.stale")}
                    </p>
                  ) : null}
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-foreground">
                      {price ?? t("wishlist.priceUnavailable")}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={removeItem.isPending}
                      onClick={() => removeItem.mutate(item.actionId)}
                    >
                      {removeItem.isPending ? (
                        <LoadingIndicator size="sm" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      {t("actions.remove")}
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
