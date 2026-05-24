"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import type { CommunityPostingEligibility } from "@/types/community";
import {
  ShareWhatWorkedPanel,
  WriteReviewPanel,
} from "./community-eligibility";

/* ===========================================================
 * Side-sheet wrappers for the two contribution flows.
 *
 * Both surfaces (review, playbook) are forms that benefit from
 * focus — they take real input, run through validation, and end
 * with a safety scan. A right-side Sheet matches the rest of the
 * product (slot editor, product picker, shelf detail) and frees
 * the underlying page from re-laying out when the user opens or
 * cancels the composer.
 * ========================================================= */

type CommunityComposerSheetProps = {
  eligibility: CommunityPostingEligibility;
  onExplainBlocked: () => void;
  open: boolean;
  onOpenChange: (next: boolean) => void;
};

export function WriteReviewSheet(props: CommunityComposerSheetProps) {
  const t = useTranslations("community.share");
  return (
    <CommunityComposerSheet
      {...props}
      title={t("reviewTitle")}
      description={t("reviewDescription")}
    >
      <WriteReviewPanel
        eligibility={props.eligibility}
        onExplainBlocked={props.onExplainBlocked}
      />
    </CommunityComposerSheet>
  );
}

export function ShareWhatWorkedSheet(props: CommunityComposerSheetProps) {
  const t = useTranslations("community.share");
  return (
    <CommunityComposerSheet
      {...props}
      title={t("playbookTitle")}
      description={t("playbookDescription")}
    >
      <ShareWhatWorkedPanel
        eligibility={props.eligibility}
        onExplainBlocked={props.onExplainBlocked}
      />
    </CommunityComposerSheet>
  );
}

function CommunityComposerSheet({
  children,
  description,
  onOpenChange,
  open,
  title,
}: CommunityComposerSheetProps & {
  children: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
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
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
