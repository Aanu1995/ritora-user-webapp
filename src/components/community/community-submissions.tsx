"use client";

import {
  AlertTriangle,
  ArrowUpRight,
  FileCheck2,
  PencilLine,
  Quote,
  RefreshCw,
  Trash2,
} from "lucide-react";
import {
  type QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  ConfirmDialog,
  ConfirmDialogTone,
} from "@/components/ui/confirm-dialog";
import { RetryPanel } from "@/components/ui/retry-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryKey } from "@/constants/query-keys";
import { useMyCommunitySubmissions } from "@/hooks/use-community";
import { getApiErrorMessage } from "@/lib/api-error";
import { cn } from "@/lib/utils";
import {
  resubmitCommunityContent,
  withdrawCommunityContent,
} from "@/services/community.service";
import {
  CommunityAutoLoadState,
  useCommunityAutoLoad,
} from "./community-list-pagination";
import {
  buildSubmissionCardState,
  getModerationGuidance,
  getParentNotice,
  getSubmissionViewTarget,
} from "./community-submission-card-utils";
import {
  CommunityPlaybookSubmissionEditSheet,
  CommunityReviewSubmissionEditSheet,
} from "./community-submission-edit-sheet";
import { SubmissionNotice } from "./community-submission-notice";
import {
  CommunityListSkeleton,
  EmptyState,
  InlineSpinner,
} from "./community-shared";

export function MySubmissions() {
  const t = useTranslations("community.submissions");
  const tStatus = useTranslations("community.submissions.status");
  const tType = useTranslations("community.submissions.type");
  const tErrors = useTranslations("community.errors");
  const locale = useLocale();
  const tToast = useTranslations("community.toasts");
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [withdrawId, setWithdrawId] = useState<string | null>(null);

  const query = useMyCommunitySubmissions();

  const resubmit = useMutation({
    mutationFn: (id: string) => resubmitCommunityContent(id),
    onSuccess: () => {
      invalidateCommunityQueries(queryClient);
      toast.success(tToast("resubmitted"));
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error) ?? tToast("resubmitFailed")),
  });

  const withdraw = useMutation({
    mutationFn: (id: string) => withdrawCommunityContent(id),
    onSuccess: () => {
      setWithdrawId(null);
      invalidateCommunityQueries(queryClient);
      toast.success(tToast("withdrawn"));
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error) ?? tToast("withdrawFailed")),
  });

  const items = query.data;
  const loadMoreSentinelRef = useCommunityAutoLoad({
    compact: false,
    hasLoadMoreError: Boolean(query.isFetchNextPageError),
    hasNextPage: Boolean(query.hasNextPage),
    isError: query.isError,
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isPending,
    itemCount: items.length,
    onLoadMore: () => query.fetchNextPage(),
  });
  const showAutoLoadState =
    Boolean(query.hasNextPage) ||
    query.isFetchingNextPage ||
    query.isFetchNextPageError;

  if (query.isPending && query.data.length === 0) {
    return (
      <section
        aria-busy
        className="space-y-4 motion-safe:animate-in motion-safe:fade-in"
      >
        <Skeleton className="h-6 w-56 rounded-md" />
        <CommunityListSkeleton count={3} />
      </section>
    );
  }

  const editingItem = items.find((item) => item.id === editingId) ?? null;
  const editingReview = editingItem?.type === "review" ? editingItem : null;
  const editingRoutine = editingItem?.type === "routine" ? editingItem : null;

  if (query.isError && items.length === 0) {
    return (
      <RetryPanel
        title={tErrors("couldNotLoadTitle")}
        description={tErrors("couldNotLoadBody")}
        actionLabel={tErrors("tryAgain")}
        onAction={() => {
          void query.refetch();
        }}
        hideSupportLink
      />
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={FileCheck2}
        title={t("emptyTitle")}
        body={t("emptyBody")}
      />
    );
  }

  return (
    <section className="space-y-3">
      <header className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-base font-bold tracking-tight text-foreground">
          {t("title")}
        </h2>
        <span className="text-xs font-medium tabular-nums text-muted">
          {t("countLabel", { count: items.length })}
        </span>
      </header>

      <div className="grid grid-cols-1 gap-2">
        {items.map((item) => {
          const card = buildSubmissionCardState(item, {
            locale,
            resultUnknownProduct: t("resultUnknownProduct"),
            typeReview: t("resultOnReview"),
            typePlaybook: t("resultOnPlaybook"),
            typeFallback: t("resultOnFallback"),
            defaultType: tType(item.type),
          });
          const primarySafetyFlag = item.safetyFlags[0] ?? null;
          const guidance = getModerationGuidance(item, primarySafetyFlag, {
            fallbackReason: t("guidanceFallback"),
            guidanceInstruction: t("guidanceInstruction"),
            resultGuidanceInstruction: t("resultGuidanceInstruction"),
          });
          const parentNotice = getParentNotice(item);
          const viewTarget = getSubmissionViewTarget(item);
          const resubmitting =
            resubmit.isPending && resubmit.variables === item.id;
          const withdrawing =
            withdraw.isPending && withdraw.variables === item.id;
          const hasActions =
            card.canEdit || card.canResubmit || card.showWithdraw || viewTarget;

          return (
            <article
              key={item.id}
              className={cn(
                "min-w-0 overflow-hidden rounded-xl border border-border bg-surface p-4 transition hover:border-border-strong",
                card.statusVisual.cardBorderAccent,
              )}
            >
              <header className="flex items-start gap-3">
                <span
                  aria-hidden
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                    card.typeMeta.avatarClass,
                  )}
                >
                  <card.typeMeta.Icon className="h-4 w-4" />
                </span>

                <div className="min-w-0 flex-1">
                  <h3
                    className="break-words font-display text-sm font-bold leading-tight tracking-tight text-foreground sm:text-base [overflow-wrap:anywhere]"
                    title={card.displayTitle}
                  >
                    {card.displayTitle}
                  </h3>
                  <p className="mt-0.5 inline-flex flex-wrap items-center gap-x-1.5 text-[11px] text-muted">
                    <span>{card.typeLabel}</span>
                    {card.submittedRelative ? (
                      <>
                        <span aria-hidden>·</span>
                        <time
                          dateTime={item.createdAt}
                          title={card.submittedAbsolute}
                        >
                          {card.submittedRelative}
                        </time>
                      </>
                    ) : null}
                  </p>
                </div>

                <span
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                    card.statusVisual.pillClass,
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      card.statusVisual.dotClass,
                    )}
                  />
                  {tStatus(item.status)}
                </span>
              </header>

              {primarySafetyFlag &&
              primarySafetyFlag.message !== guidance.reason ? (
                <SubmissionNotice
                  icon={<AlertTriangle className="h-4 w-4" />}
                  title={t("safetyFlagTitleFallback")}
                  body={primarySafetyFlag.message}
                />
              ) : null}

              {guidance.reason ? (
                <SubmissionNotice
                  icon={<AlertTriangle className="h-4 w-4" />}
                  title={t("guidanceTitle")}
                  tag={t(`guidanceSource.${guidance.source}`)}
                  body={guidance.reason}
                  footnote={guidance.instruction}
                />
              ) : null}

              {parentNotice ? (
                <SubmissionNotice
                  icon={<AlertTriangle className="h-4 w-4" />}
                  title={t(parentNotice.titleKey)}
                  tag={tStatus(parentNotice.status)}
                  body={t(parentNotice.bodyKey)}
                />
              ) : null}

              {item.type === "result" && item.editableText ? (
                <blockquote className="mt-3 flex min-w-0 gap-3 rounded-xl border border-accent/20 bg-surface-muted px-3 py-2">
                  <Quote
                    aria-hidden
                    className="mt-0.5 h-4 w-4 shrink-0 text-accent-strong"
                  />
                  <p className="min-w-0 break-words text-sm leading-6 text-foreground line-clamp-4 [overflow-wrap:anywhere]">
                    {item.editableText}
                  </p>
                </blockquote>
              ) : null}

              {hasActions ? (
                <div className="mt-3 flex flex-wrap justify-end gap-2">
                  {card.showWithdraw ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setWithdrawId(item.id)}
                      disabled={withdrawing}
                      /* Destructive intent visible at rest:
                         text + icon render in `text-danger`
                         from the start so users (especially
                         keyboard / touch users who never see
                         hover) can tell the action is
                         destructive without interacting.
                         Hover just adds the soft red fill
                         for click feedback; it doesn't carry
                         the danger identity by itself. */
                      className="text-danger hover:bg-danger-soft hover:text-danger"
                    >
                      {withdrawing ? (
                        <InlineSpinner />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      {withdrawing ? t("withdrawing") : t("withdraw")}
                    </Button>
                  ) : null}
                  {card.canResubmit ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => resubmit.mutate(item.id)}
                      disabled={resubmit.isPending}
                    >
                      {resubmitting ? (
                        <InlineSpinner />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      {resubmitting ? t("resubmitting") : t("resubmit")}
                    </Button>
                  ) : null}
                  {viewTarget ? (
                    <Button size="sm" variant="outline" asChild>
                      <a href={viewTarget.href}>
                        <ArrowUpRight className="h-4 w-4" />
                        {viewTarget.type === "review"
                          ? t("viewReview")
                          : t("viewPlaybook")}
                      </a>
                    </Button>
                  ) : null}
                  {card.canEdit ? (
                    <Button size="sm" onClick={() => setEditingId(item.id)}>
                      <PencilLine className="h-4 w-4" />
                      {t("edit")}
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      {showAutoLoadState ? (
        <CommunityAutoLoadState
          hasLoadMoreError={Boolean(query.isFetchNextPageError)}
          isFetchingNextPage={query.isFetchingNextPage}
          onRetryLoadMore={() => {
            void query.fetchNextPage();
          }}
          sentinelRef={loadMoreSentinelRef}
          testId="community-submissions-auto-load-sentinel"
        />
      ) : null}

      <CommunityPlaybookSubmissionEditSheet
        item={editingRoutine}
        open={editingRoutine !== null}
        onOpenChange={(open) => {
          if (!open) setEditingId(null);
        }}
      />
      <CommunityReviewSubmissionEditSheet
        item={editingReview}
        open={editingReview !== null}
        onOpenChange={(open) => {
          if (!open) setEditingId(null);
        }}
      />
      <ConfirmDialog
        open={withdrawId !== null}
        onOpenChange={(open) => {
          if (!open && !withdraw.isPending) setWithdrawId(null);
        }}
        title={t("withdrawConfirmTitle")}
        description={t("withdrawConfirmBody")}
        confirmLabel={t("withdraw")}
        onConfirm={() => {
          if (withdrawId) withdraw.mutate(withdrawId);
        }}
        tone={ConfirmDialogTone.Danger}
        isPending={withdraw.isPending}
      />
    </section>
  );
}

function invalidateCommunityQueries(queryClient: QueryClient) {
  for (const queryKey of [
    QueryKey.CommunityMySubmissions,
    QueryKey.CommunityHome,
    QueryKey.CommunityPeopleLikeMe,
    QueryKey.CommunityReviews,
    QueryKey.CommunityRoutines,
  ]) {
    void queryClient.invalidateQueries({ queryKey: [queryKey] });
  }
}
