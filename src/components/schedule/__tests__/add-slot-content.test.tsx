import { fireEvent, screen, waitFor } from "@testing-library/react";
import { ApiError } from "@/lib/api-error";
import { renderWithProviders } from "@/test/utils";
import {
  AddSlotPresetMode,
  DayOfWeek,
  SlotMode,
  StepLabel,
} from "@/types/schedule";
import { AddSlotContent } from "../add-slot-content";

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

const mockCreateSlots = jest.fn();
const mockApplyPreset = jest.fn();
const mockUpdateAiConsentMutate = jest.fn();
let mockAiConsentGranted = false;
let capabilityOverrides: Partial<Record<string, boolean>> = {};

jest.mock("@/hooks/use-schedule", () => ({
  useCreateSlots: () => ({
    mutate: mockCreateSlots,
    isPending: false,
  }),
  useApplyPreset: () => ({
    mutate: mockApplyPreset,
    isPending: false,
  }),
}));

jest.mock("@/hooks/use-suggestions", () => ({
  useSuggestionAiConsent: () => ({
    data: {
      granted: mockAiConsentGranted,
      grantedAt: mockAiConsentGranted ? "2026-05-07T09:00:00.000Z" : null,
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

describe("AddSlotContent", () => {
  beforeEach(() => {
    mockCreateSlots.mockReset();
    mockApplyPreset.mockReset();
    mockUpdateAiConsentMutate.mockReset();
    mockAiConsentGranted = false;
    capabilityOverrides = {};
  });

  it("submits partial multi-day creates through one batch mutation", async () => {
    const onClose = jest.fn();

    mockCreateSlots.mockImplementation((_payload, options) => {
      options?.onSuccess?.({ slots: [] }, _payload, undefined);
    });

    renderWithProviders(
      <AddSlotContent
        presetMode={AddSlotPresetMode.EveryDay}
        preselectDay={null}
        onClose={onClose}
      />,
    );

    const dayButtons = screen
      .getAllByRole("button")
      .filter((button) => button.hasAttribute("aria-pressed"));

    fireEvent.click(dayButtons[0]);
    fireEvent.click(screen.getByRole("button", { name: /add to 6 days/i }));

    await waitFor(() => {
      expect(mockCreateSlots).toHaveBeenCalledWith(
        {
          daysOfWeek: [
            DayOfWeek.Tue,
            DayOfWeek.Wed,
            DayOfWeek.Thu,
            DayOfWeek.Fri,
            DayOfWeek.Sat,
            DayOfWeek.Sun,
          ],
          slotTime: "08:00",
          mode: SlotMode.AI,
          slotNotes: "",
          specialistProviderName: "",
          specialistClinicName: "",
          specialistActiveSince: null,
          specialistSafetyNotes: "",
          steps: [],
        },
        expect.any(Object),
      );
      expect(mockApplyPreset).not.toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("renders a form-level server error instead of relying on a toast", async () => {
    mockCreateSlots.mockImplementation((_payload, options) => {
      options?.onError?.(
        new ApiError("Could not save schedule", {
          status: 500,
        }),
        _payload,
        undefined,
      );
    });

    renderWithProviders(
      <AddSlotContent
        presetMode={AddSlotPresetMode.Single}
        preselectDay={DayOfWeek.Mon}
        onClose={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /add time/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        /could not save schedule/i,
      );
    });
  });

  it("submits manual notes, specialist details, and initial steps during create", async () => {
    mockCreateSlots.mockImplementation((_payload, options) => {
      options?.onSuccess?.({ slots: [] }, _payload, undefined);
    });

    renderWithProviders(
      <AddSlotContent
        presetMode={AddSlotPresetMode.Single}
        preselectDay={DayOfWeek.Mon}
        onClose={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("radio", { name: /manual/i }));
    fireEvent.change(screen.getByLabelText("Notes"), {
      target: { value: "Keep this gentle after training." },
    });
    fireEvent.change(screen.getByLabelText(/specialist name/i), {
      target: { value: "Dr Lina Berg" },
    });
    fireEvent.change(screen.getByLabelText(/clinic/i), {
      target: { value: "Nord Skin Clinic" },
    });
    fireEvent.change(screen.getByLabelText(/specialist safety notes/i), {
      target: { value: "Do not move the treatment step." },
    });
    fireEvent.click(screen.getByRole("button", { name: /add step/i }));
    fireEvent.click(screen.getByRole("button", { name: /add time/i }));

    await waitFor(() => {
      expect(mockCreateSlots).toHaveBeenCalledWith(
        expect.objectContaining({
          daysOfWeek: [DayOfWeek.Mon],
          mode: SlotMode.Manual,
          slotNotes: "Keep this gentle after training.",
          specialistProviderName: "Dr Lina Berg",
          specialistClinicName: "Nord Skin Clinic",
          specialistActiveSince: null,
          specialistSafetyNotes: "Do not move the treatment step.",
          steps: [
            expect.objectContaining({
              stepOrder: 0,
              stepLabel: StepLabel.Cleanser,
            }),
          ],
        }),
        expect.any(Object),
      );
    });
  });

  it("offers AI suggestion consent while creating AI schedule slots", () => {
    renderWithProviders(
      <AddSlotContent
        presetMode={AddSlotPresetMode.Single}
        preselectDay={DayOfWeek.Mon}
        onClose={jest.fn()}
      />,
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

  it("disables AI schedule creation without rendering capability-disabled copy", () => {
    capabilityOverrides = { aiGeneration: false };

    renderWithProviders(
      <AddSlotContent
        presetMode={AddSlotPresetMode.Single}
        preselectDay={DayOfWeek.Mon}
        onClose={jest.fn()}
      />,
    );

    expect(screen.getByRole("radio", { name: /ai/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /add time/i })).toBeDisabled();
    expect(screen.queryByText(/temporarily unavailable/i)).not.toBeInTheDocument();
  });
});
