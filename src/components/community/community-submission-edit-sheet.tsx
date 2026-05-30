"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import type { CommunitySubmission } from "@/types/community";
import { CommunitySubmissionEditForm } from "./community-submission-edit-form";
import { useCommunityModalUnsavedChanges } from "./community-unsaved-review-guard";
import {
  CommunityUnsavedPlaybookDialog,
  CommunityUnsavedReviewDialog,
} from "./community-unsaved-review-dialog";

type Props = {
  item: CommunitySubmission | null;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function CommunityReviewSubmissionEditSheet({
  item,
  onOpenChange,
  open,
}: Props) {
  const t = useTranslations("community.submissions");
  return (
    <CommunitySubmissionEditSheet
      description={t("editReviewDescription")}
      item={item}
      onOpenChange={onOpenChange}
      open={open}
      title={t("editReviewTitle")}
      unsavedKind="review"
    />
  );
}

export function CommunityPlaybookSubmissionEditSheet({
  item,
  onOpenChange,
  open,
}: Props) {
  const t = useTranslations("community.submissions");
  return (
    <CommunitySubmissionEditSheet
      description={t("editPlaybookDescription")}
      item={item}
      onOpenChange={onOpenChange}
      open={open}
      title={t("editPlaybookTitle")}
      unsavedKind="playbook"
    />
  );
}

function CommunitySubmissionEditSheet({
  description,
  item,
  onOpenChange,
  open,
  title,
  unsavedKind,
}: Props & {
  description: string;
  title: string;
  unsavedKind: "playbook" | "review";
}) {
  const [discardOpen, setDiscardOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const hasUnsavedChanges = open && dirty;
  useCommunityModalUnsavedChanges(hasUnsavedChanges);

  if (!item) return null;

  const closeWithoutPrompt = () => {
    setDirty(false);
    setDiscardOpen(false);
    onOpenChange(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (next) {
      onOpenChange(true);
      return;
    }

    if (hasUnsavedChanges) {
      setDiscardOpen(true);
      return;
    }

    closeWithoutPrompt();
  };

  return (
    <>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent
          side="right"
          className="flex h-full w-full flex-col gap-0 border-l border-border bg-surface p-0 sm:max-w-2xl"
        >
          <header className="border-b border-border px-5 py-4 sm:px-6">
            <SheetTitle className="font-display text-lg font-bold tracking-tight text-foreground">
              {title}
            </SheetTitle>
            <SheetDescription className="mt-1 text-sm leading-5 text-muted">
              {description}
            </SheetDescription>
          </header>
          <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
            <CommunitySubmissionEditForm
              item={item}
              onDirtyChange={setDirty}
              onSaved={closeWithoutPrompt}
            />
          </div>
        </SheetContent>
      </Sheet>
      {unsavedKind === "playbook" ? (
        <CommunityUnsavedPlaybookDialog
          open={discardOpen}
          onOpenChange={setDiscardOpen}
          onDiscard={closeWithoutPrompt}
        />
      ) : (
        <CommunityUnsavedReviewDialog
          open={discardOpen}
          onOpenChange={setDiscardOpen}
          onDiscard={closeWithoutPrompt}
        />
      )}
    </>
  );
}
