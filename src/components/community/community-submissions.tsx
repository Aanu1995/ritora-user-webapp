"use client";
import {
  AlertTriangle,
  Clock,
  FileCheck2,
  GitBranch,
  PencilLine,
  RefreshCw,
  Star,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { parseUtcDate, utcNow } from "@/lib/dayjs";
import {
  ConfirmDialog,
  ConfirmDialogTone,
} from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
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

/* Type → Icon mapping. Used as a leading glyph next to the title
 * meta so the user can tell their review submissions apart from
 * their playbook submissions at a glance. Matches the icons used
 * elsewhere in the community feature (Star for reviews on the
 * sidebar tab, GitBranch for playbooks). */
const TYPE_ICON: Record<CommunitySubmission["type"], LucideIcon> = {
  review: Star,
  routine: GitBranch,
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
          const canEdit =
            item.status === "draft" ||
            item.status === "pending_review" ||
            item.status === "needs_edit" ||
            item.status === "rejected";
          const canResubmit =
            item.status === "needs_edit" || item.status === "rejected";
          const showWithdraw = item.status === "published";
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
          const showPrimarySafetyFlag =
            primarySafetyFlag !== null &&
            primarySafetyFlag.message !== guidanceReason;
          const hasActions = canEdit || canResubmit || showWithdraw;
          /* Submission date: backend doesn't expose a separate
           * `publishedAt`, but `createdAt` is the closest signal
           * of when the user posted the submission. Rendered in
           * the meta line as a localized relative time so the
           * user can tell at a glance how stale each submission
           * is; absolute date stays in `<time title>` for hover.
           * Tone-coded: posts under 30 days old read as recent
           * (accent), older ones read as muted. */
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
          return (
            <article
              key={item.id}
              className="rounded-2xl border border-border bg-surface p-5 shadow-soft"
            >
              {/* Header layout:
                  - Mobile: title block stacks on top, status
                    badge + date cluster wraps to its own row
                    below, left-aligned. Gives the title full
                    card width to breathe.
                  - sm+: title block on the left, status cluster
                    right-aligned, same row.
                  The previous layout crammed title + type chip
                  + status chip into one flex-wrap row, so on
                  narrow phones the chips elbowed the title down. */}
              <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="min-w-0 break-words font-display text-base font-bold leading-tight tracking-tight text-foreground">
                    {item.title}
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
                  footnote={t("guidanceInstruction")}
                />
              ) : null}

              {hasActions ? (
                <div className="mt-4 flex flex-wrap justify-end gap-2">
                  {canEdit ? (
                    // Edit is the recommended path: the guidance
                    // notice tells the user to "change the parts
                    // called out below, then save edits." So it
                    // gets the primary (default-filled) variant
                    // and an icon for parity with the other two
                    // buttons. Previously rendered as another
                    // outline, identical to Resubmit, with no
                    // visual hierarchy.
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

/* ===========================================================
 * SubmissionNotice
 *
 * Pending-state notice block (icon avatar + title + optional
 * source tag + body + optional footnote). Spans the full card
 * width, soft warning fill, body in `text-foreground` so the
 * actionable copy reads at full contrast instead of competing
 * with the warning hue. Shares the same look as the eligibility
 * gate's pending items so the two surfaces feel like one
 * design language.
 * ========================================================= */

function SubmissionNotice({
  body,
  footnote,
  icon,
  tag,
  title,
}: {
  body: string;
  footnote?: string;
  icon: ReactNode;
  tag?: string;
  title: string;
}) {
  return (
    <div className="mt-3 flex gap-3 rounded-xl border border-warning/30 bg-warning-soft/40 px-3 py-3">
      <span
        aria-hidden
        // `text-surface` auto-inverts for theme: white in light
        // mode (high contrast on dark amber `--warning`), dark
        // in dark mode (high contrast on light amber `--warning`).
        // Using a literal `text-white` here would wash out
        // against dark mode's lighter `--warning` shade.
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-warning text-surface"
      >
        {icon}
      </span>
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          {tag ? (
            <span className="inline-flex items-center rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] font-medium text-muted">
              {tag}
            </span>
          ) : null}
        </div>
        <p className="text-sm leading-5 text-foreground">{body}</p>
        {footnote ? (
          <p className="text-xs leading-5 text-muted">{footnote}</p>
        ) : null}
      </div>
    </div>
  );
}
