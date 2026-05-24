import {
  buildShelfReturnHref,
  navigateAfterShelfSave,
  readShelfReturnTo,
  SHELF_RETURN_TO_PARAM,
  type SaveNavigationRouter,
} from "@/lib/shelf-return-navigation";
import { consumeAppScrollRestoreRequest } from "@/lib/app-scroll-restoration";

function createRouter(): SaveNavigationRouter & {
  back: jest.Mock<void, []>;
  replace: jest.Mock<void, [string]>;
} {
  return {
    back: jest.fn(),
    replace: jest.fn(),
  };
}

describe("shelf-return-navigation", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("adds a same-app return target to shelf form links", () => {
    expect(buildShelfReturnHref("/shelf/new", "/community?tab=products")).toBe(
      `/shelf/new?${SHELF_RETURN_TO_PARAM}=%2Fcommunity%3Ftab%3Dproducts`,
    );
  });

  it("reads only safe internal return targets", () => {
    expect(
      readShelfReturnTo(
        new URLSearchParams(`${SHELF_RETURN_TO_PARAM}=/community`),
        "/shelf/new",
      ),
    ).toBe("/community");
    expect(
      readShelfReturnTo(
        new URLSearchParams(`${SHELF_RETURN_TO_PARAM}=https://example.com`),
        "/shelf/new",
      ),
    ).toBeNull();
    expect(
      readShelfReturnTo(
        new URLSearchParams(`${SHELF_RETURN_TO_PARAM}=//example.com/path`),
        "/shelf/new",
      ),
    ).toBeNull();
    expect(
      readShelfReturnTo(
        new URLSearchParams(`${SHELF_RETURN_TO_PARAM}=/shelf/new?draft=1`),
        "/shelf/new",
      ),
    ).toBeNull();
    expect(
      readShelfReturnTo(
        new URLSearchParams(`${SHELF_RETURN_TO_PARAM}=/shelf/product-1/edit`),
        "/shelf/new",
      ),
    ).toBeNull();
  });

  it("returns to the explicit source after save", () => {
    const router = createRouter();
    const releaseGuard = jest.fn(() => ({ hadHistoryEntry: true }));
    const historyGo = jest.fn();

    navigateAfterShelfSave({
      router,
      releaseGuard,
      fallbackHref: "/shelf",
      returnToHref: "/community",
      browserHistory: { length: 4, go: historyGo },
    });

    expect(releaseGuard).toHaveBeenCalledWith({ removeHistoryEntry: false });
    expect(router.replace).toHaveBeenCalledWith("/community");
    expect(consumeAppScrollRestoreRequest("/community")).toBe(true);
    expect(router.back).not.toHaveBeenCalled();
    expect(historyGo).not.toHaveBeenCalled();
  });

  it("skips the unsaved guard sentinel when falling back to browser history", () => {
    const router = createRouter();
    const releaseGuard = jest.fn(() => ({ hadHistoryEntry: true }));
    const historyGo = jest.fn();

    navigateAfterShelfSave({
      router,
      releaseGuard,
      fallbackHref: "/shelf",
      returnToHref: null,
      browserHistory: { length: 3, go: historyGo },
    });

    expect(historyGo).toHaveBeenCalledWith(-2);
    expect(router.back).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("uses ordinary back navigation when no guard sentinel is present", () => {
    const router = createRouter();
    const releaseGuard = jest.fn(() => ({ hadHistoryEntry: false }));
    const historyGo = jest.fn();

    navigateAfterShelfSave({
      router,
      releaseGuard,
      fallbackHref: "/shelf",
      returnToHref: null,
      browserHistory: { length: 2, go: historyGo },
    });

    expect(router.back).toHaveBeenCalledTimes(1);
    expect(historyGo).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("uses the fallback when there is no previous page to return to", () => {
    const router = createRouter();
    const releaseGuard = jest.fn(() => ({ hadHistoryEntry: false }));

    navigateAfterShelfSave({
      router,
      releaseGuard,
      fallbackHref: "/shelf",
      returnToHref: null,
      browserHistory: { length: 1, go: jest.fn() },
    });

    expect(router.replace).toHaveBeenCalledWith("/shelf");
    expect(consumeAppScrollRestoreRequest("/shelf")).toBe(true);
    expect(router.back).not.toHaveBeenCalled();
  });
});
