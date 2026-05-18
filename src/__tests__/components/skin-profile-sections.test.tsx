import { createRef } from "react";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/utils";
import {
  mockSkinProfile,
  mockSkinProfileOptions,
} from "@/test/skin-profile-fixtures";
import type {
  SkinProfile,
  SkinProfileInput,
  SkinProfileOptions,
} from "@/types/skin-profile";
import { ActiveToleranceSection } from "@/components/skin-profile/active-tolerance-section";
import { HormonalSection } from "@/components/skin-profile/hormonal-section";
import {
  MedicalSafetySection,
  type SectionFormHandle,
} from "@/components/skin-profile/medical-safety-section";
import { LifestyleSection } from "@/components/skin-profile/lifestyle-section";
import { ReactionsSection } from "@/components/skin-profile/reactions-section";
import { SunPigmentSection } from "@/components/skin-profile/sun-pigment-section";

type MutationOptions = {
  onSuccess?: (profile: SkinProfile) => void;
  onError?: (error: Error) => void;
};

type UpdateMutate = (
  variables: SkinProfileInput,
  options?: MutationOptions,
) => void;

type DeleteMutate = (
  variables?: undefined,
  options?: MutationOptions,
) => void;

let mockUpdateMutate: jest.MockedFunction<UpdateMutate>;
let mockDeleteHealthMutate: jest.MockedFunction<DeleteMutate>;
let mockDeleteHormonalMutate: jest.MockedFunction<DeleteMutate>;
let mockReleaseGuard: jest.MockedFunction<() => void>;
let mockRequestLeave: jest.MockedFunction<(callback: () => void) => void>;
let mockRouterPush: jest.MockedFunction<(href: string) => void>;
const mockToastSuccess = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockRouterPush,
    refresh: jest.fn(),
  }),
}));

jest.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
  },
}));

jest.mock("@/components/ui/select", () => ({
  Select: ({
    value,
    onValueChange,
    children,
  }: {
    value: string;
    onValueChange?: (value: string) => void;
    children: React.ReactNode;
  }) => (
    <select
      value={value}
      onChange={(event) => onValueChange?.(event.target.value)}
    >
      {children}
    </select>
  ),
  SelectTrigger: () => null,
  SelectValue: () => null,
  SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectItem: ({
    value,
    children,
  }: {
    value: string;
    children: React.ReactNode;
  }) => <option value={value}>{children}</option>,
}));

jest.mock("@/hooks/use-skin-profile", () => ({
  useUpdateSkinProfile: () => ({
    mutate: mockUpdateMutate,
    isPending: false,
  }),
  useDeleteSkinProfileHealthContext: () => ({
    mutate: mockDeleteHealthMutate,
    isPending: false,
  }),
  useDeleteSkinProfileHormonalContext: () => ({
    mutate: mockDeleteHormonalMutate,
    isPending: false,
  }),
}));

jest.mock("@/hooks/use-unsaved-changes-guard", () => ({
  useUnsavedChangesGuard: () => ({
    releaseGuard: mockReleaseGuard,
  }),
}));

jest.mock("@/stores/unsaved-changes-store", () => ({
  useUnsavedChangesStore: (
    selector: (state: {
      requestLeave: (callback: () => void) => void;
    }) => unknown,
  ) => selector({ requestLeave: mockRequestLeave }),
}));

function submitSection(ref: React.RefObject<SectionFormHandle | null>) {
  act(() => {
    ref.current?.submit();
  });
}

function renderMedicalSafetySection(
  profile: SkinProfile,
  options: SkinProfileOptions = mockSkinProfileOptions,
) {
  const ref = createRef<SectionFormHandle>();
  const onPendingChange = jest.fn();
  renderWithProviders(
    <MedicalSafetySection
      ref={ref}
      profile={profile}
      options={options}
      onPendingChange={onPendingChange}
    />,
  );
  return { ref, onPendingChange };
}

function renderForwardedSection(
  ui: (ref: React.RefObject<SectionFormHandle | null>) => React.ReactElement,
) {
  const ref = createRef<SectionFormHandle>();
  const result = renderWithProviders(ui(ref));
  return { ref, result };
}

function mergedProfile(input: Partial<SkinProfile>): SkinProfile {
  return {
    ...mockSkinProfile,
    ...input,
  };
}

describe("skin profile optional sections", () => {
  beforeEach(() => {
    mockRouterPush = jest.fn();
    mockReleaseGuard = jest.fn();
    mockRequestLeave = jest.fn((callback) => callback());
    mockToastSuccess.mockClear();
    mockUpdateMutate = jest.fn((variables, options) => {
      options?.onSuccess?.(mergedProfile(variables as Partial<SkinProfile>));
    });
    mockDeleteHealthMutate = jest.fn((_variables, options) => {
      options?.onSuccess?.(
        mergedProfile({
          hasHealthContextConsent: false,
          pregnancyStatus: null,
          underDermatologistCare: null,
          safetyContext: {},
        }),
      );
    });
    mockDeleteHormonalMutate = jest.fn((_variables, options) => {
      options?.onSuccess?.(
        mergedProfile({
          hasHormonalContextConsent: false,
          hormonalContext: {},
        }),
      );
    });
  });

  it("submits and deletes medical safety data after consent is active", async () => {
    const user = userEvent.setup();
    const profile = mergedProfile({
      hasHealthContextConsent: true,
      pregnancyStatus: "not_pregnant",
      underDermatologistCare: null,
      safetyContext: {
        conditions: ["rosacea"],
        medications: [],
        photosensitizing_other: false,
        recent_procedures: [],
      },
    });
    const { ref, onPendingChange } = renderMedicalSafetySection(profile);

    expect(onPendingChange).toHaveBeenCalledWith(false);
    expect(screen.getByText(/health-data consent active/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Eczema" }));
    await user.click(
      screen.getByRole("button", { name: "Topical retinoid" }),
    );
    await user.click(
      screen.getByRole("checkbox", {
        name: /other medications that may cause photosensitivity/i,
      }),
    );
    await user.click(screen.getByRole("button", { name: "Yes, actively" }));
    submitSection(ref);

    await waitFor(() => expect(mockUpdateMutate).toHaveBeenCalled());
    expect(mockUpdateMutate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        pregnancyStatus: "not_pregnant",
        underDermatologistCare: "yes_actively",
        safetyContext: expect.objectContaining({
          conditions: ["rosacea", "eczema"],
          medications: ["topical_retinoid"],
          photosensitizing_other: true,
        }),
      }),
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
    expect(mockReleaseGuard).toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /delete this data/i }));
    await user.click(screen.getByRole("button", { name: /^delete$/i }));

    await waitFor(() => expect(mockDeleteHealthMutate).toHaveBeenCalled());
  });

  it("requires medical safety consent before saving new health context", async () => {
    const user = userEvent.setup();
    const profile = mergedProfile({
      hasHealthContextConsent: false,
      pregnancyStatus: null,
      safetyContext: {},
    });
    const { ref } = renderMedicalSafetySection(profile);

    expect(
      screen.getByRole("heading", {
        name: /before you share medical context/i,
      }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /i understand. continue/i }),
    );
    await user.click(screen.getByRole("button", { name: "Rosacea" }));
    submitSection(ref);

    await waitFor(() => expect(mockUpdateMutate).toHaveBeenCalled());
    expect(mockUpdateMutate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        healthContextConsent: true,
        safetyContext: expect.objectContaining({
          conditions: ["rosacea"],
        }),
      }),
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it("submits lifestyle context from chip and boolean controls", async () => {
    const user = userEvent.setup();
    const profile = mergedProfile({
      lifestyleContext: {},
    });
    const { ref } = renderForwardedSection((sectionRef) => (
      <LifestyleSection
        ref={sectionRef}
        profile={profile}
        options={mockSkinProfileOptions}
        onPendingChange={jest.fn()}
      />
    ));

    await user.click(screen.getByRole("button", { name: "Under 6 hours" }));
    await user.click(screen.getAllByRole("button", { name: "High" })[0]);
    await user.click(screen.getByRole("button", { name: "High sugar" }));
    await user.click(screen.getAllByRole("button", { name: "No" })[0]);
    await user.click(
      screen.getAllByRole("button", { name: "Yes, actively" })[0],
    );
    await user.click(screen.getByRole("button", { name: "Dry air" }));
    submitSection(ref);

    await waitFor(() => expect(mockUpdateMutate).toHaveBeenCalled());
    expect(mockUpdateMutate).toHaveBeenLastCalledWith(
      {
        lifestyleContext: expect.objectContaining({
          sleep: "under_6",
          stress: "high",
          diet_flags: ["high_sugar"],
          smoking: "none",
          mask_wearing: true,
          climate_sensitivities: ["dry_air"],
        }),
      },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it("submits active tolerance with an optional last-used date", async () => {
    const user = userEvent.setup();
    const profile = mergedProfile({
      activeTolerances: {},
    });
    const { ref } = renderForwardedSection((sectionRef) => (
      <ActiveToleranceSection
        ref={sectionRef}
        profile={profile}
        options={mockSkinProfileOptions}
        onPendingChange={jest.fn()}
      />
    ));

    await user.click(
      screen.getAllByRole("button", { name: "Tolerates well" })[0],
    );
    fireEvent.change(screen.getByLabelText("Last used"), {
      target: { value: "2026-01-10" },
    });
    submitSection(ref);

    await waitFor(() => expect(mockUpdateMutate).toHaveBeenCalled());
    expect(mockUpdateMutate).toHaveBeenLastCalledWith(
      {
        activeTolerances: {
          retinoids: {
            tolerance: "tolerates_well",
            last_used: "2026-01-10",
          },
        },
      },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it("adds, removes, and submits reaction history entries", async () => {
    const user = userEvent.setup();
    const profile = mergedProfile({
      hasHealthContextConsent: true,
      reactionHistory: {
        has_known_reactions: true,
        entries: [
          {
            trigger: "Fragrance",
            trigger_type: "ingredient",
            reaction_types: ["redness"],
            severity: "moderate",
            certainty: "suspected",
          },
        ],
      },
    });
    const { ref } = renderForwardedSection((sectionRef) => (
      <ReactionsSection
        ref={sectionRef}
        profile={profile}
        options={mockSkinProfileOptions}
        onPendingChange={jest.fn()}
      />
    ));

    expect(screen.getAllByText("Fragrance").length).toBeGreaterThan(0);
    await user.click(screen.getByRole("button", { name: /remove/i }));
    await user.type(
      screen.getByPlaceholderText(/salicylic acid, lavender oil/i),
      "Lavender oil",
    );
    const reactionSelects = screen.getAllByRole("combobox");
    await user.selectOptions(reactionSelects[0], "product");
    await user.selectOptions(reactionSelects[1], "confirmed_repeat");
    await user.click(screen.getByRole("button", { name: "Redness" }));
    await user.click(screen.getByRole("button", { name: "Severe" }));
    await user.click(
      screen.getByRole("checkbox", {
        name: /confirmed by patch test or clinician/i,
      }),
    );
    await user.click(screen.getByRole("button", { name: /add reaction/i }));
    submitSection(ref);

    await waitFor(() => expect(mockUpdateMutate).toHaveBeenCalled());
    expect(mockUpdateMutate).toHaveBeenLastCalledWith(
      {
        reactionHistory: {
          has_known_reactions: true,
          entries: [
            expect.objectContaining({
              trigger: "Lavender oil",
              trigger_type: "product",
              reaction_types: ["redness"],
              severity: "severe",
              certainty: "confirmed_repeat",
              patch_test_confirmed: true,
            }),
          ],
        },
      },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it("saves no known reaction history as an answered health-context field", async () => {
    const user = userEvent.setup();
    const profile = mergedProfile({
      hasHealthContextConsent: false,
      reactionHistory: {},
    });
    const { ref } = renderForwardedSection((sectionRef) => (
      <ReactionsSection
        ref={sectionRef}
        profile={profile}
        options={mockSkinProfileOptions}
        onPendingChange={jest.fn()}
      />
    ));

    await user.click(screen.getByRole("button", { name: "No known reactions" }));
    submitSection(ref);

    expect(
      await screen.findByRole("alertdialog", {
        name: "Protect reaction history",
      }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Allow and save" }));

    await waitFor(() => expect(mockUpdateMutate).toHaveBeenCalled());
    expect(mockUpdateMutate).toHaveBeenLastCalledWith(
      {
        reactionHistory: {
          has_known_reactions: false,
          entries: [],
        },
        healthContextConsent: true,
      },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it("submits sun and pigment behavior preferences", async () => {
    const user = userEvent.setup();
    const profile = mergedProfile({
      fitzpatrickPhototype: null,
      skinBehavior: {},
      routinePreferences: {},
    });
    const { ref } = renderForwardedSection((sectionRef) => (
      <SunPigmentSection
        ref={sectionRef}
        profile={profile}
        options={mockSkinProfileOptions}
        onPendingChange={jest.fn()}
      />
    ));

    await user.click(
      screen.getByRole("button", {
        name: "Very rarely burns, tans deeply. Phototype V.",
      }),
    );
    await user.click(screen.getAllByRole("button", { name: "Often" })[0]);
    await user.click(screen.getAllByRole("button", { name: "Always" })[2]);
    await user.click(screen.getByRole("button", { name: "Every day" }));
    await user.click(screen.getByRole("button", { name: "Mineral" }));
    await user.click(screen.getByRole("button", { name: "Matte" }));
    submitSection(ref);

    await waitFor(() => expect(mockUpdateMutate).toHaveBeenCalled());
    expect(mockUpdateMutate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        fitzpatrickPhototype: "V",
        skinBehavior: expect.objectContaining({
          pih_tendency: "often",
          keloid_tendency: "always",
          sunscreen_habit: "every_day",
        }),
        routinePreferences: expect.objectContaining({
          sunscreen_filter: "mineral",
          sunscreen_finish: "matte",
        }),
      }),
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it("submits and revokes hormonal context after consent", async () => {
    const user = userEvent.setup();
    const submitRef = createRef<SectionFormHandle>();
    const profile = mergedProfile({
      hasHormonalContextConsent: true,
      hormonalContext: {},
    });
    renderWithProviders(
      <HormonalSection
        profile={profile}
        options={mockSkinProfileOptions}
        submitRef={submitRef}
        onPendingChange={jest.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Regular" }));
    await user.click(screen.getByRole("button", { name: "Before period" }));
    await user.click(screen.getAllByRole("radio", { name: "Yes" })[0]);
    await user.click(screen.getAllByRole("radio", { name: "No" })[1]);
    submitSection(submitRef);

    await waitFor(() => expect(mockUpdateMutate).toHaveBeenCalled());
    expect(mockUpdateMutate).toHaveBeenLastCalledWith(
      {
        hormonalContext: expect.objectContaining({
          cycle_pattern: "regular",
          breakout_pattern: "before_period",
          cycle_related_breakouts: true,
          uses_hormonal_contraception: false,
        }),
        hormonalContextConsent: true,
      },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );

    await user.click(screen.getByRole("button", { name: /delete this data/i }));
    await waitFor(() => expect(mockDeleteHormonalMutate).toHaveBeenCalled());
  });

  it("requires hormonal consent before saving new hormonal context", async () => {
    const user = userEvent.setup();
    const submitRef = createRef<SectionFormHandle>();
    const profile = mergedProfile({
      hasHormonalContextConsent: false,
      hormonalContext: {},
    });
    renderWithProviders(
      <HormonalSection
        profile={profile}
        options={mockSkinProfileOptions}
        submitRef={submitRef}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /i understand. continue/i }),
    );
    await user.click(screen.getByRole("button", { name: "Irregular" }));
    submitSection(submitRef);

    await waitFor(() => expect(mockUpdateMutate).toHaveBeenCalled());
    expect(mockUpdateMutate).toHaveBeenLastCalledWith(
      {
        hormonalContext: {
          cycle_pattern: "irregular",
        },
        hormonalContextConsent: true,
      },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });
});
