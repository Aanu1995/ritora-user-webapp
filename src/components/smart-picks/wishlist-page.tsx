"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, Bookmark, Target, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { RetryPanel } from "@/components/ui/retry-panel";
import { AppRoute } from "@/constants/app-routes";
import {
  useDeleteSmartPicksWishlistItem,
  useSmartPicksWishlist,
} from "@/hooks/use-smart-picks";
import type { SmartPicksWishlistItem } from "@/types/smart-picks";
import { sellerDisplayNames } from "./seller-guidance";
import { SmartPicksSkeleton } from "./smart-picks-skeleton";

export function WishlistPage() {
  const t = useTranslations("smartPicks.page");
  const wishlist = useSmartPicksWishlist();
  const removeItem = useDeleteSmartPicksWishlistItem();
  const pendingActionId = removeItem.isPending
    ? (removeItem.variables ?? null)
    : null;

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
      <div className="mx-auto mt-6 flex max-w-4xl flex-col gap-4">
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
              <Link href={AppRoute.SmartPicks}>{t("wishlist.emptyCta")}</Link>
            </Button>
          </section>
        ) : null}
        {wishlist.data?.items.length ? (
          <div className="flex flex-col gap-3">
            {wishlist.data.items.map((item) => (
              <WishlistCard
                key={item.actionId}
                item={item}
                pending={pendingActionId === item.actionId}
                disabled={removeItem.isPending}
                onRemove={() =>
                  removeItem.mutate(item.actionId, {
                    onSuccess: () => {
                      toast.success(t("feedback.removed"));
                    },
                    onError: () => {
                      toast.error(t("feedback.removeFailed"));
                    },
                  })
                }
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function WishlistCard({
  item,
  pending,
  disabled,
  onRemove,
}: {
  item: SmartPicksWishlistItem;
  pending: boolean;
  disabled: boolean;
  onRemove: () => void;
}) {
  const t = useTranslations("smartPicks.page");
  const locale = useLocale();
  const sellerNames = sellerDisplayNames(item.pick.sellerNames);
  const savedDate = (() => {
    try {
      return new Intl.DateTimeFormat(locale, {
        month: "short",
        day: "numeric",
      }).format(new Date(item.savedAt));
    } catch {
      return null;
    }
  })();
  const whyText = item.reason
    ? item.reason
    : item.goalAlignment
      ? t("wishlist.savedForGoal", { goal: item.goalAlignment })
      : t("wishlist.savedFallback");

  return (
    <article className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted">
            {item.pick.brand}
          </div>
          <h2 className="mt-0.5 font-display text-base font-semibold leading-snug text-foreground sm:text-[17px]">
            {item.pick.productName}
          </h2>
          <p className="mt-2 flex items-start gap-1.5 text-[12.5px] leading-relaxed text-muted">
            <Target
              className="mt-0.5 h-3 w-3 shrink-0 text-accent"
              aria-hidden="true"
            />
            <span>
              {whyText}
              {savedDate ? (
                <span className="text-muted/80">
                  {" · "}
                  {t("wishlist.savedOn", { date: savedDate })}
                </span>
              ) : null}
            </span>
          </p>
          {sellerNames.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {sellerNames.map((name) => (
                <span
                  key={name}
                  className="rounded-full border border-border bg-surface-muted px-2.5 py-0.5 text-[11px] font-medium text-muted"
                >
                  {name}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          aria-label={pending ? t("actions.removing") : t("actions.remove")}
          disabled={disabled}
          onClick={onRemove}
          className="h-8 w-8 shrink-0 rounded-lg p-0 text-muted hover:border-[color:var(--danger)] hover:text-[color:var(--danger)]"
        >
          {pending ? (
            <LoadingIndicator size="sm" />
          ) : (
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          )}
        </Button>
      </div>
    </article>
  );
}
