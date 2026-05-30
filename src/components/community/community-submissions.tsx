"use client";
import {
  AlertTriangle,
  ArrowUpRight,
  Clock,
  FileCheck2,
  GitBranch,
  MessageSquareText,
  PencilLine,
  RefreshCw,
  Star,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { parseUtcDate, utcNow } from "@/lib/dayjs";
import {
  ConfirmDialog,
  ConfirmDialogTone,
} from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { AppRoute } from "@/constants/app-routes";
import { QueryKey } from "@/constants/query-keys";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  listMyCommunitySubmissions,
  resubmitCommunityContent,
  withdrawCommunityContent,
} from "@/services/community.service";
import type { CommunitySubmission } from "@/types/community";
import {
  CommunityPlaybookSubmissionEditSheet,
  CommunityReviewSubmissionEditSheet,
} from "./community-submission-edit-sheet";
import { SubmissionNotice } from "./community-submission-notice";
import {
  Badge,
  CommunityListSkeleton,
  EmptyState,
  InlineSpinner,
} from "./community-shared";

function statusTone(
  status: CommunitySubmission["status"],
): "muted" | "accent" | "warning" | "danger" | "ai" {
  switch (status) {
    case "published":
      return "accent";
    case "pending_review":
      return "ai";
    case "needs_edit":
      return "warning";
    case "rejected":
    case "hidden":
      return "danger";
    default:
      return "muted";
  }
}

const TYPE_ICON: Record<CommunitySubmission["type"], LucideIcon> = {
  review: Star,
  routine: GitBranch,
  result: MessageSquareText,
};

export function MySubmissions() {
  const t = useTranslations("community.submissions");
  const tStatus = useTranslations("community.submissions.status");
  const tType = useTranslations("community.submissions.type");
  const locale = useLocale();
  const tToast = useTranslations("community.toasts");
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [withdrawId, setWithdrawId] = useState<string | null>(null);
  const query = useQuery({
    queryKey: [QueryKey.CommunityMySubmissions],
    queryFn: ({ signal }) => listMyCommunitySubmissions(signal),
  });
  const resubmit = useMutation({
    mutationFn: (id: string) => resubmitCommunityContent(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [QueryKey.CommunityMySubmissions],
      });
      void queryClient.invalidateQueries({
        queryKey: [QueryKey.CommunityHome],
      });
      void queryClient.invalidateQueries({
        queryKey: [QueryKey.CommunityReviews],
      });
      void queryClient.invalidateQueries({
        queryKey: [QueryKey.CommunityRoutines],
      });
      toast.success(tToast("resubmitted"));
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error) ?? tToast("resubmitFailed")),
  });
  const withdraw = useMutation({
    mutationFn: (id: string) => withdrawCommunityContent(id),
    onSuccess: () => {
      setWithdrawId(null);
      void queryClient.invalidateQueries({
        queryKey: [QueryKey.CommunityMySubmissions],
      });
      void queryClient.invalidateQueries({
        queryKey: [QueryKey.CommunityHome],
      });
      void queryClient.invalidateQueries({
        queryKey: [QueryKey.CommunityReviews],
      });
      void queryClient.invalidateQueries({
        queryKey: [QueryKey.CommunityRoutines],
      });
      toast.success(tToast("withdrawn"));
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error) ?? tToast("withdrawFailed")),
  });
  if (query.isLoading) {
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

  const items = query.data?.items ?? [];
  const editingItem = items.find((item) => item.id === editingId) ?? null;
  const editingReview = editingItem?.type === "review" ? editingItem : null;
  const editingRoutine = editingItem?.type === "routine" ? editingItem : null;

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
    <section className="space-y-4">
      <h2 className="font-display text-lg font-bold tracking-tight text-foreground">
        {t("title")}
      </h2>
      <div className="space-y-3">
        {items.map((item) => {
          const resubmitting =
            resubmit.isPending && resubmit.variables === item.id;
          const isResult = item.type === "result";
          const canEdit =
            !isResult &&
            (item.status === "draft" ||
              item.status === "pending_review" ||
              item.status === "needs_edit" ||
              item.status === "rejected");
          const canResubmit =
            !isResult &&
            (item.status === "needs_edit" || item.status === "rejected");
          const showWithdraw = isResult
            ? item.status !== "hidden"
            : item.status === "published";
          const withdrawing =
            withdraw.isPending && withdraw.variables === item.id;
          const primarySafetyFlag = item.safetyFlags[0] ?? null;
          const needsUserEdits =
            item.status === "needs_edit" || item.status === "rejected";
          const guidanceReason =
            item.moderationGuidance?.reason ??
            (needsUserEdits
              ? (primarySafetyFlag?.message ?? t("guidanceFallback"))
              : null);
          const guidanceSource = item.moderationGuidance?.source ?? "system";
          const guidanceInstruction = isResult
            ? t("resultGuidanceInstruction")
            : t("guidanceInstruction");
          const showPrimarySafetyFlag =
            primarySafetyFlag !== null &&
            primarySafetyFlag.message !== guidanceReason;
          const viewTarget = getSubmissionViewTarget(item);
          const hasActions =
            canEdit || canResubmit || showWithdraw || viewTarget !== null;
          const submittedDate = parseUtcDate(item.createdAt);
          const submittedRelative = submittedDate
            ? submittedDate.locale(locale).fromNow()
            : null;
          const submittedAbsolute = submittedDate
            ? submittedDate.locale(locale).format("LL")
            : undefined;
          const isRecentSubmission =
            submittedDate !== null &&
            submittedDate.isAfter(utcNow().subtract(30, "day"));
          const TypeIcon = TYPE_ICON[item.type];
          const displayTitle =
            item.type === "result"
              ? t("resultTitle", {
                  title: item.parentContent?.title ?? t("resultFallbackTarget"),
                })
              : item.title;
          return (
            <article
              key={item.id}
              className="rounded-2xl border border-border bg-surface p-5 shadow-soft"
            >
              <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="min-w-0 break-words font-display text-base font-bold leading-tight tracking-tight text-foreground">
                    {displayTitle}
                  </h3>
                  <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted">
                    <span className="inline-flex items-center gap-1">
                      <TypeIcon className="h-3.5 w-3.5" aria-hidden />
                      {tType(item.type)}
                    </span>
                    {submittedRelative ? (
                      <>
                        <span aria-hidden>·</span>
                        <time
                          dateTime={item.createdAt}
                          title={submittedAbsolute}
                          className={
                            isRecentSubmission
                              ? "inline-flex items-center gap-1 font-medium text-accent-strong"
                              : "inline-flex items-center gap-1"
                          }
                        >
                          <Clock className="h-3 w-3" aria-hidden />
                          {submittedRelative}
                        </time>
                      </>
                    ) : null}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 sm:shrink-0 sm:justify-end">
                  <Badge tone={statusTone(item.status)}>
                    {tStatus(item.status)}
                  </Badge>
                </div>
              </header>

              {showPrimarySafetyFlag ? (
                <SubmissionNotice
                  icon={<AlertTriangle className="h-4 w-4" />}
                  title={t("safetyFlagTitleFallback")}
                  body={primarySafetyFlag.message}
                />
              ) : null}

              {guidanceReason ? (
                <SubmissionNotice
                  icon={<AlertTriangle className="h-4 w-4" />}
                  title={t("guidanceTitle")}
                  tag={t(`guidanceSource.${guidanceSource}`)}
                  body={guidanceReason}
                  footnote={guidanceInstruction}
                />
              ) : null}

              {isResult && item.editableText ? (
                <blockquote className="mt-3 rounded-xl border-l-4 border-accent bg-surface-muted px-3 py-2 text-sm leading-6 text-foreground">
                  {item.editableText}
                </blockquote>
              ) : null}

              {hasActions ? (
                <div className="mt-4 flex flex-wrap justify-end gap-2">
                  {canEdit ? (
                    <Button
                      size="sm"
                      onClick={() => setEditingId(item.id)}
                    >
                      <PencilLine className="h-4 w-4" />
                      {t("edit")}
                    </Button>
                  ) : null}
                  {canResubmit ? (
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
                  {showWithdraw ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setWithdrawId(item.id)}
                      disabled={withdrawing}
                      className="text-danger hover:border-danger/40 hover:bg-danger-soft hover:text-danger"
                    >
                      {withdrawing ? (
                        <InlineSpinner />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      {withdrawing ? t("withdrawing") : t("withdraw")}
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
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

function getSubmissionViewTarget(
  item: CommunitySubmission,
): { href: string; type: "review" | "routine" } | null {
  if (item.type === "result") {
    return item.parentContent
      ? {
          href: buildCommunityContentHref(
            item.parentContent.type,
            item.parentContent.id,
          ),
          type: item.parentContent.type,
        }
      : null;
  }

  if (item.status !== "published") {
    return null;
  }

  return {
    href: buildCommunityContentHref(item.type, item.id),
    type: item.type,
  };
}

function buildCommunityContentHref(
  type: "review" | "routine",
  id: string,
): string {
  return `${AppRoute.Community}?tab=${
    type === "review" ? "reviews" : "routines"
  }#community-${type}-${id}`;
}
