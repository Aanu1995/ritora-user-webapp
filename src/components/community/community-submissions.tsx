"use client";
import { AlertTriangle, FileCheck2, RefreshCw, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog, ConfirmDialogTone } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryKey } from "@/constants/query-keys";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  listMyCommunitySubmissions,
  resubmitCommunityContent,
  withdrawCommunityContent,
} from "@/services/community.service";
import type { CommunitySubmission } from "@/types/community";
import { CommunitySubmissionEditForm } from "./community-submission-edit-form";
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

export function MySubmissions() {
  const t = useTranslations("community.submissions");
  const tStatus = useTranslations("community.submissions.status");
  const tType = useTranslations("community.submissions.type");
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
      void queryClient.invalidateQueries({ queryKey: [QueryKey.CommunityHome] });
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
      void queryClient.invalidateQueries({ queryKey: [QueryKey.CommunityHome] });
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
          const isEditing = editingId === item.id;
          const resubmitting =
            resubmit.isPending && resubmit.variables === item.id;
          const canEdit =
            item.status === "draft" ||
            item.status === "pending_review" ||
            item.status === "needs_edit" || item.status === "rejected";
          const canResubmit =
            item.status === "needs_edit" || item.status === "rejected";
          const showWithdraw = item.status === "published";
          const withdrawing =
            withdraw.isPending && withdraw.variables === item.id;
          return (
            <article
              key={item.id}
              className="rounded-2xl border border-border bg-surface p-5 shadow-soft"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-base font-bold tracking-tight text-foreground">
                      {item.title}
                    </h3>
                    <Badge tone="muted">{tType(item.type)}</Badge>
                    <Badge tone={statusTone(item.status)}>
                      {tStatus(item.status)}
                    </Badge>
                  </div>
                  {item.safetyFlags.length > 0 ? (
                    <div className="mt-3 flex gap-2 rounded-xl border border-warning/30 bg-warning-soft px-3 py-2 text-sm text-warning">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span className="leading-5">
                        {item.safetyFlags[0]?.message}
                      </span>
                    </div>
                  ) : null}
                </div>
                {canEdit || canResubmit || showWithdraw ? (
                  <div className="flex flex-wrap gap-2">
                    {canEdit ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setEditingId((current) =>
                            current === item.id ? null : item.id,
                          )
                        }
                      >
                        {isEditing ? t("cancelEdit") : t("edit")}
                      </Button>
                    ) : null}
                    {canResubmit ? (
                      <>
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
                      </>
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
              </div>
              {isEditing ? (
                <CommunitySubmissionEditForm
                  item={item}
                  onCancel={() => setEditingId(null)}
                  onSaved={() => setEditingId(null)}
                />
              ) : null}
            </article>
          );
        })}
      </div>
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
