import {
  ScheduleViewMode,
  useScheduleUiStore,
} from '@/stores/schedule-ui-store';
import { AddSlotPresetMode, DayOfWeek, StepLabel } from '@/types/schedule';

const INITIAL_STATE = useScheduleUiStore.getState();

describe('useScheduleUiStore', () => {
  beforeEach(() => {
    useScheduleUiStore.setState(INITIAL_STATE, true);
  });

  it('tracks the slot editor and schedule view mode', () => {
    useScheduleUiStore.getState().openEditor('slot-1');
    expect(useScheduleUiStore.getState().editingSlotId).toBe('slot-1');

    useScheduleUiStore.getState().closeEditor();
    expect(useScheduleUiStore.getState().editingSlotId).toBeNull();

    useScheduleUiStore.getState().setViewMode(ScheduleViewMode.Calendar);
    expect(useScheduleUiStore.getState().viewMode).toBe(
      ScheduleViewMode.Calendar,
    );
  });

  it('opens and closes the add-slot dialog with defaults and overrides', () => {
    useScheduleUiStore.getState().openAddSlotDialog();
    expect(useScheduleUiStore.getState().addSlotDialog).toEqual({
      open: true,
      preselectDay: null,
      presetMode: AddSlotPresetMode.Single,
    });

    useScheduleUiStore.getState().openAddSlotDialog({
      day: DayOfWeek.Wed,
      presetMode: AddSlotPresetMode.EveryDay,
    });
    expect(useScheduleUiStore.getState().addSlotDialog).toEqual({
      open: true,
      preselectDay: DayOfWeek.Wed,
      presetMode: AddSlotPresetMode.EveryDay,
    });

    useScheduleUiStore.getState().closeAddSlotDialog();
    expect(useScheduleUiStore.getState().addSlotDialog.open).toBe(false);
  });

  it('toggles build-from-scratch mode', () => {
    useScheduleUiStore.getState().enterBuildFromScratch();
    expect(useScheduleUiStore.getState().buildFromScratch).toBe(true);

    useScheduleUiStore.getState().exitBuildFromScratch();
    expect(useScheduleUiStore.getState().buildFromScratch).toBe(false);
  });

  it('bridges product picker selection state', () => {
    const product = {
      id: 'product-1',
      brand: 'CeraVe',
      name: 'Cleanser',
      category: 'cleanser',
      imageUrl: null,
      status: 'active',
    };

    useScheduleUiStore
      .getState()
      .openProductPicker(2, StepLabel.Moisturizer);
    expect(useScheduleUiStore.getState()).toEqual(
      expect.objectContaining({
        productPickerOpenForStepIndex: 2,
        productPickerStepLabel: StepLabel.Moisturizer,
      }),
    );

    useScheduleUiStore.getState().selectProductForPicker(product);
    expect(useScheduleUiStore.getState().pendingProductSelection).toBe(product);

    useScheduleUiStore.getState().clearPendingProductSelection();
    expect(useScheduleUiStore.getState().pendingProductSelection).toBeNull();

    useScheduleUiStore.getState().selectProductForPicker(product);
    useScheduleUiStore.getState().closeProductPicker();
    expect(useScheduleUiStore.getState()).toEqual(
      expect.objectContaining({
        productPickerOpenForStepIndex: null,
        productPickerStepLabel: null,
        pendingProductSelection: null,
      }),
    );
  });
});
