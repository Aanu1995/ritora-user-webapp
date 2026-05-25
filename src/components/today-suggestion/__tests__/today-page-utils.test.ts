import { buildHeadline } from "@/components/today-suggestion/today-page-utils";

describe("buildHeadline", () => {
  it("formats dashboard and suggestion header dates with the active locale", () => {
    const headline = buildHeadline("2026-05-25", "Europe/Stockholm", "es");

    expect(headline.toLowerCase()).toContain("mayo");
    expect(headline).not.toContain("May");
  });
});
