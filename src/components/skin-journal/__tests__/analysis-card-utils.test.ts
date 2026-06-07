import type { useTranslations } from "next-intl";
import {
  formatLocations,
  translateLocationLabel,
} from "../analysis-card-utils";

type Translator = ReturnType<typeof useTranslations>;

function translator(labels: Record<string, string>): Translator {
  return ((key: string) => {
    const label = labels[key];
    if (!label) {
      throw new Error(`Missing translation for ${key}`);
    }
    return label;
  }) as Translator;
}

describe("analysis-card-utils", () => {
  it("translates photo-analysis location enum labels with a readable fallback", () => {
    const tLocations = translator({
      left_cheek: "vänster kind",
      under_eyes: "under ögonen",
    });

    expect(translateLocationLabel(tLocations, "left_cheek")).toBe(
      "vänster kind",
    );
    expect(formatLocations(["left_cheek", "under_eyes"], tLocations)).toBe(
      "vänster kind, under ögonen",
    );
    expect(translateLocationLabel(tLocations, "new_zone")).toBe("new zone");
  });
});
