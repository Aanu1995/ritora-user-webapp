import { waitFor } from "@testing-library/react";
import { renderHookWithProviders } from "@/test/utils";
import {
  useApplicationLog,
  useApplicationLogVersions,
  useEditApplication,
  useRecordApplication,
} from "@/hooks/use-application-tracking";
import {
  editApplication,
  getApplicationLog,
  getApplicationLogVersions,
  recordApplication,
} from "@/services/application-tracking.service";
import type {
  ApplicationLog,
  ApplicationLogVersion,
} from "@/types/application-tracking";

jest.mock("@/hooks/use-auth-enabled", () => ({
  useAuthEnabled: () => true,
}));

jest.mock("@/services/application-tracking.service", () => ({
  recordApplication: jest.fn(),
  editApplication: jest.fn(),
  getApplicationLog: jest.fn(),
  getApplicationLogVersions: jest.fn(),
}));

const mockRecord = recordApplication as jest.MockedFunction<
  typeof recordApplication
>;
const mockEdit = editApplication as jest.MockedFunction<typeof editApplication>;
const mockGetLog = getApplicationLog as jest.MockedFunction<
  typeof getApplicationLog
>;
const mockGetVersions = getApplicationLogVersions as jest.MockedFunction<
  typeof getApplicationLogVersions
>;

afterEach(() => {
  jest.clearAllMocks();
});

describe("application tracking hooks", () => {
  it("records and edits applications through mutate", async () => {
    mockRecord.mockResolvedValue(applicationLog());
    mockEdit.mockResolvedValue(applicationLog({ editCount: 1 }));

    const record = renderHookWithProviders(() => useRecordApplication());
    record.result.current.mutate({
      suggestionInstanceId: "suggestion-1",
      targetDate: "2026-05-04",
      items: [{ stepOrder: 0, status: "applied" }],
    });
    await waitFor(() => expect(mockRecord).toHaveBeenCalled());

    const edit = renderHookWithProviders(() => useEditApplication());
    edit.result.current.mutate({
      id: "log-1",
      payload: {
        editReason: "Corrected product.",
        items: [{ stepOrder: 0, status: "skipped" }],
      },
    });
    await waitFor(() => expect(mockEdit).toHaveBeenCalled());
    expect(mockEdit).toHaveBeenCalledWith("log-1", {
      editReason: "Corrected product.",
      items: [{ stepOrder: 0, status: "skipped" }],
    });
  });

  it("fetches logs and immutable versions only when ids are present", async () => {
    mockGetLog.mockResolvedValue(applicationLog());
    mockGetVersions.mockResolvedValue([applicationVersion()]);

    const log = renderHookWithProviders(() => useApplicationLog("log-1"));
    await waitFor(() => expect(log.result.current.isSuccess).toBe(true));
    expect(mockGetLog).toHaveBeenCalledWith(
      "log-1",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );

    const versions = renderHookWithProviders(() =>
      useApplicationLogVersions("log-1"),
    );
    await waitFor(() => expect(versions.result.current.isSuccess).toBe(true));
    expect(mockGetVersions).toHaveBeenCalledWith(
      "log-1",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });
});

function applicationLog(partial: Partial<ApplicationLog> = {}): ApplicationLog {
  return {
    id: "log-1",
    suggestionInstanceId: "suggestion-1",
    slotId: "slot-1",
    targetDate: "2026-05-04",
    targetTime: "08:00",
    daypart: "morning",
    appliedAt: "2026-05-04T08:05:00.000Z",
    generalNotes: null,
    editReason: null,
    editCount: 0,
    hasBeenEdited: false,
    firstRecordedAt: "2026-05-04T08:05:00.000Z",
    lastEditedAt: null,
    items: [],
    createdAt: "2026-05-04T08:05:00.000Z",
    updatedAt: "2026-05-04T08:05:00.000Z",
    ...partial,
  };
}

function applicationVersion(): ApplicationLogVersion {
  return {
    id: "version-1",
    applicationLogId: "log-1",
    version: 1,
    editedAt: "2026-05-04T08:10:00.000Z",
    editedByUserId: "user-1",
    editReason: "Corrected product.",
    snapshot: {
      version: 1,
      applied_at: "2026-05-04T08:05:00.000Z",
      general_notes: null,
      items: [],
      edited_at: "2026-05-04T08:10:00.000Z",
      edited_by_user_id: "user-1",
      edit_reason: "Corrected product.",
    },
  };
}
