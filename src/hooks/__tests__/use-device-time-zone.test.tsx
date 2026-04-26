import { act, renderHook } from '@testing-library/react';
import { useDeviceTimeZone } from '@/hooks/use-device-time-zone';
import { getBrowserTimeZone } from '@/lib/time-zone';

jest.mock('@/lib/time-zone', () => ({
  getBrowserTimeZone: jest.fn(() => 'Europe/Stockholm'),
}));

const mockedGetBrowserTimeZone = jest.mocked(getBrowserTimeZone);

describe('useDeviceTimeZone', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetBrowserTimeZone.mockReturnValue('Europe/Stockholm');
  });

  it('shares a single window subscription across multiple consumers', () => {
    const addWindowSpy = jest.spyOn(window, 'addEventListener');
    const removeWindowSpy = jest.spyOn(window, 'removeEventListener');
    const addDocumentSpy = jest.spyOn(document, 'addEventListener');
    const removeDocumentSpy = jest.spyOn(document, 'removeEventListener');

    const first = renderHook(() => useDeviceTimeZone());
    const second = renderHook(() => useDeviceTimeZone());

    expect(first.result.current).toBe('Europe/Stockholm');
    expect(second.result.current).toBe('Europe/Stockholm');
    expect(
      addWindowSpy.mock.calls.filter(([eventName]) => eventName === 'focus'),
    ).toHaveLength(1);
    expect(
      addWindowSpy.mock.calls.filter(([eventName]) => eventName === 'pageshow'),
    ).toHaveLength(1);
    expect(
      addDocumentSpy.mock.calls.filter(
        ([eventName]) => eventName === 'visibilitychange',
      ),
    ).toHaveLength(1);

    first.unmount();

    expect(
      removeWindowSpy.mock.calls.filter(([eventName]) => eventName === 'focus'),
    ).toHaveLength(0);

    second.unmount();

    expect(
      removeWindowSpy.mock.calls.filter(([eventName]) => eventName === 'focus'),
    ).toHaveLength(1);
    expect(
      removeWindowSpy.mock.calls.filter(
        ([eventName]) => eventName === 'pageshow',
      ),
    ).toHaveLength(1);
    expect(
      removeDocumentSpy.mock.calls.filter(
        ([eventName]) => eventName === 'visibilitychange',
      ),
    ).toHaveLength(1);
  });

  it('refreshes the snapshot when the device timezone changes while the app regains focus', () => {
    let currentTimeZone = 'Europe/Stockholm';
    mockedGetBrowserTimeZone.mockImplementation(() => currentTimeZone);

    const { result } = renderHook(() => useDeviceTimeZone());

    expect(result.current).toBe('Europe/Stockholm');

    currentTimeZone = 'America/New_York';

    act(() => {
      window.dispatchEvent(new Event('focus'));
    });

    expect(result.current).toBe('America/New_York');
  });
});
