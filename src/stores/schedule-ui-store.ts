'use client';

import { create } from 'zustand';
import {
  AddSlotPresetMode,
  type DayOfWeek,
  type RoutineStepProductSummary,
  type StepLabel,
} from '@/types/schedule';

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
  productPickerStepLabel: StepLabel | null;
  openProductPicker: (stepIndex: number, stepLabel: StepLabel) => void;
  closeProductPicker: () => void;

  /** Bridge for the inline product picker: the picker writes here on select;
   * the step list consumes it and applies the product to the current step. */
  pendingProductSelection: RoutineStepProductSummary | null;
  selectProductForPicker: (product: RoutineStepProductSummary) => void;
  clearPendingProductSelection: () => void;
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
  productPickerStepLabel: null,
  openProductPicker: (stepIndex, stepLabel) =>
    set({
      productPickerOpenForStepIndex: stepIndex,
      productPickerStepLabel: stepLabel,
    }),
  closeProductPicker: () =>
    set({
      productPickerOpenForStepIndex: null,
      productPickerStepLabel: null,
      pendingProductSelection: null,
    }),

  pendingProductSelection: null,
  selectProductForPicker: (product) =>
    set({ pendingProductSelection: product }),
  clearPendingProductSelection: () => set({ pendingProductSelection: null }),
}));
