"use client";

import { useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { JournalEntry } from "@/types/skin-journal";

interface JournalDeleteTodayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: JournalEntry | null;
  isDeleting: boolean;
  onConfirm: (entry: JournalEntry) => void;
}

export function JournalDeleteTodayDialog({
  open,
  onOpenChange,
  entry,
  isDeleting,
  onConfirm,
}: JournalDeleteTodayDialogProps) {
  const t = useTranslations("journal.upload");
  const tDelete = useTranslations("journal.deleteConfirm");

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div
            aria-hidden
            className="grid h-11 w-11 place-items-center rounded-xl bg-[color:var(--danger-soft)] text-danger"
          >
            <Trash2 className="h-5 w-5" />
          </div>
          <AlertDialogTitle className="mt-2 font-display text-lg font-bold">
            {tDelete("title")}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm leading-relaxed text-muted">
            {tDelete("body")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {tDelete("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              disabled={isDeleting || !entry}
              onClick={() => {
                if (entry) {
                  onConfirm(entry);
                }
              }}
              className="rounded-full bg-danger text-white shadow-soft hover:bg-danger/90 focus-visible:ring-danger/40"
            >
              {isDeleting ? (
                <LoadingIndicator size="sm" label={t("deleting")} />
              ) : (
                <>
                  <Trash2 className="h-3.5 w-3.5" />
                  {tDelete("confirm")}
                </>
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
