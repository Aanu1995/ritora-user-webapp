jest.mock("@/lib/api", () => ({
  deleteRequest: jest.fn(),
  getRequest: jest.fn(),
  patchRequest: jest.fn(),
  postRequest: jest.fn(),
}));

import {
  deleteRequest,
  getRequest,
  patchRequest,
  postRequest,
} from "@/lib/api";
import {
  acceptCommunityGuidelines,
  adaptCommunityRoutine,
  createCommunityReview,
  createCommunityRoutine,
  getCommunityHome,
  getCommunityPostingEligibility,
  getCommunityProductEvidence,
  getCommunityRoutine,
  getPeopleLikeMe,
  listCommunityReviewResults,
  listCommunityReviews,
  listCommunityRoutineResults,
  listCommunityRoutines,
  listCommunityWarnings,
  listMyCommunitySubmissions,
  reportCommunityReview,
  reportCommunityRoutine,
  resubmitCommunityContent,
  signalCommunityReviewOutcome,
  signalCommunityRoutineOutcome,
  updateCommunityReview,
  updateCommunityRoutine,
  voteCommunityReview,
  voteCommunityRoutine,
  withdrawCommunityContent,
} from "@/services/community.service";

afterEach(() => jest.clearAllMocks());

describe("community.service", () => {
  it("reads community discovery endpoints with abort signals", async () => {
    const controller = new AbortController();
    (getRequest as jest.Mock).mockResolvedValue({ items: [] });

    await getCommunityHome(controller.signal);
    await getCommunityPostingEligibility(controller.signal);
    await getPeopleLikeMe(controller.signal);
    await listCommunityRoutines({}, controller.signal);
    await getCommunityRoutine("routine-1", controller.signal);
    await listCommunityReviews({}, controller.signal);
    await listCommunityWarnings(controller.signal);
    await listMyCommunitySubmissions(controller.signal);
    await getCommunityProductEvidence("product-1", controller.signal);
    await listCommunityReviewResults(
      "review-1",
      { signal: "worked_for_me_too" },
      controller.signal,
    );
    await listCommunityRoutineResults(
      "routine-1",
      { signal: "worked_with_changes" },
      controller.signal,
    );

    expect(getRequest).toHaveBeenNthCalledWith(1, "/community/home", {
      signal: controller.signal,
    });
    expect(getRequest).toHaveBeenNthCalledWith(2, "/community/eligibility", {
      signal: controller.signal,
    });
    expect(getRequest).toHaveBeenNthCalledWith(3, "/community/people-like-me", {
      signal: controller.signal,
    });
    expect(getRequest).toHaveBeenNthCalledWith(4, "/community/routines", {
      signal: controller.signal,
    });
    expect(getRequest).toHaveBeenNthCalledWith(
      5,
      "/community/routines/routine-1",
      { signal: controller.signal },
    );
    expect(getRequest).toHaveBeenNthCalledWith(6, "/community/reviews", {
      signal: controller.signal,
    });
    expect(getRequest).toHaveBeenNthCalledWith(7, "/community/warnings", {
      signal: controller.signal,
    });
    expect(getRequest).toHaveBeenNthCalledWith(8, "/community/me/submissions", {
      signal: controller.signal,
    });
    expect(getRequest).toHaveBeenNthCalledWith(
      9,
      "/community/products/product-1/evidence",
      { signal: controller.signal },
    );
    expect(getRequest).toHaveBeenNthCalledWith(
      10,
      "/community/reviews/review-1/results",
      {
        params: { signal: "worked_for_me_too" },
        signal: controller.signal,
      },
    );
    expect(getRequest).toHaveBeenNthCalledWith(
      11,
      "/community/routines/routine-1/results",
      {
        params: { signal: "worked_with_changes" },
        signal: controller.signal,
      },
    );
  });

  it("sends community result pagination params to review and playbook result endpoints", async () => {
    const controller = new AbortController();
    (getRequest as jest.Mock).mockResolvedValue({
      counts: {},
      items: [],
      nextCursor: null,
    });

    await listCommunityReviewResults(
      "review-1",
      {
        cursor: "review-result-cursor",
        limit: 12,
        signal: "worked_for_me_too",
      },
      controller.signal,
    );
    await listCommunityRoutineResults(
      "routine-1",
      {
        cursor: "routine-result-cursor",
        limit: 12,
        signal: "worked_with_changes",
      },
      controller.signal,
    );

    expect(getRequest).toHaveBeenNthCalledWith(
      1,
      "/community/reviews/review-1/results",
      {
        params: {
          cursor: "review-result-cursor",
          limit: 12,
          signal: "worked_for_me_too",
        },
        signal: controller.signal,
      },
    );
    expect(getRequest).toHaveBeenNthCalledWith(
      2,
      "/community/routines/routine-1/results",
      {
        params: {
          cursor: "routine-result-cursor",
          limit: 12,
          signal: "worked_with_changes",
        },
        signal: controller.signal,
      },
    );
  });

  it("sends community pagination params to list endpoints", async () => {
    const controller = new AbortController();
    (getRequest as jest.Mock).mockResolvedValue({
      items: [],
      nextCursor: null,
    });

    await listCommunityRoutines(
      {
        cursor: "routine-cursor",
        goal: "barrier-repair",
        limit: 12,
        productRole: "moisturizer",
        search: "barrier",
      },
      controller.signal,
    );
    await listCommunityReviews(
      {
        contextProductCategory: "cleanser",
        cursor: "review-cursor",
        limit: 12,
        minRating: 4,
        productCategory: "treatment",
        routineSlot: "pm",
        search: "azelaic",
      },
      controller.signal,
    );
    await getPeopleLikeMe(
      {
        cursor: "people-cursor",
        limit: 12,
      },
      controller.signal,
    );
    await listMyCommunitySubmissions(
      {
        cursor: "mine-cursor",
        limit: 12,
      },
      controller.signal,
    );

    expect(getRequest).toHaveBeenNthCalledWith(1, "/community/routines", {
      params: {
        cursor: "routine-cursor",
        goal: "barrier-repair",
        limit: 12,
        productRole: "moisturizer",
        search: "barrier",
      },
      signal: controller.signal,
    });
    expect(getRequest).toHaveBeenNthCalledWith(2, "/community/reviews", {
      params: {
        contextProductCategory: "cleanser",
        cursor: "review-cursor",
        limit: 12,
        minRating: 4,
        productCategory: "treatment",
        routineSlot: "pm",
        search: "azelaic",
      },
      signal: controller.signal,
    });
    expect(getRequest).toHaveBeenNthCalledWith(
      3,
      "/community/people-like-me",
      {
        params: {
          cursor: "people-cursor",
          limit: 12,
        },
        signal: controller.signal,
      },
    );
    expect(getRequest).toHaveBeenNthCalledWith(
      4,
      "/community/me/submissions",
      {
        params: {
          cursor: "mine-cursor",
          limit: 12,
        },
        signal: controller.signal,
      },
    );
  });

  it("creates reviews and routines through guarded publish endpoints", async () => {
    (postRequest as jest.Mock).mockResolvedValue({
      moderationStatus: "published",
    });

    await createCommunityReview({
      productBrand: "Ritora",
      productName: "Barrier Cream",
      productCategory: "moisturizer",
      disclosureType: "ordinary",
      usageDuration: "4-weeks",
      frequency: "daily",
      routineContextUsage: "with_products",
      routineSlot: "pm",
      skinResponse: "improved",
      overallRating: 5,
      effectivenessRating: 4,
      irritationRating: 1,
      outcomes: ["helped"],
      repurchase: "yes",
      routineContext: [{ category: "cleanser", productName: "Milky Cleanser" }],
      body: "Worked well in a simple routine.",
    });
    await createCommunityRoutine({
      title: "Simple AM",
      summary: "Gentle routine",
      disclosureType: "ordinary",
      concernTags: ["barrier"],
      goalTags: ["barrier-repair"],
      goalResult: "mostly_improved",
      timeframe: "6-months",
      avoidTags: ["over-exfoliation"],
      habitTags: ["consistent-sleep"],
      didNotWorkTags: ["daily-acids"],
      warningTags: ["patch-test-first"],
      steps: [
        {
          slot: "am",
          productId: "product-1",
          category: "cleanser",
          frequency: "daily",
        },
        {
          slot: "pm",
          productName: "Barrier Cream",
          category: "moisturizer",
          frequency: "daily",
        },
      ],
    });
    await acceptCommunityGuidelines();

    expect(postRequest).toHaveBeenNthCalledWith(
      1,
      "/community/reviews",
      expect.objectContaining({ productName: "Barrier Cream" }),
    );
    expect(postRequest).toHaveBeenNthCalledWith(
      2,
      "/community/routines",
      expect.objectContaining({ title: "Simple AM" }),
    );
    expect(postRequest).toHaveBeenNthCalledWith(
      3,
      "/community/guidelines/accept",
    );
  });

  it("sends report, adaptation, save, edit, and resubmit actions to the expected routes", async () => {
    (postRequest as jest.Mock).mockResolvedValue({ saved: true });
    (patchRequest as jest.Mock).mockResolvedValue({ id: "content-1" });

    await reportCommunityRoutine("routine-1", "unsafe_advice", "Layering risk");
    await reportCommunityReview("review-1", "spam");
    await adaptCommunityRoutine("routine-1");
    await voteCommunityRoutine("routine-1", "helpful");
    await voteCommunityReview("review-1", "not_helpful");
    await signalCommunityRoutineOutcome("routine-1", {
      signal: "worked_for_me_too",
      sameGoal: true,
      trialDuration: "8-weeks",
      followedParts: ["products"],
      irritationLevel: "none",
    });
    await signalCommunityReviewOutcome("review-1", {
      signal: "mixed_result",
      sameGoal: false,
      trialDuration: "4-weeks",
      followedParts: ["products", "routine-timing"],
      irritationLevel: "mild",
      note: "It worked better with a gentle cleanser.",
      routineSlot: "pm",
      usedWithProducts: [
        {
          category: "cleanser",
          productBrand: "Ritora",
          productName: "Milky Cleanser",
        },
      ],
    });
    await resubmitCommunityContent("content-1");
    await updateCommunityRoutine("routine-1", {
      title: "Updated",
      summary: "Safer wording",
    });
    await updateCommunityReview("review-1", { body: "Safer review" });

    expect(postRequest).toHaveBeenNthCalledWith(
      1,
      "/community/routines/routine-1/report",
      { reason: "unsafe_advice", note: "Layering risk" },
    );
    expect(postRequest).toHaveBeenNthCalledWith(
      2,
      "/community/reviews/review-1/report",
      { reason: "spam", note: undefined },
    );
    expect(postRequest).toHaveBeenNthCalledWith(
      3,
      "/community/routines/routine-1/adapt-to-shelf",
    );
    expect(postRequest).toHaveBeenNthCalledWith(
      4,
      "/community/routines/routine-1/helpfulness",
      { vote: "helpful" },
    );
    expect(postRequest).toHaveBeenNthCalledWith(
      5,
      "/community/reviews/review-1/helpfulness",
      { vote: "not_helpful" },
    );
    expect(postRequest).toHaveBeenNthCalledWith(
      6,
      "/community/routines/routine-1/outcome-signal",
      {
        signal: "worked_for_me_too",
        sameGoal: true,
        trialDuration: "8-weeks",
        followedParts: ["products"],
        irritationLevel: "none",
      },
    );
    expect(postRequest).toHaveBeenNthCalledWith(
      7,
      "/community/reviews/review-1/outcome-signal",
      {
        signal: "mixed_result",
        sameGoal: false,
        trialDuration: "4-weeks",
        followedParts: ["products", "routine-timing"],
        irritationLevel: "mild",
        note: "It worked better with a gentle cleanser.",
        routineSlot: "pm",
        usedWithProducts: [
          {
            category: "cleanser",
            productBrand: "Ritora",
            productName: "Milky Cleanser",
          },
        ],
      },
    );
    expect(postRequest).toHaveBeenNthCalledWith(
      8,
      "/community/content/content-1/resubmit",
    );
    expect(patchRequest).toHaveBeenNthCalledWith(
      1,
      "/community/routines/routine-1",
      { title: "Updated", summary: "Safer wording" },
    );
    expect(patchRequest).toHaveBeenNthCalledWith(
      2,
      "/community/reviews/review-1",
      { body: "Safer review" },
    );
  });

  it("withdraws content through the delete endpoint", async () => {
    (deleteRequest as jest.Mock).mockResolvedValue({ deleted: true });

    await expect(withdrawCommunityContent("content-1")).resolves.toEqual({
      deleted: true,
    });

    expect(deleteRequest).toHaveBeenCalledWith("/community/content/content-1");
  });
});
