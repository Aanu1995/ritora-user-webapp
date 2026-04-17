import { useUnsavedChangesStore } from '@/stores/unsaved-changes-store';

function resetStore() {
  useUnsavedChangesStore.setState({
    hasUnsavedChanges: false,
    isDialogOpen: false,
    pendingProceed: null,
  });
}

describe('useUnsavedChangesStore', () => {
  beforeEach(() => {
    resetStore();
  });

  it('does not open the dialog when requestLeave fires on a clean state', () => {
    const proceed = jest.fn();
    useUnsavedChangesStore.getState().requestLeave(proceed);

    expect(proceed).toHaveBeenCalledTimes(1);
    expect(useUnsavedChangesStore.getState().isDialogOpen).toBe(false);
    expect(useUnsavedChangesStore.getState().pendingProceed).toBeNull();
  });

  it('stashes proceed and opens the dialog when dirty', () => {
    useUnsavedChangesStore.setState({ hasUnsavedChanges: true });
    const proceed = jest.fn();

    useUnsavedChangesStore.getState().requestLeave(proceed);

    expect(proceed).not.toHaveBeenCalled();
    expect(useUnsavedChangesStore.getState().isDialogOpen).toBe(true);
    expect(useUnsavedChangesStore.getState().pendingProceed).toBe(proceed);
  });

  it('confirmLeave flushes pending proceed and closes the dialog', () => {
    const proceed = jest.fn();
    useUnsavedChangesStore.setState({
      hasUnsavedChanges: true,
      isDialogOpen: true,
      pendingProceed: proceed,
    });

    useUnsavedChangesStore.getState().confirmLeave();

    expect(proceed).toHaveBeenCalledTimes(1);
    expect(useUnsavedChangesStore.getState().isDialogOpen).toBe(false);
    expect(useUnsavedChangesStore.getState().pendingProceed).toBeNull();
  });

  it('cancelLeave closes the dialog without running proceed', () => {
    const proceed = jest.fn();
    useUnsavedChangesStore.setState({
      hasUnsavedChanges: true,
      isDialogOpen: true,
      pendingProceed: proceed,
    });

    useUnsavedChangesStore.getState().cancelLeave();

    expect(proceed).not.toHaveBeenCalled();
    expect(useUnsavedChangesStore.getState().isDialogOpen).toBe(false);
    expect(useUnsavedChangesStore.getState().pendingProceed).toBeNull();
  });

  it('setDialogOpen(false) is equivalent to cancelLeave', () => {
    const proceed = jest.fn();
    useUnsavedChangesStore.setState({
      hasUnsavedChanges: true,
      isDialogOpen: true,
      pendingProceed: proceed,
    });

    useUnsavedChangesStore.getState().setDialogOpen(false);

    expect(proceed).not.toHaveBeenCalled();
    expect(useUnsavedChangesStore.getState().isDialogOpen).toBe(false);
    expect(useUnsavedChangesStore.getState().pendingProceed).toBeNull();
  });
});
