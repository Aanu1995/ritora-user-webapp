import {
  buildSkinProfileSectionHref,
  navigateAfterSkinProfileSectionSave,
  readSkinProfileSectionReturnTo,
  SKIN_PROFILE_RETURN_TO_PARAM,
  type SkinProfileReturnRouter,
} from "@/lib/skin-profile-section-return-navigation";
import { consumeAppScrollRestoreRequest } from "@/lib/app-scroll-restoration";

function createRouter(): SkinProfileReturnRouter & {
  back: jest.Mock<void, []>;
  replace: jest.Mock<void, [string]>;
} {
  return {
    back: jest.fn(),
    replace: jest.fn(),
  };
}

describe("skin-profile-section-return-navigation", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("adds a safe source page to optional section links", () => {
    expect(buildSkinProfileSectionHref("/skin-profile/reactions")).toBe(
      `/skin-profile/reactions?${SKIN_PROFILE_RETURN_TO_PARAM}=%2Fskin-profile`,
    );
  });

  it("reads only safe non-section return targets", () => {
    expect(
      readSkinProfileSectionReturnTo(
        new URLSearchParams(`${SKIN_PROFILE_RETURN_TO_PARAM}=/dashboard`),
        "/skin-profile/reactions",
      ),
    ).toBe("/dashboard");
    expect(
      readSkinProfileSectionReturnTo(
        new URLSearchParams(
          `${SKIN_PROFILE_RETURN_TO_PARAM}=https://example.com`,
        ),
        "/skin-profile/reactions",
      ),
    ).toBeNull();
    expect(
      readSkinProfileSectionReturnTo(
        new URLSearchParams(`${SKIN_PROFILE_RETURN_TO_PARAM}=//example.com`),
        "/skin-profile/reactions",
      ),
    ).toBeNull();
    expect(
      readSkinProfileSectionReturnTo(
        new URLSearchParams(`${SKIN_PROFILE_RETURN_TO_PARAM}=/skin-profile`),
        "/skin-profile/reactions",
      ),
    ).toBe("/skin-profile");
    expect(
      readSkinProfileSectionReturnTo(
        new URLSearchParams(
          `${SKIN_PROFILE_RETURN_TO_PARAM}=/skin-profile/lifestyle`,
        ),
        "/skin-profile/reactions",
      ),
    ).toBeNull();
  });

  it("returns to the explicit source after save", () => {
    const router = createRouter();
    const historyGo = jest.fn();

    navigateAfterSkinProfileSectionSave({
      router,
      release: { hadHistoryEntry: true },
      returnToHref: "/dashboard",
      browserHistory: { length: 4, go: historyGo },
    });

    expect(router.replace).toHaveBeenCalledWith("/dashboard");
    expect(consumeAppScrollRestoreRequest("/dashboard")).toBe(true);
    expect(router.back).not.toHaveBeenCalled();
    expect(historyGo).not.toHaveBeenCalled();
  });

  it("skips the dirty guard sentinel when using browser history fallback", () => {
    const router = createRouter();
    const historyGo = jest.fn();

    navigateAfterSkinProfileSectionSave({
      router,
      release: { hadHistoryEntry: true },
      returnToHref: null,
      browserHistory: { length: 3, go: historyGo },
    });

    expect(historyGo).toHaveBeenCalledWith(-2);
    expect(router.back).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("uses ordinary back navigation when no dirty sentinel exists", () => {
    const router = createRouter();
    const historyGo = jest.fn();

    navigateAfterSkinProfileSectionSave({
      router,
      release: { hadHistoryEntry: false },
      returnToHref: null,
      browserHistory: { length: 2, go: historyGo },
    });

    expect(router.back).toHaveBeenCalledTimes(1);
    expect(historyGo).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("falls back to skin profile when there is no previous page", () => {
    const router = createRouter();

    navigateAfterSkinProfileSectionSave({
      router,
      release: { hadHistoryEntry: false },
      returnToHref: null,
      browserHistory: { length: 1, go: jest.fn() },
    });

    expect(router.replace).toHaveBeenCalledWith("/skin-profile");
    expect(consumeAppScrollRestoreRequest("/skin-profile")).toBe(true);
    expect(router.back).not.toHaveBeenCalled();
  });
});
