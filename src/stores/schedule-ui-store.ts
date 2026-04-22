'use client';

import { create } from 'zustand';
import { AddSlotPresetMode, type DayOfWeek } from '@/types/schedule';

export enum ScheduleViewMode {
  List = 'list',
  Calendar = 'calendar',
}

export type AddSlotDialogState = {
  open: boolean;
  preselectDay: DayOfWeek | null;
  presetMode: AddSlotPresetMode | null;
};

type ScheduleUiState = {
  editingSlotId: string | null;
  openEditor: (slotId: string) => void;
  closeEditor: () => void;

  viewMode: ScheduleViewMode;
  setViewMode: (mode: ScheduleViewMode) => void;

  addSlotDialog: AddSlotDialogState;
  openAddSlotDialog: (opts?: {
    day?: DayOfWeek;
    presetMode?: AddSlotPresetMode;
  }) => void;
  closeAddSlotDialog: () => void;

  /** When true, render the 7-day list view even if no slots exist yet, so the
   * user can add times per-day via the "+ Add time" buttons. Set by clicking
   * "Build from scratch" on the empty state. */
  buildFromScratch: boolean;
  enterBuildFromScratch: () => void;
  exitBuildFromScratch: () => void;

  productPickerOpenForStepIndex: number | null;
  openProductPicker: (stepIndex: number) => void;
  closeProductPicker: () => void;
};

export const useScheduleUiStore = create<ScheduleUiState>((set) => ({
  editingSlotId: null,
  openEditor: (slotId) => set({ editingSlotId: slotId }),
  closeEditor: () => set({ editingSlotId: null }),

  viewMode: ScheduleViewMode.List,
  setViewMode: (viewMode) => set({ viewMode }),

  addSlotDialog: { open: false, preselectDay: null, presetMode: null },
  openAddSlotDialog: (opts) =>
    set({
      addSlotDialog: {
        open: true,
        preselectDay: opts?.day ?? null,
        presetMode: opts?.presetMode ?? AddSlotPresetMode.Single,
      },
    }),
  closeAddSlotDialog: () =>
    set({
      addSlotDialog: { open: false, preselectDay: null, presetMode: null },
    }),

  buildFromScratch: false,
  enterBuildFromScratch: () => set({ buildFromScratch: true }),
  exitBuildFromScratch: () => set({ buildFromScratch: false }),

  productPickerOpenForStepIndex: null,
  openProductPicker: (stepIndex) =>
    set({ productPickerOpenForStepIndex: stepIndex }),
  closeProductPicker: () => set({ productPickerOpenForStepIndex: null }),
}));
