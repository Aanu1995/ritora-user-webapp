"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { DaypartIcon } from "./daypart-icon";
import { cn } from "@/lib/utils";
import type { Daypart } from "@/types/schedule";

type SlotEditorHeaderProps = {
  children: ReactNode;
  closeLabel: string;
  dayLabel: string;
  daypart: Daypart;
  onClose: () => void;
  showCloseButton: boolean;
};

export function SlotEditorHeader({
  children,
  closeLabel,
  dayLabel,
  daypart,
  onClose,
  showCloseButton,
}: SlotEditorHeaderProps) {
  return (
    <header
      className={cn(
        "flex items-start gap-3 border-b border-border px-5 py-4",
        !showCloseButton && "pr-12",
      )}
    >
      <DaypartIcon daypart={daypart} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{dayLabel}</p>
        {children}
      </div>
      {showCloseButton ? (
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1.5 text-muted transition hover:bg-accent-soft"
          aria-label={closeLabel}
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </header>
  );
}
