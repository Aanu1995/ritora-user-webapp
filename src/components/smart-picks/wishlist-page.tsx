"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, Bookmark, Heart } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { RetryPanel } from "@/components/ui/retry-panel";
import { AppRoute } from "@/constants/app-routes";
import {
  useDeleteSmartPicksWishlistItem,
  useSmartPicksWishlist,
} from "@/hooks/use-smart-picks";
import type { SmartPicksWishlistItem } from "@/types/smart-picks";
import type { SuggestionGapActionKind } from "@/types/suggestions";
import { ProductPickPanel } from "./product-pick-panel";
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
          <div className="flex flex-col gap-4">
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

  const handlePanelAction = (
    _pickId: string,
    action: SuggestionGapActionKind,
  ) => {
    if (action === "dismissed") {
      onRemove();
    }
    // "saved" is a no-op — the item is already saved.
  };

  return (
    <article className="rounded-2xl border border-border bg-surface p-4 shadow-soft sm:p-5">
      <div className="min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-[color:rgba(47,122,82,0.32)] bg-accent-soft px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] text-accent-strong">
            <Heart className="h-2.5 w-2.5 fill-current" aria-hidden="true" />
            {t("wishlist.savedBadge")}
          </span>
          {item.goalAlignment ? (
            <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[11px] font-semibold text-accent-strong">
              {item.goalAlignment}
            </span>
          ) : null}
        </div>
        <h2 className="mt-1.5 font-display text-base font-bold leading-tight text-foreground sm:text-[17px]">
          {item.ingredientOrCategory}
        </h2>
        {item.reason ? (
          <p className="mt-2 text-sm leading-6 text-muted">{item.reason}</p>
        ) : null}
        {savedDate ? (
          <p className="mt-1.5 text-xs text-muted">
            {t("wishlist.savedOn", { date: savedDate })}
          </p>
        ) : null}
      </div>

      <ProductPickPanel
        pick={item.pick}
        pendingAction={pending ? "dismissed" : null}
        actionsDisabled={disabled && !pending}
        onAction={handlePanelAction}
        dismissLabel={t("actions.remove")}
        dismissingLabel={t("actions.removing")}
        mode="saved"
      />
    </article>
  );
}
