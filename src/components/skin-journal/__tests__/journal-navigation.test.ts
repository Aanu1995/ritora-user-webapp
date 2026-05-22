import {
  JournalUploadMode,
  buildJournalUploadHref,
} from "@/components/skin-journal/journal-navigation";

describe("buildJournalUploadHref", () => {
  it("always returns the date-locked today's upload route", () => {
    expect(buildJournalUploadHref()).toBe("/journal/upload");
  });

  it("keeps replace as an edit intent without adding a date parameter", () => {
    expect(buildJournalUploadHref({ mode: JournalUploadMode.Edit })).toBe(
      "/journal/upload?mode=edit",
    );
  });
});
