import { act, renderHook } from "@testing-library/react";
import { useIsMobile } from "@/hooks/use-mobile";

type MatchMediaListener = (event: MediaQueryListEvent) => void;

describe("useIsMobile", () => {
  const originalMatchMedia = window.matchMedia;
  const listeners = new Set<MatchMediaListener>();

  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      writable: true,
      value: 500,
    });

    window.matchMedia = jest.fn().mockImplementation(() => ({
      matches: window.innerWidth < 768,
      media: "(max-width: 767px)",
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

  it("reports mobile state and updates when the viewport changes", () => {
    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);

    act(() => {
      window.innerWidth = 1024;
      listeners.forEach((listener) => {
        listener({ matches: false } as MediaQueryListEvent);
      });
    });

    expect(result.current).toBe(false);
  });
});
