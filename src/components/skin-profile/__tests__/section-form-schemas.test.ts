import { reactionHistorySectionSchema } from "../section-form-schemas";

describe("skin profile section form schemas", () => {
  it("requires reaction history to be answered", () => {
    const result = reactionHistorySectionSchema.safeParse({
      reactionHistory: {
        entries: [],
      },
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues[0]?.message).toBe(
      "validation.reactionHistoryRequired",
    );
  });

  it("requires a logged reaction when known reactions is yes", () => {
    const result = reactionHistorySectionSchema.safeParse({
      reactionHistory: {
        has_known_reactions: true,
        entries: [],
      },
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues[0]?.message).toBe(
      "validation.reactionHistoryRequired",
    );
  });

  it("accepts no known reactions as complete", () => {
    const result = reactionHistorySectionSchema.safeParse({
      reactionHistory: {
        has_known_reactions: false,
        entries: [],
      },
    });

    expect(result.success).toBe(true);
  });
});
