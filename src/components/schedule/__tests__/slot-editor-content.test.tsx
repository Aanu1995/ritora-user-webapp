import { fireEvent, screen, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api-error";
import { renderWithProviders } from "@/test/utils";
import { DayOfWeek, SlotMode, type ScheduleSlot } from "@/types/schedule";
import { SlotEditorContent } from "../slot-editor-content";

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

const mockUpdateSlot = jest.fn();
const mockDeleteSlot = jest.fn();
const mockUpsertSteps = jest.fn();
const mockReleaseGuard = jest.fn(() => ({ hadHistoryEntry: false }));
const mockUpdateAiConsentMutate = jest.fn();
let mockAiConsentGranted = false;
let capabilityOverrides: Partial<Record<string, boolean>> = {};

jest.mock("@/hooks/use-schedule", () => ({
  useUpdateSlot: () => ({
    mutate: mockUpdateSlot,
    isPending: false,
  }),
  useDeleteSlot: () => ({
    mutate: mockDeleteSlot,
    isPending: false,
  }),
  useUpsertSteps: () => ({
    mutate: mockUpsertSteps,
    isPending: false,
  }),
}));

jest.mock("@/hooks/use-suggestions", () => ({
  useSuggestionAiConsent: () => ({
    data: {
      granted: mockAiConsentGranted,
      grantedAt: mockAiConsentGranted
        ? "2026-05-07T09:00:00.000Z"
        : null,
      canReadSensitiveContext: false,
      blockedReason: mockAiConsentGranted
        ? "sensitive_recommendation_context_consent_missing"
        : "ai_suggestion_processing_consent_missing",
      activeSensitiveConsentTypes: [],
    },
    isLoading: false,
  }),
  useUpdateSuggestionAiConsent: () => ({
    mutate: mockUpdateAiConsentMutate,
    isPending: false,
  }),
}));

jest.mock("@/hooks/use-user-capabilities", () => ({
  useUserCapabilities: () => {
    const enabled = (key: string) => capabilityOverrides[key] ?? true;
    const access = (key: string) => ({
      enabled: enabled(key),
      blockedBy: enabled(key) ? null : "platform_global_restriction",
      expiresAt: null,
      message: null,
    });

    return {
      accountCreation: access("accountCreation"),
      aiGeneration: access("aiGeneration"),
      imageUpload: access("imageUpload"),
      productExtraction: access("productExtraction"),
      notifications: access("notifications"),
      supportContact: access("supportContact"),
    };
  },
  isCapabilityDisabled: (access: { enabled?: boolean } | null | undefined) =>
    access?.enabled === false,
}));


jest.mock("@/hooks/use-unsaved-changes-guard", () => ({
  useUnsavedChangesGuard: () => ({
    releaseGuard: mockReleaseGuard,
  }),
}));

jest.mock("../routine-step-list", () => {
  const actual = jest.requireActual("../routine-step-list");

  return {
    ...actual,
    RoutineStepList: ({ errorText }: { errorText?: string }) => (
      <div>{errorText ? <p role="alert">{errorText}</p> : null}</div>
    ),
  };
});

function createSlot(overrides: Partial<ScheduleSlot> = {}): ScheduleSlot {
  return {
    id: "slot-1",
    dayOfWeek: DayOfWeek.Mon,
    slotTime: "08:00",
    mode: SlotMode.AI,
    slotNotes: null,
    specialistProviderName: null,
    specialistClinicName: null,
    specialistActiveSince: null,
    specialistSafetyNotes: null,
    steps: [],
    createdAt: "2026-04-17T00:00:00.000Z",
    updatedAt: "2026-04-17T00:00:00.000Z",
    ...overrides,
  };
}

describe("SlotEditorContent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAiConsentGranted = false;
    capabilityOverrides = {};
  });

  it("maps duplicate save errors to the time field inline", async () => {
    mockUpdateSlot.mockImplementation((_payload, options) => {
      options?.onError?.(
        new ApiError("Duplicate slot", {
          status: 400,
          body: {
            code: "SCHEDULE_SLOT_CONFLICT",
          },
        }),
        _payload,
        undefined,
      );
    });

    renderWithProviders(
      <SlotEditorContent slot={createSlot()} onClose={jest.fn()} />,
    );

    fireEvent.change(screen.getByLabelText(/time/i), {
      target: { value: "09:00" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        /a slot already exists at that day and time/i,
      );
    });
  });

  it("shows a form-level error when the slot no longer exists", async () => {
    mockUpdateSlot.mockImplementation((_payload, options) => {
      options?.onError?.(
        new ApiError("Slot not found", {
          status: 404,
          body: {
            code: "SCHEDULE_SLOT_NOT_FOUND",
          },
        }),
        _payload,
        undefined,
      );
    });

    renderWithProviders(
      <SlotEditorContent slot={createSlot()} onClose={jest.fn()} />,
    );

    fireEvent.change(screen.getByLabelText(/time/i), {
      target: { value: "09:30" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/slot not found/i);
    });
  });

  it("does not treat whitespace-only notes edits as a real change", () => {
    renderWithProviders(
      <SlotEditorContent slot={createSlot()} onClose={jest.fn()} />,
    );

    const saveButton = screen.getByRole("button", { name: /save/i });
    expect(saveButton).toBeDisabled();

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "   " },
    });

    expect(saveButton).toBeDisabled();
    expect(mockUpdateSlot).not.toHaveBeenCalled();
  });

  it("stays open and resets to a clean state after a successful save", async () => {
    const onClose = jest.fn();

    mockUpdateSlot.mockImplementation((_payload, options) => {
      options?.onSuccess?.(
        {
          ...createSlot(),
          slotTime: "09:00",
        },
        _payload,
        undefined,
      );
    });

    renderWithProviders(
      <SlotEditorContent slot={createSlot()} onClose={onClose} />,
    );

    fireEvent.change(screen.getByLabelText(/time/i), {
      target: { value: "09:00" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(mockUpdateSlot).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();
    });

    expect(onClose).not.toHaveBeenCalled();
    expect(mockReleaseGuard).toHaveBeenCalledWith({
      removeHistoryEntry: false,
    });
    expect(toast.success).toHaveBeenCalledWith("Saved");
  });

  it("saves specialist metadata from the manual slot editor", async () => {
    mockUpdateSlot.mockImplementation((_payload, options) => {
      options?.onSuccess?.(
        {
          ...createSlot({ mode: SlotMode.Manual }),
          specialistProviderName: "Dr. Lina Berg",
          specialistClinicName: "Nord Skin Clinic",
          specialistActiveSince: "2026-03-12",
          specialistSafetyNotes: "Do not change the prescribed retinoid step.",
        },
        _payload,
        undefined,
      );
    });

    renderWithProviders(
      <SlotEditorContent
        slot={createSlot({
          mode: SlotMode.Manual,
          specialistActiveSince: "2026-03-12",
        })}
        onClose={jest.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText(/specialist name/i), {
      target: { value: "Dr. Lina Berg" },
    });
    fireEvent.change(screen.getByLabelText(/clinic/i), {
      target: { value: "Nord Skin Clinic" },
    });
    fireEvent.change(screen.getByLabelText(/specialist safety notes/i), {
      target: { value: "Do not change the prescribed retinoid step." },
    });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(mockUpdateSlot).toHaveBeenCalledWith(
        {
          id: "slot-1",
          payload: expect.objectContaining({
            specialistProviderName: "Dr. Lina Berg",
            specialistClinicName: "Nord Skin Clinic",
            specialistActiveSince: "2026-03-12",
            specialistSafetyNotes:
              "Do not change the prescribed retinoid step.",
          }),
        },
        expect.any(Object),
      );
    });
  });

  it("offers AI suggestion consent while editing AI schedule slots", () => {
    renderWithProviders(
      <SlotEditorContent slot={createSlot()} onClose={jest.fn()} />,
    );

    expect(
      screen.getByText(/Personalized routines, made for your skin/i),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /allow ai suggestions/i }),
    );

    expect(mockUpdateAiConsentMutate).toHaveBeenCalledWith(
      { granted: true },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it("disables AI slot saves without rendering capability-disabled copy", () => {
    capabilityOverrides = { aiGeneration: false };

    renderWithProviders(
      <SlotEditorContent slot={createSlot()} onClose={jest.fn()} />,
    );

    fireEvent.change(screen.getByLabelText(/time/i), {
      target: { value: "09:00" },
    });

    expect(screen.getByRole("radio", { name: /ai/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();
    expect(screen.queryByText(/temporarily unavailable/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /save/i }));
    expect(mockUpdateSlot).not.toHaveBeenCalled();
  });
});
