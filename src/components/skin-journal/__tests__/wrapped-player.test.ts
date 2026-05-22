import { getSafeWrappedFrameIndex } from "../wrapped-player";

describe("getSafeWrappedFrameIndex", () => {
  it("clamps stale wrapped frame indexes after a shorter manifest refetch", () => {
    expect(getSafeWrappedFrameIndex(5, 2)).toBe(1);
    expect(getSafeWrappedFrameIndex(-1, 2)).toBe(0);
    expect(getSafeWrappedFrameIndex(0, 0)).toBe(0);
  });
});
