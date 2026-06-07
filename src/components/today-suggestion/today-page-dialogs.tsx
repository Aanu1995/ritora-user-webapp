"use client";

import type { ReactNode } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { RecordApplicationSheet } from "@/components/today-suggestion/record-application-sheet";
import { RoutineBreakStartDialog } from "@/components/today-suggestion/routine-break-start-dialog";
import { SuggestionDetailDrawer } from "@/components/today-suggestion/suggestion-detail-drawer";
import type { ApplicationLog } from "@/types/application-tracking";
import type {
  StartRoutineBreakPayload,
  SuggestionInstance,
  TodaysSuggestionSlot,
} from "@/types/suggestions";

export type TodayEditSlot = {
  slot: TodaysSuggestionSlot;
  applicationLogId: string;
};

type TodayPageDialogsProps = {
  recordSlot: TodaysSuggestionSlot | null;
  editSlot: TodayEditSlot | null;
  editingExistingLog: ApplicationLog | null;
  detailSuggestion: SuggestionInstance | null;
  startBreakOpen: boolean;
  isStartingRoutineBreak: boolean;
  quickSuggestionDialogs: ReactNode;
  profileRequiredOpen: boolean;
  profileGateTitle: string;
  profileGateDescription: string;
  profileGateConfirmLabel: string;
  timeZone: string;
  onRecordClose: () => void;
  onEditClose: () => void;
  onDetailClose: () => void;
  onMarkDetailApplied: () => void;
  onStartBreak: (payload: StartRoutineBreakPayload) => void;
  onStartBreakOpenChange: (open: boolean) => void;
  onProfileGateConfirm: () => void;
  onProfileRequiredOpenChange: (open: boolean) => void;
};

export function TodayPageDialogs({
  recordSlot,
  editSlot,
  editingExistingLog,
  detailSuggestion,
  startBreakOpen,
  isStartingRoutineBreak,
  quickSuggestionDialogs,
  profileRequiredOpen,
  profileGateTitle,
  profileGateDescription,
  profileGateConfirmLabel,
  timeZone,
  onRecordClose,
  onEditClose,
  onDetailClose,
  onMarkDetailApplied,
  onStartBreak,
  onStartBreakOpenChange,
  onProfileGateConfirm,
  onProfileRequiredOpenChange,
}: TodayPageDialogsProps) {
  return (
    <>
      <RecordApplicationSheet
        open={recordSlot !== null}
        onOpenChange={(open) => {
          if (!open) onRecordClose();
        }}
        mode={recordSlot ? { kind: "record", slot: recordSlot } : null}
        onSaved={onRecordClose}
        timeZone={timeZone}
      />

      <RecordApplicationSheet
        open={editSlot !== null && editingExistingLog !== null}
        onOpenChange={(open) => {
          if (!open) onEditClose();
        }}
        mode={
          editSlot && editingExistingLog
            ? {
                kind: "edit",
                slot: editSlot.slot,
                existingLog: editingExistingLog,
              }
            : null
        }
        onSaved={onEditClose}
        timeZone={timeZone}
      />

      <SuggestionDetailDrawer
        open={detailSuggestion !== null}
        onOpenChange={(open) => {
          if (!open) onDetailClose();
        }}
        suggestion={detailSuggestion}
        onMarkApplied={onMarkDetailApplied}
        allowRegeneration
      />

      <RoutineBreakStartDialog
        open={startBreakOpen}
        isStarting={isStartingRoutineBreak}
        onOpenChange={onStartBreakOpenChange}
        onStart={onStartBreak}
      />

      {quickSuggestionDialogs}

      <ConfirmDialog
        open={profileRequiredOpen}
        onOpenChange={onProfileRequiredOpenChange}
        title={profileGateTitle}
        description={profileGateDescription}
        confirmLabel={profileGateConfirmLabel}
        onConfirm={onProfileGateConfirm}
      />
    </>
  );
}
