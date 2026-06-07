import {
  normalizeFocusKey,
  roleLabel,
  translateSmartPicksProfileValue,
} from "@/components/smart-picks/smart-picks-format";
import type { useTranslations } from "next-intl";

type Translator = ReturnType<typeof useTranslations>;

function translator(labels: Record<string, string>): Translator {
  const translate = jest.fn((key: string) => {
    const label = labels[key];

    if (!label) {
      throw new Error(`Missing translation for ${key}`);
    }

    return label;
  }) as jest.Mock<string, [string]> & {
    has: jest.Mock<boolean, [string]>;
  };

  translate.has = jest.fn((key: string) => key in labels);

  return translate as Translator;
}

describe("smart picks formatters", () => {
  it("normalizes focus keys and coverage role labels", () => {
    expect(normalizeFocusKey("Azelaic acid / SPF 50+")).toBe(
      "azelaic-acid-spf-50",
    );
    expect(roleLabel("treatment-secondary")).toBe("Second treatment");
  });

  it("translates known skin profile values and comma-separated enum lists", () => {
    const tProfile = translator({
      "options.acne": "Acne",
      "options.dark_marks": "Dark marks",
      "options.texture": "Texture",
      "options.uneven_tone": "Uneven tone",
    });

    expect(translateSmartPicksProfileValue(tProfile, "acne")).toBe("Acne");
    expect(
      translateSmartPicksProfileValue(
        tProfile,
        "dark_marks, acne, texture",
      ),
    ).toBe("Dark marks, Acne, Texture");
    expect(
      translateSmartPicksProfileValue(tProfile, "dark_marks, uneven_tone"),
    ).toBe("Dark marks, Uneven tone");
  });

  it("leaves free-text smart pick values alone without probing missing keys", () => {
    const tProfile = translator({
      "options.acne": "Acne",
    }) as Translator & {
      mock: jest.Mock;
    };

    const category =
      "retinoid serum or cream (retinol/retinal/adapalene lane)";
    const step = "vitamin C or other antioxidant serum";

    expect(translateSmartPicksProfileValue(tProfile, category)).toBe(
      category,
    );
    expect(translateSmartPicksProfileValue(tProfile, step)).toBe(step);
    expect(tProfile).not.toHaveBeenCalled();
  });
});
