jest.mock("@/lib/api", () => ({
  postRequest: jest.fn(),
}));

import { postRequest } from "@/lib/api";
import { createSupportFeedback } from "@/services/support.service";
import { SupportFeedbackType } from "@/types/support";

afterEach(() => jest.clearAllMocks());

describe("support.service", () => {
  it("creates user support feedback with sanitized context fields only", async () => {
    (postRequest as jest.Mock).mockResolvedValue({
      createdAt: "2026-05-22T08:00:00.000Z",
      id: "feedback-1",
      status: "new",
    });

    await expect(
      createSupportFeedback({
        context: {
          browser: "Safari",
          locale: "en",
          route: "/settings",
        },
        description: "The settings page did not save my preference.",
        title: "Settings feedback",
        type: SupportFeedbackType.Bug,
      }),
    ).resolves.toEqual({
      createdAt: "2026-05-22T08:00:00.000Z",
      id: "feedback-1",
      status: "new",
    });

    expect(postRequest).toHaveBeenCalledWith("/support/feedback", {
      context: {
        browser: "Safari",
        locale: "en",
        route: "/settings",
      },
      description: "The settings page did not save my preference.",
      title: "Settings feedback",
      type: SupportFeedbackType.Bug,
    });
  });
});
