"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
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
  onDirtyChange?: (dirty: boolean) => void;
  onSaved: () => void;
};

export function CommunitySubmissionEditForm({
  item,
  onDirtyChange,
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
      <div className="rounded-xl border border-warning/30 bg-warning-soft p-4 text-sm text-warning">
        {t("missingSnapshot")}
      </div>
    );
  }

  // Render the publish form directly inside the parent Sheet's
  // content area. The previous wrapper introduced a card-within-
  // a-sheet (border + surface-muted background + extra padding)
  // and a top-aligned Cancel button that duplicated the
  // SheetContent close X. Both removed for a cleaner, less nested
  // composition.
  return item.type === "routine" ? (
    <PublishRoutineForm
      defaultValues={routineInputToFormValues(item.editableRoutine)}
      kind="edit"
      mutationFn={(input) => updateCommunityRoutine(item.id, input)}
      onDirtyChange={onDirtyChange}
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
      onDirtyChange={onDirtyChange}
      onSaved={handleSaved}
      resetOnSuccess={false}
      submitLabel={tShare("saveEdits")}
      submittingLabel={tShare("saving")}
      successMessage={() => tToast("editsSaved")}
    />
  );
}
