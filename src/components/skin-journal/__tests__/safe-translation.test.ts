import { safeDynamicTranslation } from "../safe-translation";

describe("safeDynamicTranslation", () => {
  it("returns fallback without calling the translator when a dynamic key is missing", () => {
    const translate = jest.fn((key: string) => `translated:${key}`) as ((
      key: string,
    ) => string) & {
      has: jest.Mock<boolean, [string]>;
    };
    translate.has = jest.fn(() => false);

    expect(
      safeDynamicTranslation(translate, "dark-marks", "Dark marks"),
    ).toBe("Dark marks");
    expect(translate.has).toHaveBeenCalledWith("dark-marks");
    expect(translate).not.toHaveBeenCalled();
  });

  it("uses the translator when the dynamic key exists", () => {
    const translate = jest.fn((key: string) => `translated:${key}`) as ((
      key: string,
    ) => string) & {
      has: jest.Mock<boolean, [string]>;
    };
    translate.has = jest.fn(() => true);

    expect(safeDynamicTranslation(translate, "dry_air", "Dry air")).toBe(
      "translated:dry_air",
    );
    expect(translate).toHaveBeenCalledWith("dry_air");
  });
});
