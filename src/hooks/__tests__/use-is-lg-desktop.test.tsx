import { act, renderHook } from '@testing-library/react';
import { useIsLgDesktop } from '@/hooks/use-is-lg-desktop';

type MatchMediaListener = (event: MediaQueryListEvent) => void;

describe('useIsLgDesktop', () => {
  const originalMatchMedia = window.matchMedia;
  const listeners = new Set<MatchMediaListener>();

  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 1200,
    });

    window.matchMedia = jest.fn().mockImplementation(() => ({
      matches: window.innerWidth >= 1024,
      media: '(min-width: 1024px)',
      onchange: null,
      addEventListener: (_event: string, listener: MatchMediaListener) => {
        listeners.add(listener);
      },
      removeEventListener: (_event: string, listener: MatchMediaListener) => {
        listeners.delete(listener);
      },
      dispatchEvent: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
    }));
  });

  afterEach(() => {
    listeners.clear();
    window.matchMedia = originalMatchMedia;
  });

  it('reports desktop state and updates when the viewport changes', () => {
    const { result } = renderHook(() => useIsLgDesktop());

    expect(result.current).toBe(true);

    act(() => {
      window.innerWidth = 800;
      listeners.forEach((listener) => {
        listener({ matches: false } as MediaQueryListEvent);
      });
    });

    expect(result.current).toBe(false);
  });
});
