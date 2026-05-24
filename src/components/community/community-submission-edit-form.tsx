"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { QueryKey } from "@/constants/query-keys";
import {
  updateCommunityReview,
  updateCommunityRoutine,
} from "@/services/community.service";
import type { CommunitySubmission } from "@/types/community";
import {
  reviewInputToFormValues,
  routineInputToFormValues,
} from "./community-form-payloads";
import { PublishRoutineForm, WriteReviewForm } from "./community-publish-forms";

type Props = {
  item: CommunitySubmission;
  onCancel: () => void;
  onSaved: () => void;
};

export function CommunitySubmissionEditForm({
  item,
  onCancel,
  onSaved,
}: Props) {
  const t = useTranslations("community.submissions");
  const tShare = useTranslations("community.share");
  const tToast = useTranslations("community.toasts");
  const queryClient = useQueryClient();
  const handleSaved = () => {
    void queryClient.invalidateQueries({
      queryKey: [QueryKey.CommunityMySubmissions],
    });
    onSaved();
  };

  const missingSnapshot =
    (item.type === "routine" && !item.editableRoutine) ||
    (item.type === "review" && !item.editableReview);

  if (missingSnapshot) {
    return (
      <div className="mt-5 rounded-xl border border-warning/30 bg-warning-soft p-4 text-sm text-warning">
        {t("missingSnapshot")}
      </div>
    );
  }

  return (
    <div className="mt-5 grid gap-5 rounded-xl border border-border bg-surface-muted/60 p-5">
      <div className="flex justify-end">
        <Button size="sm" type="button" variant="ghost" onClick={onCancel}>
          {t("cancel")}
        </Button>
      </div>
      {item.type === "routine" ? (
        <PublishRoutineForm
          defaultValues={routineInputToFormValues(item.editableRoutine)}
          kind="edit"
          mutationFn={(input) => updateCommunityRoutine(item.id, input)}
          onSaved={handleSaved}
          resetOnSuccess={false}
          submitLabel={tShare("saveEdits")}
          submittingLabel={tShare("saving")}
          successMessage={() => tToast("editsSaved")}
        />
      ) : (
        <WriteReviewForm
          defaultValues={reviewInputToFormValues(item.editableReview)}
          kind="edit"
          mutationFn={(input) => updateCommunityReview(item.id, input)}
          onSaved={handleSaved}
          resetOnSuccess={false}
          submitLabel={tShare("saveEdits")}
          submittingLabel={tShare("saving")}
          successMessage={() => tToast("editsSaved")}
        />
      )}
    </div>
  );
}
