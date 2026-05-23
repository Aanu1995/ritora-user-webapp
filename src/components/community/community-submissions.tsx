"use client";

import { AlertTriangle, Check, FileCheck2, RefreshCw } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QueryKey } from "@/constants/query-keys";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  executeMutation,
  readSubmissionErrorMessage,
} from "@/lib/form-submission";
import { cn } from "@/lib/utils";
import {
  listMyCommunitySubmissions,
  resubmitCommunityContent,
  updateCommunityReview,
  updateCommunityRoutine,
} from "@/services/community.service";
import type {
  CommunityReview,
  CommunityRoutine,
  CommunitySubmission,
} from "@/types/community";
import {
  communityEditReviewSubmissionSchema,
  communityEditRoutineSubmissionSchema,
  type CommunityEditSubmissionValues,
} from "./community-form-schemas";
import {
  Badge,
  CommunityFieldError,
  CommunityListSkeleton,
  CommunityTextareaField,
  EmptyState,
  Field,
  InlineSpinner,
} from "./community-shared";

type EditSubmissionInput = CommunityEditSubmissionValues & {
  id: string;
  type: "routine" | "review";
};

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
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const query = useQuery({
    queryKey: [QueryKey.CommunityMySubmissions],
    queryFn: ({ signal }) => listMyCommunitySubmissions(signal),
  });
  const edit = useMutation<
    CommunityRoutine | CommunityReview,
    Error,
    EditSubmissionInput
  >({
    mutationFn: (input) =>
      input.type === "routine"
        ? updateCommunityRoutine(input.id, {
            title: input.title,
            summary: input.text,
          })
        : updateCommunityReview(input.id, { body: input.text }),
    onSuccess: () => {
      setEditingId(null);
      void queryClient.invalidateQueries({
        queryKey: [QueryKey.CommunityMySubmissions],
      });
      void queryClient.invalidateQueries({ queryKey: [QueryKey.CommunityHome] });
      toast.success("Edits saved and sent through safety review.");
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error) ?? "Could not save edits."),
  });
  const resubmit = useMutation({
    mutationFn: (id: string) => resubmitCommunityContent(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [QueryKey.CommunityMySubmissions],
      });
      void queryClient.invalidateQueries({ queryKey: [QueryKey.CommunityHome] });
      toast.success("Submission resubmitted for safety review.");
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error) ?? "Could not resubmit this item."),
  });

  if (query.isLoading) {
    return (
      <section className="space-y-3">
        <div className="h-6 w-56 animate-pulse rounded-md bg-surface-muted" />
        <CommunityListSkeleton count={3} />
      </section>
    );
  }

  const items = query.data?.items ?? [];
  if (items.length === 0) {
    return (
      <EmptyState
        icon={FileCheck2}
        title="No community submissions yet"
        body="Reviews and routines you share will appear here with their moderation status."
      />
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="font-display text-lg font-bold tracking-tight text-foreground">
        My community submissions
      </h2>
      <div className="space-y-3">
        {items.map((item) => {
          const isEditing = editingId === item.id;
          const resubmitting =
            resubmit.isPending && resubmit.variables === item.id;
          const showActions =
            item.status === "needs_edit" || item.status === "rejected";
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
                    <Badge tone="muted">{item.type}</Badge>
                    <Badge tone={statusTone(item.status)}>
                      {item.status.replace(/_/g, " ")}
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
                {showActions ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setEditingId((current) =>
                          current === item.id ? null : item.id,
                        )
                      }
                    >
                      {isEditing ? "Cancel edit" : "Edit"}
                    </Button>
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
                      {resubmitting ? "Resubmitting…" : "Resubmit unchanged"}
                    </Button>
                  </div>
                ) : null}
              </div>
              {isEditing ? (
                <SubmissionEditForm
                  item={item}
                  isPending={edit.isPending}
                  onCancel={() => setEditingId(null)}
                  onSave={(values) =>
                    executeMutation(edit.mutate, {
                      id: item.id,
                      text: values.text,
                      title: values.title,
                      type: item.type,
                    })
                  }
                />
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function SubmissionEditForm({
  isPending,
  item,
  onCancel,
  onSave,
}: {
  isPending: boolean;
  item: CommunitySubmission;
  onCancel: () => void;
  onSave: (
    values: CommunityEditSubmissionValues,
  ) => ReturnType<
    typeof executeMutation<
      CommunityRoutine | CommunityReview,
      Error,
      EditSubmissionInput,
      unknown
    >
  >;
}) {
  const form = useForm({
    defaultValues: {
      text: item.editableText ?? "",
      title: item.title,
    } satisfies CommunityEditSubmissionValues,
    validators: {
      onChange:
        item.type === "routine"
          ? communityEditRoutineSubmissionSchema
          : communityEditReviewSubmissionSchema,
      onSubmit:
        item.type === "routine"
          ? communityEditRoutineSubmissionSchema
          : communityEditReviewSubmissionSchema,
      onSubmitAsync: async ({ value }) => {
        const result = await onSave(value);
        if (result.error !== null) {
          return {
            form: getApiErrorMessage(result.error) ?? "Could not save edits.",
            fields: {},
          };
        }
        return undefined;
      },
    },
    onSubmit: () => undefined,
  });

  return (
    <form
      className="mt-4 grid gap-4 rounded-xl border border-border bg-surface-muted/60 p-4"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
      noValidate
    >
      {item.type === "routine" ? (
        <form.Field name="title">
          {(field) => {
            const invalid = field.state.meta.errors.length > 0;
            return (
              <Field label="Routine title" required>
                <Input
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={invalid}
                  className={cn(
                    invalid && "border-danger focus-visible:ring-danger/30",
                  )}
                />
                <CommunityFieldError errors={field.state.meta.errors} />
              </Field>
            );
          }}
        </form.Field>
      ) : null}
      <form.Field name="text">
        {(field) => (
          <CommunityTextareaField
            field={field}
            label={item.type === "routine" ? "Routine summary" : "Review text"}
            hint="Remove medical claims, sponsorship ambiguity, unsafe layering and private details before resubmitting."
            maxLength={item.type === "routine" ? 500 : 1200}
            placeholder="Edit your submission so it passes the safety scan…"
          />
        )}
      </form.Field>

      <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
        {(submitError) => {
          const message = readSubmissionErrorMessage(submitError);
          return message ? (
            <p
              className="rounded-xl border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger"
              role="alert"
            >
              {message}
            </p>
          ) : null;
        }}
      </form.Subscribe>

      <div className="flex flex-wrap gap-2">
        <form.Subscribe
          selector={(state) => ({
            canSubmit: state.canSubmit,
            isSubmitting: state.isSubmitting,
          })}
        >
          {({ canSubmit, isSubmitting }) => {
            const busy = isSubmitting || isPending;
            return (
              <Button size="sm" type="submit" disabled={!canSubmit || busy}>
                {busy ? <InlineSpinner /> : <Check className="h-4 w-4" />}
                {busy ? "Saving…" : "Save edits"}
              </Button>
            );
          }}
        </form.Subscribe>
        <Button size="sm" type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
