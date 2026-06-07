"use client";

import { useTranslations } from "next-intl";
import {
  ConfirmDialog,
  ConfirmDialogTone,
} from "@/components/ui/confirm-dialog";

type Props = {
  onDiscard: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function CommunityUnsavedReviewDialog({
  onDiscard,
  onOpenChange,
  open,
}: Props) {
  const t = useTranslations("community.unsavedReview");

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("title")}
      description={t("description")}
      confirmLabel={t("discard")}
      cancelLabel={t("keepEditing")}
      onConfirm={onDiscard}
      tone={ConfirmDialogTone.Danger}
    />
  );
}

export function CommunityUnsavedPlaybookDialog({
  onDiscard,
  onOpenChange,
  open,
}: Props) {
  const t = useTranslations("community.unsavedPlaybook");

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("title")}
      description={t("description")}
      confirmLabel={t("discard")}
      cancelLabel={t("keepEditing")}
      onConfirm={onDiscard}
      tone={ConfirmDialogTone.Danger}
    />
  );
}
