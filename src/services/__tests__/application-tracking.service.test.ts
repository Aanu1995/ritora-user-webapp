jest.mock("@/lib/api", () => ({
  getRequest: jest.fn(),
  patchRequest: jest.fn(),
  postRequest: jest.fn(),
}));

import { getRequest, patchRequest, postRequest } from "@/lib/api";
import {
  editApplication,
  getApplicationLog,
  getApplicationLogVersions,
  recordApplication,
} from "@/services/application-tracking.service";

const mockGetRequest = getRequest as jest.MockedFunction<typeof getRequest>;
const mockPatchRequest = patchRequest as jest.MockedFunction<
  typeof patchRequest
>;
const mockPostRequest = postRequest as jest.MockedFunction<typeof postRequest>;

afterEach(() => {
  jest.clearAllMocks();
});

describe("application-tracking.service", () => {
  it("records what the user actually applied", async () => {
    mockPostRequest.mockResolvedValue({ id: "log-1" });

    await recordApplication({
      suggestionInstanceId: "suggestion-1",
      targetDate: "2026-04-29",
      targetTime: "08:00",
      items: [
        {
          stepOrder: 0,
          suggestionStepId: "step-1",
          status: "applied",
        },
      ],
    });

    expect(mockPostRequest).toHaveBeenCalledWith("/application-logs", {
      suggestionInstanceId: "suggestion-1",
      targetDate: "2026-04-29",
      targetTime: "08:00",
      items: [
        {
          stepOrder: 0,
          suggestionStepId: "step-1",
          status: "applied",
        },
      ],
    });
  });

  it("edits an application log with edit metadata", async () => {
    mockPatchRequest.mockResolvedValue({ id: "log-1", hasBeenEdited: true });

    await editApplication("log-1", {
      editReason: "Corrected the substituted serum.",
      items: [
        {
          stepOrder: 0,
          suggestionStepId: "step-1",
          status: "substituted",
          substitutedWithProductId: "product-2",
          substitutionReason: "Product ran out.",
        },
      ],
    });

    expect(mockPatchRequest).toHaveBeenCalledWith("/application-logs/log-1", {
      editReason: "Corrected the substituted serum.",
      items: [
        {
          stepOrder: 0,
          suggestionStepId: "step-1",
          status: "substituted",
          substitutedWithProductId: "product-2",
          substitutionReason: "Product ran out.",
        },
      ],
    });
  });

  it("fetches a log and its immutable versions", async () => {
    mockGetRequest.mockResolvedValueOnce({ id: "log-1" });
    mockGetRequest.mockResolvedValueOnce([]);

    await getApplicationLog("log-1");
    await getApplicationLogVersions("log-1");

    expect(mockGetRequest).toHaveBeenNthCalledWith(
      1,
      "/application-logs/log-1",
    );
    expect(mockGetRequest).toHaveBeenNthCalledWith(
      2,
      "/application-logs/log-1/versions",
    );
  });
});
