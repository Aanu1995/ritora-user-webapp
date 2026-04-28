import { act, renderHook } from '@testing-library/react';
import { useUnsavedChangesGuard } from '@/hooks/use-unsaved-changes-guard';
import { useUnsavedChangesStore } from '@/stores/unsaved-changes-store';

function resetStore() {
  useUnsavedChangesStore.setState({
    hasUnsavedChanges: false,
    isDialogOpen: false,
    pendingProceed: null,
  });
}

describe('useUnsavedChangesGuard', () => {
  beforeEach(() => {
    resetStore();
    // jsdom starts each test on a specific URL; normalize history so
    // previous tests' pushState entries don't leak in.
    window.history.replaceState(null, '', '/');
  });

  it('publishes hasUnsavedChanges into the store while mounted and clears on unmount', () => {
    const { unmount, rerender } = renderHook(
      ({ dirty }) => useUnsavedChangesGuard({ hasUnsavedChanges: dirty }),
      { initialProps: { dirty: false } },
    );

    expect(useUnsavedChangesStore.getState().hasUnsavedChanges).toBe(false);

    rerender({ dirty: true });
    expect(useUnsavedChangesStore.getState().hasUnsavedChanges).toBe(true);

    rerender({ dirty: false });
    expect(useUnsavedChangesStore.getState().hasUnsavedChanges).toBe(false);

    rerender({ dirty: true });
    expect(useUnsavedChangesStore.getState().hasUnsavedChanges).toBe(true);

    unmount();
    expect(useUnsavedChangesStore.getState().hasUnsavedChanges).toBe(false);
  });

  it('attaches a beforeunload listener only while dirty', () => {
    const addSpy = jest.spyOn(window, 'addEventListener');
    const removeSpy = jest.spyOn(window, 'removeEventListener');

    const { rerender, unmount } = renderHook(
      ({ dirty }) => useUnsavedChangesGuard({ hasUnsavedChanges: dirty }),
      { initialProps: { dirty: false } },
    );

    expect(
      addSpy.mock.calls.some(([event]) => event === 'beforeunload'),
    ).toBe(false);

    rerender({ dirty: true });
    expect(
      addSpy.mock.calls.some(([event]) => event === 'beforeunload'),
    ).toBe(true);

    rerender({ dirty: false });
    expect(
      removeSpy.mock.calls.some(([event]) => event === 'beforeunload'),
    ).toBe(true);

    addSpy.mockRestore();
    removeSpy.mockRestore();
    unmount();
  });

  it('pushes a sentinel history entry when dirty and re-pushes it on browser back', () => {
    const pushSpy = jest.spyOn(window.history, 'pushState');

    renderHook(() => useUnsavedChangesGuard({ hasUnsavedChanges: true }));

    expect(pushSpy).toHaveBeenCalledTimes(1);
    expect(pushSpy.mock.calls[0][0]).toMatchObject({
      __ritoraUnsavedGuard: true,
    });

    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
    });

    expect(pushSpy).toHaveBeenCalledTimes(2);
    expect(useUnsavedChangesStore.getState().isDialogOpen).toBe(true);
    expect(useUnsavedChangesStore.getState().pendingProceed).not.toBeNull();

    pushSpy.mockRestore();
  });

  it('confirms the browser-back leave path by skipping past the sentinel and form entry', () => {
    const goSpy = jest.spyOn(window.history, 'go').mockImplementation(jest.fn());

    renderHook(() => useUnsavedChangesGuard({ hasUnsavedChanges: true }));

    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
    });

    expect(useUnsavedChangesStore.getState().isDialogOpen).toBe(true);

    act(() => {
      useUnsavedChangesStore.getState().confirmLeave();
    });

    expect(goSpy).toHaveBeenCalledWith(-2);
    expect(useUnsavedChangesStore.getState().isDialogOpen).toBe(false);
    expect(useUnsavedChangesStore.getState().pendingProceed).toBeNull();

    goSpy.mockRestore();
  });

  it('cancels the browser-back leave path without navigating', () => {
    const goSpy = jest.spyOn(window.history, 'go').mockImplementation(jest.fn());

    renderHook(() => useUnsavedChangesGuard({ hasUnsavedChanges: true }));

    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
    });

    act(() => {
      useUnsavedChangesStore.getState().cancelLeave();
    });

    expect(goSpy).not.toHaveBeenCalled();
    expect(useUnsavedChangesStore.getState().isDialogOpen).toBe(false);
    expect(useUnsavedChangesStore.getState().pendingProceed).toBeNull();

    goSpy.mockRestore();
  });

  it('clears any pending leave when the form becomes clean again', () => {
    const { rerender } = renderHook(
      ({ dirty }) => useUnsavedChangesGuard({ hasUnsavedChanges: dirty }),
      { initialProps: { dirty: true } },
    );

    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
    });

    expect(useUnsavedChangesStore.getState().isDialogOpen).toBe(true);

    rerender({ dirty: false });

    expect(useUnsavedChangesStore.getState().isDialogOpen).toBe(false);
    expect(useUnsavedChangesStore.getState().pendingProceed).toBeNull();
  });

  it('releaseGuard pops the sentinel when its marker is on top of history', () => {
    const { result } = renderHook(() =>
      useUnsavedChangesGuard({ hasUnsavedChanges: true }),
    );

    const backSpy = jest.spyOn(window.history, 'back');

    act(() => {
      result.current.releaseGuard();
    });

    expect(backSpy).toHaveBeenCalledTimes(1);
    backSpy.mockRestore();
  });

  it('does not pop history twice when releaseGuard is followed by cleanup', () => {
    const { result, unmount } = renderHook(() =>
      useUnsavedChangesGuard({ hasUnsavedChanges: true }),
    );

    const backSpy = jest.spyOn(window.history, 'back');

    act(() => {
      result.current.releaseGuard();
      unmount();
    });

    expect(backSpy).toHaveBeenCalledTimes(1);
    backSpy.mockRestore();
  });

  it('releaseGuard clears dirty state before a guarded close runs', () => {
    const { result } = renderHook(() =>
      useUnsavedChangesGuard({ hasUnsavedChanges: true }),
    );
    const proceed = jest.fn();

    act(() => {
      result.current.releaseGuard();
      useUnsavedChangesStore.getState().requestLeave(proceed);
    });

    expect(useUnsavedChangesStore.getState().hasUnsavedChanges).toBe(false);
    expect(useUnsavedChangesStore.getState().isDialogOpen).toBe(false);
    expect(useUnsavedChangesStore.getState().pendingProceed).toBeNull();
    expect(proceed).toHaveBeenCalledTimes(1);
  });

  it('releaseGuard does nothing when the top history entry is not the sentinel', () => {
    const { result } = renderHook(() =>
      useUnsavedChangesGuard({ hasUnsavedChanges: false }),
    );

    const backSpy = jest.spyOn(window.history, 'back');

    act(() => {
      result.current.releaseGuard();
    });

    expect(backSpy).not.toHaveBeenCalled();
    backSpy.mockRestore();
  });

  it('removes the popstate listener on unmount', () => {
    const removeSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() =>
      useUnsavedChangesGuard({ hasUnsavedChanges: true }),
    );

    unmount();

    expect(
      removeSpy.mock.calls.some(([event]) => event === 'popstate'),
    ).toBe(true);

    removeSpy.mockRestore();
  });
});
