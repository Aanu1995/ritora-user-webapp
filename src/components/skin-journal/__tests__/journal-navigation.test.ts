import { buildJournalUploadHref } from "@/components/skin-journal/journal-navigation";

describe("buildJournalUploadHref", () => {
  it("always returns the date-locked today's upload route", () => {
    expect(buildJournalUploadHref()).toBe("/journal/upload");
  });
});
