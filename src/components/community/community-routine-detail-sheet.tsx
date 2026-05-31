"use client";

import { useTranslations } from "next-intl";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { CommunityRoutineDetailSurface } from "./community-routine-detail-surface";

type CommunityRoutineDetailSheetProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  routineId: string;
  /* Optional title to render as the sheet's visible
     SheetTitle. Passed in by the calling card so the sheet
     header carries the specific routine name (e.g.
     "Quiet AM barrier routine") instead of the generic
     "Playbook details" eyebrow. When omitted (e.g. opened
     by a deep link without context), falls back to a
     generic label. */
  routineTitle?: string;
};

export function CommunityRoutineDetailSheet({
  onOpenChange,
  open,
  routineId,
  routineTitle,
}: CommunityRoutineDetailSheetProps) {
  const t = useTranslations("community.routineDetail");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex h-full w-full flex-col gap-0 border-l border-border bg-surface p-0 sm:max-w-2xl"
      >
        {/* Compact sheet header. Eyebrow ("Playbook") + the
            routine name + a one-line description sets the
            user's location without the heavy double-title
            chrome the previous version had (sheet header
            said "Playbook details" then the surface re-
            stated the routine name below). */}
        <header className="space-y-1 border-b border-border px-5 py-4 pr-12 sm:px-6 sm:pr-14">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            {t("sheetEyebrow")}
          </p>
          <SheetTitle className="break-words font-display text-lg font-bold leading-tight tracking-tight text-foreground">
            {routineTitle ?? t("sheetTitle")}
          </SheetTitle>
          <SheetDescription className="sr-only">
            {t("sheetDescription")}
          </SheetDescription>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          <CommunityRoutineDetailSurface routineId={routineId} variant="sheet" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
