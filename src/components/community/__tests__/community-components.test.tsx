import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import svMessages from "../../../../messages/sv.json";
import { CommunityPage } from "@/components/community/community-page";
import {
  ShareWhatWorkedPanel,
  WriteReviewPanel,
} from "@/components/community/community-eligibility";
import { ForYou } from "@/components/community/community-lists";
import { CommunityRoutineDetailPage } from "@/components/community/community-routine-detail-page";
import { MySubmissions } from "@/components/community/community-submissions";
import {
  adaptCommunityRoutine,
  acceptCommunityGuidelines,
  createCommunityReview,
  createCommunityRoutine,
  getCommunityHome,
  getCommunityRoutine,
  listMyCommunitySubmissions,
  reportCommunityReview,
  reportCommunityRoutine,
  resubmitCommunityContent,
  saveCommunityAdaptation,
  signalCommunityReviewOutcome,
  signalCommunityRoutineOutcome,
  updateCommunityReview,
  updateCommunityRoutine,
  withdrawCommunityContent,
} from "@/services/community.service";
import { renderWithProviders } from "@/test/utils";
import {
  adaptationFixture,
  blockedPosting,
  communityHomeFixture,
  eligiblePosting,
  reviewFixture,
  routineFixture,
  submissionsFixture,
} from "../test-fixtures";

const mockUseShelfProducts = jest.fn();
let mockSearchParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
}));

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock("@/services/community.service", () => ({
  acceptCommunityGuidelines: jest.fn(),
  adaptCommunityRoutine: jest.fn(),
  createCommunityReview: jest.fn(),
  createCommunityRoutine: jest.fn(),
  getCommunityHome: jest.fn(),
  getCommunityRoutine: jest.fn(),
  listMyCommunitySubmissions: jest.fn(),
  reportCommunityReview: jest.fn(),
  reportCommunityRoutine: jest.fn(),
  resubmitCommunityContent: jest.fn(),
  saveCommunityAdaptation: jest.fn(),
  signalCommunityReviewOutcome: jest.fn(),
  signalCommunityRoutineOutcome: jest.fn(),
  updateCommunityReview: jest.fn(),
  updateCommunityRoutine: jest.fn(),
  withdrawCommunityContent: jest.fn(),
}));

jest.mock("@/hooks/use-shelf", () => ({
  useShelfProducts: () => mockUseShelfProducts(),
}));

jest.mock("@/hooks/use-shelf-time-zone", () => ({
  useShelfDateContext: () => ({ timeZone: "UTC" }),
}));

const mockedGetCommunityHome = jest.mocked(getCommunityHome);
const mockedAcceptGuidelines = jest.mocked(acceptCommunityGuidelines);
const mockedCreateReview = jest.mocked(createCommunityReview);
const mockedCreateRoutine = jest.mocked(createCommunityRoutine);
const mockedGetRoutine = jest.mocked(getCommunityRoutine);
const mockedAdaptRoutine = jest.mocked(adaptCommunityRoutine);
const mockedSaveAdaptation = jest.mocked(saveCommunityAdaptation);
const mockedSignalRoutineOutcome = jest.mocked(signalCommunityRoutineOutcome);
const mockedReportRoutine = jest.mocked(reportCommunityRoutine);
const mockedReportReview = jest.mocked(reportCommunityReview);
const mockedSignalReviewOutcome = jest.mocked(signalCommunityReviewOutcome);
const mockedListSubmissions = jest.mocked(listMyCommunitySubmissions);
const mockedResubmit = jest.mocked(resubmitCommunityContent);
const mockedUpdateReview = jest.mocked(updateCommunityReview);
const mockedUpdateRoutine = jest.mocked(updateCommunityRoutine);
const mockedWithdraw = jest.mocked(withdrawCommunityContent);
const mockedToast = jest.mocked(toast);

afterEach(() => {
  jest.clearAllMocks();
});

beforeEach(() => {
  mockSearchParams = new URLSearchParams();
  mockUseShelfProducts.mockReturnValue({
    data: [
      {
        id: "product-cleanser",
        identity: {
          brand: "Ritora",
          category: "cleanser",
          name: "Milky Cleanser",
        },
      },
      {
        id: "product-cream",
        identity: {
          brand: "Ritora",
          category: "moisturizer",
          name: "Barrier Cream",
        },
      },
    ],
    isLoading: false,
  });
});

describe("ForYou", () => {
  it("localizes known backend pattern cards by id", () => {
    render(
      <NextIntlClientProvider locale="sv" messages={svMessages}>
        <ForYou
          data={{
            ...communityHomeFixture,
            profileFacets: {
              ...communityHomeFixture.profileFacets,
              concernTags: ["acne", "dryness", "sensitivity", "texture"],
            },
            patterns: [
              {
                id: "similar-users",
                title: "Community evidence is ranked by similarity, not popularity",
                body: "0 published items currently match your profile facets.",
              },
              {
                id: "routine-context",
                title: "Reviews with routine context rank higher",
                body: "Ritora requires product reviews to include the surrounding routine before they can influence matching.",
              },
              {
                id: "safe-facets",
                title: "Your private profile stays private",
                body: "4 concern tags are used without exposing exact location, email, photos, or medical history.",
              },
            ],
            reviews: [],
            routines: [],
          }}
        />
      </NextIntlClientProvider>,
    );

    expect(
      screen.getByText(
        "Gemenskapsbevis rangordnas efter likhet, inte popularitet",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "0 publicerade inlägg matchar dina profilaspekter just nu.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Recensioner med rutinsammanhang rankas högre"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Din privata profil förblir privat"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "4 hudbekymmer används utan att exponera exakt plats, e-post, foton eller medicinsk historik.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Your private profile stays private"),
    ).not.toBeInTheDocument();
  });
});

describe("CommunityPage", () => {
  it("renders matched evidence, tab navigation, reporting, and blocked-posting guidance", async () => {
    mockedGetCommunityHome.mockResolvedValue(communityHomeFixture);
    mockedAcceptGuidelines.mockResolvedValue({
      ...blockedPosting,
      hasAcceptedGuidelines: true,
    });
    mockedReportReview.mockResolvedValue({});
    mockedSignalReviewOutcome.mockResolvedValue({});
    mockedSignalRoutineOutcome.mockResolvedValue({});

    renderWithProviders(<CommunityPage />);

    expect(
      await screen.findByRole("heading", { name: "Community" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Minimal barrier support")).toBeInTheDocument();
    expect(screen.getByText("Quiet AM barrier routine")).toBeInTheDocument();
    expect(screen.getByText("Ritora Barrier Cream")).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("tab", { name: /people like me/i }),
    );
    expect(screen.getByText("92% match")).toBeInTheDocument();
    expect(screen.getByText("76% match")).toBeInTheDocument();

    const reportButtons = screen.getAllByRole("button", { name: /report/i });
    await userEvent.click(reportButtons[reportButtons.length - 1]);
    await waitFor(() =>
      expect(mockedReportReview).toHaveBeenCalledWith(
        "review-1",
        "unsafe_advice",
      ),
    );
    expect(mockedToast.success).toHaveBeenCalledWith(
      "Report submitted for moderation.",
    );

    expect(
      screen.queryByRole("tab", { name: /write review/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("tab", { name: /share what worked/i }),
    ).not.toBeInTheDocument();

    await userEvent.click(await screen.findByRole("tab", { name: /reviews/i }));
    await userEvent.click(
      screen.getByRole("button", { name: /write a review/i }),
    );
    expect(
      await screen.findByRole("dialog", {
        name: "Community posting is not available yet",
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Account age requirement").length).toBeGreaterThan(
      0,
    );
    expect(screen.getByRole("link", { name: "Verify email" })).toHaveAttribute(
      "href",
      "/resend-verification",
    );

    await userEvent.click(
      screen.getAllByRole("button", { name: /accept rules/i })[0],
    );
    await waitFor(() => expect(mockedAcceptGuidelines).toHaveBeenCalledTimes(1));
  });

  it("opens writing forms from the viewing tabs for eligible posters", async () => {
    mockedGetCommunityHome.mockResolvedValue({
      ...communityHomeFixture,
      postingEligibility: eligiblePosting,
    });

    renderWithProviders(<CommunityPage />);

    await userEvent.click(await screen.findByRole("tab", { name: /reviews/i }));
    await userEvent.click(
      screen.getByRole("button", { name: /write a review/i }),
    );
    expect(
      await screen.findByRole("button", { name: /submit review/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Pick from your shelf so people see this in context. Choose Other if it isn't on your shelf yet.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Overall satisfaction.")).toBeInTheDocument();
    expect(screen.getByText("How much it helped.")).toBeInTheDocument();
    expect(screen.getByText("1 = none, 5 = severe.")).toBeInTheDocument();
    expect(screen.getByText("How long until you knew.")).toBeInTheDocument();
    expect(
      screen.getByText("Pick from your shelf, or choose Other."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Comma-separated keywords that make this searchable.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Add nuance that ratings and tags can't show."),
    ).toBeInTheDocument();

    // Composers now open as a right-side Sheet (modal), so close it
    // before switching tabs so the test can interact with the
    // underlying page chrome again.
    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: /submit review/i }),
      ).not.toBeInTheDocument(),
    );

    await userEvent.click(screen.getByRole("tab", { name: /playbooks/i }));
    await userEvent.click(
      screen.getByRole("button", { name: /share a playbook/i }),
    );
    expect(
      await screen.findByRole("button", { name: /share playbook/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("A short name for what worked."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("What this playbook was for."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Optional. Pick the closest outcome."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("How long until you knew it worked."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Things that helped because you stopped doing them.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Optional. Sleep, food, activity, or anything else that may have helped.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Lifestyle changes"),
    ).toBeInTheDocument();
  });

  it("shows posting guidance instead of opening composer deep links for blocked posters", async () => {
    mockSearchParams = new URLSearchParams("tab=write-review");
    mockedGetCommunityHome.mockResolvedValue(communityHomeFixture);

    renderWithProviders(<CommunityPage />);

    expect(
      await screen.findByRole("dialog", {
        name: "Community posting is not available yet",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /submit review/i }),
    ).not.toBeInTheDocument();
  });

  it("shows empty matching copy and retries when the home query fails", async () => {
    mockedGetCommunityHome.mockResolvedValueOnce({
      ...communityHomeFixture,
      profileFacets: {
        skinType: null,
        concernTags: [],
        sensitivityLevel: null,
        skinToneRange: null,
        climateBucket: null,
        routinePace: null,
        goalTags: [],
      },
      patterns: [],
      routines: [],
      reviews: [],
      warnings: [],
      postingEligibility: eligiblePosting,
    });

    renderWithProviders(<CommunityPage />);

    expect(
      await screen.findByText(/Complete your skin profile for better matching/i),
    ).toBeInTheDocument();
    expect(screen.getByText("No shelf patterns yet")).toBeInTheDocument();
    expect(screen.getByText("No goal playbooks yet")).toBeInTheDocument();
    expect(screen.getByText("No published reviews yet")).toBeInTheDocument();
  });

  it("shows a retry panel when community home cannot load", async () => {
    mockedGetCommunityHome
      .mockRejectedValueOnce(new Error("Network down"))
      .mockResolvedValueOnce(communityHomeFixture);

    renderWithProviders(<CommunityPage />);

    expect(
      await screen.findByText("Community could not load"),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(
      await screen.findByText("Minimal barrier support"),
    ).toBeInTheDocument();
  });

  it("requires contextual confirmation before adding outcome evidence", async () => {
    mockedGetCommunityHome.mockResolvedValue({
      ...communityHomeFixture,
      postingEligibility: eligiblePosting,
    });
    mockedSignalRoutineOutcome.mockResolvedValue({
      signal: "worked_for_me_too",
      outcomeSignalCounts: routineFixture.outcomeSignalCounts,
    });

    renderWithProviders(<CommunityPage />);

    await userEvent.click(
      (await screen.findAllByRole("button", {
        name: /worked for me too/i,
      }))[0],
    );

    expect(
      await screen.findByRole("dialog", { name: /confirm your outcome/i }),
    ).toBeInTheDocument();

    const sameGoalSelect = document.querySelector<HTMLSelectElement>(
      'select[name="sameGoal"]',
    );
    const trialDurationSelect = document.querySelector<HTMLSelectElement>(
      'select[name="trialDuration"]',
    );
    const irritationSelect = document.querySelector<HTMLSelectElement>(
      'select[name="irritationLevel"]',
    );
    if (!sameGoalSelect || !trialDurationSelect || !irritationSelect) {
      throw new Error("Expected outcome context fields.");
    }

    fireEvent.change(sameGoalSelect, { target: { value: "true" } });
    fireEvent.change(trialDurationSelect, {
      target: { value: "8-weeks" },
    });
    fireEvent.change(irritationSelect, { target: { value: "none" } });
    await userEvent.click(screen.getByText("Products"));
    await userEvent.click(screen.getByRole("button", { name: /add outcome/i }));

    await waitFor(() =>
      expect(mockedSignalRoutineOutcome).toHaveBeenCalledWith("routine-1", {
        signal: "worked_for_me_too",
        sameGoal: true,
        trialDuration: "8-weeks",
        followedParts: ["products"],
        irritationLevel: "none",
      }),
    );
  });
});

describe("community publish forms", () => {
  it("submits TanStack/Zod-backed review and routine forms from separate posting tabs", async () => {
    mockedCreateReview.mockResolvedValue({
      moderationStatus: "pending_review",
      safetyFlags: [],
    });
    mockedCreateRoutine.mockResolvedValue({
      ...routineFixture,
      moderationStatus: "published",
    });

    const reviewRender = renderWithProviders(
      <WriteReviewPanel
        eligibility={eligiblePosting}
        onExplainBlocked={jest.fn()}
      />,
    );
    const reviewContainer = reviewRender.container;

    const reviewedProductSelect =
      reviewContainer.querySelector<HTMLSelectElement>(
        'select[name="selectedShelfProductId"]',
      );
    const reviewBodyInput = reviewContainer.querySelector<HTMLTextAreaElement>(
      'textarea[name="body"]',
    );
    const contextProductSelect =
      reviewContainer.querySelector<HTMLSelectElement>(
        'select[name="selectedContextShelfProductId"]',
      );
    const outcomesInput = reviewContainer.querySelector<HTMLInputElement>(
      'input[name="outcomes"]',
    );
    const usageDurationSelect =
      reviewContainer.querySelector<HTMLSelectElement>(
        'select[name="usageDuration"]',
      );
    const frequencySelect = reviewContainer.querySelector<HTMLSelectElement>(
      'select[name="frequency"]',
    );
    const routineSlotSelect = reviewContainer.querySelector<HTMLSelectElement>(
      'select[name="routineSlot"]',
    );
    const skinResponseSelect =
      reviewContainer.querySelector<HTMLSelectElement>(
        'select[name="skinResponse"]',
      );
    const repurchaseSelect = reviewContainer.querySelector<HTMLSelectElement>(
      'select[name="repurchase"]',
    );
    const overallRatingSelect =
      reviewContainer.querySelector<HTMLSelectElement>(
        'select[name="overallRating"]',
      );
    const effectivenessRatingSelect =
      reviewContainer.querySelector<HTMLSelectElement>(
        'select[name="effectivenessRating"]',
      );
    const irritationRatingSelect =
      reviewContainer.querySelector<HTMLSelectElement>(
        'select[name="irritationRating"]',
      );
    if (
      !reviewedProductSelect ||
      !reviewBodyInput ||
      !contextProductSelect ||
      !outcomesInput ||
      !usageDurationSelect ||
      !frequencySelect ||
      !routineSlotSelect ||
      !skinResponseSelect ||
      !repurchaseSelect ||
      !overallRatingSelect ||
      !effectivenessRatingSelect ||
      !irritationRatingSelect
    ) {
      throw new Error("Expected review form fields.");
    }

    fireEvent.change(reviewedProductSelect, {
      target: { value: "product-cream" },
    });
    fireEvent.change(contextProductSelect, {
      target: { value: "product-cleanser" },
    });
    fireEvent.change(outcomesInput, {
      target: { value: "helped-overall" },
    });
    fireEvent.change(usageDurationSelect, {
      target: { value: "8-weeks" },
    });
    fireEvent.change(frequencySelect, {
      target: { value: "daily" },
    });
    fireEvent.change(routineSlotSelect, {
      target: { value: "pm" },
    });
    fireEvent.change(skinResponseSelect, {
      target: { value: "improved" },
    });
    fireEvent.change(repurchaseSelect, {
      target: { value: "yes" },
    });
    fireEvent.change(overallRatingSelect, {
      target: { value: "5" },
    });
    fireEvent.change(effectivenessRatingSelect, {
      target: { value: "4" },
    });
    fireEvent.change(irritationRatingSelect, {
      target: { value: "1" },
    });
    fireEvent.change(reviewBodyInput, {
      target: { value: "Worked nicely alongside a simple cleanser." },
    });
    await userEvent.click(screen.getByRole("button", { name: /submit review/i }));
    // Creating a review now requires confirming the editability warning
    // before the mutation fires.
    const reviewConfirmDialog = await screen.findByRole("alertdialog", {
      name: /submit this review/i,
    });
    await userEvent.click(
      within(reviewConfirmDialog).getByRole("button", {
        name: /submit review/i,
      }),
    );

    await waitFor(() => expect(mockedCreateReview).toHaveBeenCalled());
    expect(mockedCreateReview.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        productBrand: "Ritora",
        productCategory: "moisturizer",
        productName: "Barrier Cream",
        usageDuration: "8-weeks",
        frequency: "daily",
        routineSlot: "pm",
        skinResponse: "improved",
        overallRating: 5,
        effectivenessRating: 4,
        irritationRating: 1,
        outcomes: ["helped-overall"],
        routineContext: [
          {
            category: "cleanser",
            productBrand: "Ritora",
            productName: "Milky Cleanser",
          },
        ],
      }),
    );
    expect(mockedCreateReview.mock.calls[0]?.[0]).not.toHaveProperty(
      "productId",
    );
    expect(
      mockedCreateReview.mock.calls[0]?.[0].routineContext[0],
    ).not.toHaveProperty("productId");

    reviewRender.unmount();

    const routineRender = renderWithProviders(
      <ShareWhatWorkedPanel
        eligibility={eligiblePosting}
        onExplainBlocked={jest.fn()}
      />,
    );
    const routineContainer = routineRender.container;

    const routineTitleInput = routineContainer.querySelector<HTMLInputElement>(
      'input[name="title"]',
    );
    const routineProductSelect =
      routineContainer.querySelector<HTMLSelectElement>(
        'select[name="steps.0.productId"]',
      );
    const routineGoalSelect = routineContainer.querySelector<HTMLSelectElement>(
      'select[name="goal"]',
    );
    const routineResultSelect =
      routineContainer.querySelector<HTMLSelectElement>(
        'select[name="goalResult"]',
      );
    const routineTimeframeSelect =
      routineContainer.querySelector<HTMLSelectElement>(
        'select[name="timeframe"]',
      );
    const routineFrequencySelect =
      routineContainer.querySelector<HTMLSelectElement>(
        'select[name="steps.0.frequency"]',
      );
    const routineSummaryInput =
      routineContainer.querySelector<HTMLTextAreaElement>(
      'textarea[name="summary"]',
    );
    if (
      !routineTitleInput ||
      !routineProductSelect ||
      !routineGoalSelect ||
      !routineResultSelect ||
      !routineTimeframeSelect ||
      !routineFrequencySelect ||
      !routineSummaryInput
    ) {
      throw new Error("Expected routine form fields.");
    }

    fireEvent.change(routineTitleInput, {
      target: { value: "What repaired my barrier" },
    });
    fireEvent.change(routineProductSelect, {
      target: { value: "product-cleanser" },
    });
    fireEvent.change(routineGoalSelect, {
      target: { value: "barrier-repair" },
    });
    fireEvent.change(routineTimeframeSelect, {
      target: { value: "6-months" },
    });
    fireEvent.change(routineFrequencySelect, {
      target: { value: "daily" },
    });
    await userEvent.click(
      screen.getByRole("button", { name: /add another step/i }),
    );
    const secondStepSelect = routineContainer.querySelector<HTMLSelectElement>(
      'select[name="steps.1.productId"]',
    );
    const secondFrequencySelect =
      routineContainer.querySelector<HTMLSelectElement>(
        'select[name="steps.1.frequency"]',
      );
    if (!secondStepSelect || !secondFrequencySelect) {
      throw new Error("Expected second playbook step fields.");
    }
    fireEvent.change(secondStepSelect, {
      target: { value: "product-cream" },
    });
    fireEvent.change(secondFrequencySelect, {
      target: { value: "daily" },
    });
    fireEvent.change(routineSummaryInput, {
      target: { value: "Keep the first step gentle and boring." },
    });
    await userEvent.click(
      screen.getByRole("button", { name: /share playbook/i }),
    );
    // Same confirmation step for the playbook composer.
    const playbookConfirmDialog = await screen.findByRole("alertdialog", {
      name: /share this playbook/i,
    });
    await userEvent.click(
      within(playbookConfirmDialog).getByRole("button", {
        name: /share playbook/i,
      }),
    );

    await waitFor(() => expect(mockedCreateRoutine).toHaveBeenCalled());
    expect(mockedCreateRoutine.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        title: "What repaired my barrier",
        concernTags: ["barrier-repair"],
        goalTags: ["barrier-repair"],
        goalResult: null,
        timeframe: "6-months",
        avoidTags: [],
        summary: "Keep the first step gentle and boring.",
        steps: [
          expect.objectContaining({
            productId: "product-cleanser",
            slot: "pm",
            category: "cleanser",
            frequency: "daily",
            productBrand: "Ritora",
            productName: "Milky Cleanser",
          }),
          expect.objectContaining({
            productId: "product-cream",
            slot: "pm",
            category: "moisturizer",
            frequency: "daily",
            productBrand: "Ritora",
            productName: "Barrier Cream",
          }),
        ],
      }),
    );
  });
});

describe("CommunityRoutineDetailPage", () => {
  it("adapts, saves, and reports a routine while displaying safety flags", async () => {
    mockedGetRoutine.mockResolvedValue(routineFixture);
    mockedAdaptRoutine.mockResolvedValue(adaptationFixture);
    mockedSaveAdaptation.mockResolvedValue({ saved: true });
    mockedReportRoutine.mockResolvedValue({});

    renderWithProviders(<CommunityRoutineDetailPage routineId="routine-1" />);

    expect(
      await screen.findByRole("heading", { name: "Quiet AM barrier routine" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Add sunscreen when using photosensitizing actives."),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: /adapt to my shelf/i }),
    );

    expect(await screen.findByText("Kept from your shelf")).toBeInTheDocument();
    expect(screen.getByText("Swapped to alternative")).toBeInTheDocument();
    expect(screen.getByText("Removed for safety")).toBeInTheDocument();
    expect(screen.getByText("Honest gaps")).toBeInTheDocument();
    expect(screen.getByText("Ritora Calm Cream")).toBeInTheDocument();
    expect(screen.getByText("A sunscreen category gap remains.")).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: /save adaptation/i }),
    );
    expect(mockedSaveAdaptation).toHaveBeenCalledWith(
      "routine-1",
      "adaptation-1",
    );

    await userEvent.click(screen.getByRole("button", { name: /report/i }));
    await waitFor(() =>
      expect(mockedReportRoutine).toHaveBeenCalledWith(
        "routine-1",
        "unsafe_advice",
      ),
    );
  });

  it("shows a retry panel when a routine is unavailable", async () => {
    mockedGetRoutine.mockRejectedValueOnce(new Error("Hidden"));

    renderWithProviders(<CommunityRoutineDetailPage routineId="routine-404" />);

    expect(await screen.findByText("Routine could not load")).toBeInTheDocument();
  });
});

describe("MySubmissions", () => {
  it("edits returned playbooks with the full structured form", async () => {
    mockedListSubmissions.mockResolvedValue({ items: submissionsFixture });
    mockedUpdateRoutine.mockResolvedValue(routineFixture);

    renderWithProviders(<MySubmissions />);

    expect(
      await screen.findByRole("heading", { name: "My community submissions" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Remove treatment claims before resubmitting."),
    ).toBeInTheDocument();

    const routineCard = screen
      .getByText("Needs safer routine")
      .closest("article");
    if (!routineCard) throw new Error("Expected routine submission card.");

    await userEvent.click(
      within(routineCard).getByRole("button", { name: "Edit" }),
    );
    const titleInput =
      routineCard.querySelector<HTMLInputElement>('input[name="title"]');
    const lifestyleInput = routineCard.querySelector<HTMLTextAreaElement>(
      'textarea[name="summary"]',
    );
    const timeframeSelect = routineCard.querySelector<HTMLSelectElement>(
      'select[name="timeframe"]',
    );
    if (!titleInput || !lifestyleInput || !timeframeSelect) {
      throw new Error("Expected structured editable routine fields.");
    }

    fireEvent.change(titleInput, {
      target: { value: "Updated safer routine" },
    });
    fireEvent.change(lifestyleInput, {
      target: { value: "Removed treatment claims and kept it practical." },
    });
    fireEvent.change(timeframeSelect, {
      target: { value: "3-months" },
    });
    await userEvent.click(screen.getByRole("button", { name: "Save edits" }));

    await waitFor(() =>
      expect(mockedUpdateRoutine).toHaveBeenCalledWith(
        "submission-routine",
        expect.objectContaining({
          title: "Updated safer routine",
          summary: "Removed treatment claims and kept it practical.",
          timeframe: "3-months",
          disclosureType: "ordinary",
          goalTags: ["acne"],
          steps: [
            expect.objectContaining({
              productId: null,
              productBrand: "Ritora",
              productName: "Milky Cleanser",
              category: "cleanser",
              frequency: "daily",
              slot: "pm",
            }),
          ],
        }),
      ),
    );
  });

  it("edits returned reviews with shelf product context and resubmits unchanged content", async () => {
    mockedListSubmissions.mockResolvedValue({ items: submissionsFixture });
    mockedUpdateReview.mockResolvedValue(reviewFixture);
    mockedResubmit.mockResolvedValue(submissionsFixture[1]);

    renderWithProviders(<MySubmissions />);

    const reviewCard = (await screen.findByText("Rejected review")).closest(
      "article",
    );
    if (!reviewCard) throw new Error("Expected review submission card.");

    await userEvent.click(
      within(reviewCard).getByRole("button", { name: "Edit" }),
    );
    const outcomesInput =
      reviewCard.querySelector<HTMLInputElement>('input[name="outcomes"]');
    const ratingSelect = reviewCard.querySelector<HTMLSelectElement>(
      'select[name="overallRating"]',
    );
    if (!outcomesInput || !ratingSelect) {
      throw new Error("Expected structured editable review fields.");
    }

    fireEvent.change(outcomesInput, {
      target: { value: "calmer, less stinging, smoother" },
    });
    fireEvent.change(ratingSelect, { target: { value: "5" } });
    await userEvent.click(screen.getByRole("button", { name: "Save edits" }));

    await waitFor(() =>
      expect(mockedUpdateReview).toHaveBeenCalledWith(
        "submission-review",
        expect.objectContaining({
          productBrand: "Ritora",
          productName: "Barrier Cream",
          overallRating: 5,
          outcomes: ["calmer", "less stinging", "smoother"],
          routineContext: [
            expect.objectContaining({
              productBrand: "Ritora",
              productName: "Milky Cleanser",
            }),
          ],
        }),
      ),
    );

    await userEvent.click(
      within(reviewCard).getByRole("button", { name: "Resubmit unchanged" }),
    );
    expect(mockedResubmit).toHaveBeenCalledWith("submission-review");
  });

  it("offers withdrawal instead of editing for published submissions", async () => {
    mockedListSubmissions.mockResolvedValue({
      items: [
        {
          ...submissionsFixture[0],
          id: "submission-published",
          title: "Published playbook",
          status: "published",
          safetyFlags: [],
        },
      ],
    });
    mockedWithdraw.mockResolvedValue({ deleted: true });

    renderWithProviders(<MySubmissions />);

    const publishedCard = (await screen.findByText("Published playbook")).closest(
      "article",
    );
    if (!publishedCard) throw new Error("Expected published submission card.");

    expect(
      within(publishedCard).queryByRole("button", { name: "Edit" }),
    ).not.toBeInTheDocument();

    await userEvent.click(
      within(publishedCard).getByRole("button", { name: "Withdraw" }),
    );
    const dialog = await screen.findByRole("alertdialog", {
      name: "Withdraw community submission?",
    });
    await userEvent.click(within(dialog).getByRole("button", { name: "Withdraw" }));

    await waitFor(() =>
      expect(mockedWithdraw).toHaveBeenCalledWith("submission-published"),
    );
    expect(mockedToast.success).toHaveBeenCalledWith(
      "Submission withdrawn from community evidence.",
    );
  });

  it("shows an empty state when the user has no submissions", async () => {
    mockedListSubmissions.mockResolvedValue({ items: [] });

    renderWithProviders(<MySubmissions />);

    expect(
      await screen.findByText("No community submissions yet"),
    ).toBeInTheDocument();
  });
});
