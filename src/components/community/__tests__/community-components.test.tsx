import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { CommunityPage } from "@/components/community/community-page";
import { PublishPanel } from "@/components/community/community-eligibility";
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
  updateCommunityRoutine,
} from "@/services/community.service";
import { renderWithProviders } from "@/test/utils";
import {
  adaptationFixture,
  blockedPosting,
  communityHomeFixture,
  eligiblePosting,
  routineFixture,
  submissionsFixture,
} from "../test-fixtures";

jest.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
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
  updateCommunityReview: jest.fn(),
  updateCommunityRoutine: jest.fn(),
}));

const mockedGetCommunityHome = jest.mocked(getCommunityHome);
const mockedAcceptGuidelines = jest.mocked(acceptCommunityGuidelines);
const mockedCreateReview = jest.mocked(createCommunityReview);
const mockedCreateRoutine = jest.mocked(createCommunityRoutine);
const mockedGetRoutine = jest.mocked(getCommunityRoutine);
const mockedAdaptRoutine = jest.mocked(adaptCommunityRoutine);
const mockedSaveAdaptation = jest.mocked(saveCommunityAdaptation);
const mockedReportRoutine = jest.mocked(reportCommunityRoutine);
const mockedReportReview = jest.mocked(reportCommunityReview);
const mockedListSubmissions = jest.mocked(listMyCommunitySubmissions);
const mockedResubmit = jest.mocked(resubmitCommunityContent);
const mockedUpdateRoutine = jest.mocked(updateCommunityRoutine);
const mockedToast = jest.mocked(toast);

afterEach(() => {
  jest.clearAllMocks();
});

describe("CommunityPage", () => {
  it("renders matched evidence, tab navigation, reporting, and blocked-posting guidance", async () => {
    mockedGetCommunityHome.mockResolvedValue(communityHomeFixture);
    mockedAcceptGuidelines.mockResolvedValue({
      ...blockedPosting,
      hasAcceptedGuidelines: true,
    });
    mockedReportReview.mockResolvedValue({});

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

    await userEvent.click(screen.getByRole("tab", { name: /share/i }));
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
    expect(screen.getByText("No published routines yet")).toBeInTheDocument();
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
});

describe("community publish forms", () => {
  it("submits TanStack/Zod-backed review and routine forms with loading-safe payloads", async () => {
    mockedCreateReview.mockResolvedValue({
      moderationStatus: "pending_review",
      safetyFlags: [],
    });
    mockedCreateRoutine.mockResolvedValue({
      ...routineFixture,
      moderationStatus: "published",
    });

    const { container } = renderWithProviders(
      <PublishPanel eligibility={eligiblePosting} onExplainBlocked={jest.fn()} />,
    );

    const productBrandInput = container.querySelector<HTMLInputElement>(
      'input[name="productBrand"]',
    );
    const productNameInput = container.querySelector<HTMLInputElement>(
      'input[name="productName"]',
    );
    const reviewBodyInput = container.querySelector<HTMLTextAreaElement>(
      'textarea[name="body"]',
    );
    if (!productBrandInput || !productNameInput || !reviewBodyInput) {
      throw new Error("Expected review form fields.");
    }

    fireEvent.change(productBrandInput, {
      target: { value: "Ritora" },
    });
    fireEvent.change(productNameInput, {
      target: { value: "Barrier Cream" },
    });
    fireEvent.change(reviewBodyInput, {
      target: { value: "Worked nicely alongside a simple cleanser." },
    });
    await userEvent.click(screen.getByRole("button", { name: /submit review/i }));

    await waitFor(() => expect(mockedCreateReview).toHaveBeenCalled());
    expect(mockedCreateReview.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        productBrand: "Ritora",
        productName: "Barrier Cream",
        outcomes: ["helped-overall"],
        routineContext: [{ category: "cleanser" }],
      }),
    );

    const routineTitleInput = container.querySelector<HTMLInputElement>(
      'input[name="title"]',
    );
    const routineCategoryInput = container.querySelector<HTMLInputElement>(
      'input[name="category"]',
    );
    const routineSummaryInput = container.querySelector<HTMLTextAreaElement>(
      'textarea[name="summary"]',
    );
    if (!routineTitleInput || !routineCategoryInput || !routineSummaryInput) {
      throw new Error("Expected routine form fields.");
    }

    fireEvent.change(routineTitleInput, {
      target: { value: "Simple AM barrier routine" },
    });
    fireEvent.change(routineCategoryInput, {
      target: { value: "cleanser" },
    });
    fireEvent.change(routineSummaryInput, {
      target: { value: "Keep the first step gentle and boring." },
    });
    await userEvent.click(
      screen.getByRole("button", { name: /safety scan and publish/i }),
    );

    await waitFor(() => expect(mockedCreateRoutine).toHaveBeenCalled());
    expect(mockedCreateRoutine.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        title: "Simple AM barrier routine",
        concernTags: ["barrier"],
        steps: [
          expect.objectContaining({
            slot: "am",
            category: "cleanser",
            frequency: "daily",
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
  it("edits needs-edit content and resubmits rejected content", async () => {
    mockedListSubmissions.mockResolvedValue({ items: submissionsFixture });
    mockedUpdateRoutine.mockResolvedValue(routineFixture);
    mockedResubmit.mockResolvedValue(submissionsFixture[1]);

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
    const textInput =
      routineCard.querySelector<HTMLTextAreaElement>('textarea[name="text"]');
    if (!titleInput || !textInput) {
      throw new Error("Expected editable routine fields.");
    }

    fireEvent.change(titleInput, {
      target: { value: "Updated safer routine" },
    });
    fireEvent.change(textInput, {
      target: { value: "Removed treatment claims and kept it practical." },
    });
    await userEvent.click(screen.getByRole("button", { name: "Save edits" }));

    await waitFor(() =>
      expect(mockedUpdateRoutine).toHaveBeenCalledWith("submission-routine", {
        title: "Updated safer routine",
        summary: "Removed treatment claims and kept it practical.",
      }),
    );

    const reviewCard = screen.getByText("Rejected review").closest("article");
    if (!reviewCard) throw new Error("Expected review submission card.");

    await userEvent.click(
      within(reviewCard).getByRole("button", { name: "Resubmit unchanged" }),
    );
    expect(mockedResubmit).toHaveBeenCalledWith("submission-review");
  });

  it("shows an empty state when the user has no submissions", async () => {
    mockedListSubmissions.mockResolvedValue({ items: [] });

    renderWithProviders(<MySubmissions />);

    expect(
      await screen.findByText("No community submissions yet"),
    ).toBeInTheDocument();
  });
});
