import {
  normalizeFocusKey,
  roleLabel,
} from "@/components/smart-picks/smart-picks-format";

describe("smart picks formatters", () => {
  it("normalizes focus keys and coverage role labels", () => {
    expect(normalizeFocusKey("Azelaic acid / SPF 50+")).toBe(
      "azelaic-acid-spf-50",
    );
    expect(roleLabel("treatment-secondary")).toBe("Second treatment");
  });
});
