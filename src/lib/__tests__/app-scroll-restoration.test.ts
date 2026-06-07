import { restoreAppScrollPosition } from "@/lib/app-scroll-restoration";

describe("restoreAppScrollPosition", () => {
  const originalRequestAnimationFrame = window.requestAnimationFrame;
  const originalCancelAnimationFrame = window.cancelAnimationFrame;

  beforeEach(() => {
    jest.useFakeTimers();
    jest
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((callback) =>
        window.setTimeout(() => callback(performance.now()), 0),
      );
    jest
      .spyOn(window, "cancelAnimationFrame")
      .mockImplementation((handle) => window.clearTimeout(handle));
  });

  afterEach(() => {
    jest.useRealTimers();
    window.requestAnimationFrame = originalRequestAnimationFrame;
    window.cancelAnimationFrame = originalCancelAnimationFrame;
    document.body.innerHTML = "";
  });

  it("retries until the app scroll root can reach the saved position", () => {
    const scrollRoot = document.createElement("main");
    let canReachSavedPosition = false;
    let scrollTop = 0;
    const scrollTo = jest.fn(
      (options?: ScrollToOptions | number, y?: number) => {
        const target =
          typeof options === "number" ? (y ?? 0) : (options?.top ?? 0);
        const maxScrollTop = canReachSavedPosition ? 900 : 0;
        scrollTop = Math.min(target, maxScrollTop);
      },
    );

    scrollRoot.setAttribute("data-app-scroll-root", "");
    Object.defineProperties(scrollRoot, {
      clientHeight: { configurable: true, value: 100 },
      scrollHeight: {
        configurable: true,
        get: () => (canReachSavedPosition ? 1000 : 100),
      },
      scrollTop: {
        configurable: true,
        get: () => scrollTop,
      },
      scrollTo: { configurable: true, value: scrollTo },
    });
    document.body.appendChild(scrollRoot);

    const cancel = restoreAppScrollPosition(640, {
      maxAttempts: 4,
      retryDelayMs: 10,
    });

    jest.runOnlyPendingTimers();
    expect(scrollTop).toBe(0);

    canReachSavedPosition = true;
    jest.advanceTimersByTime(10);
    jest.runOnlyPendingTimers();

    expect(scrollTop).toBe(640);
    expect(scrollTo).toHaveBeenCalledTimes(2);
    cancel();
  });
});
