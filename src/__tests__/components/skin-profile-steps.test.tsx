import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConcernsPriorityStep } from "@/components/skin-profile/concerns-priority-step";
import { PreferencesStep } from "@/components/skin-profile/preferences-step";
import { RoutineBaselineStep } from "@/components/skin-profile/routine-baseline-step";
import { StepActions } from "@/components/skin-profile/step-actions";
import { SunPigmentStep } from "@/components/skin-profile/sun-pigment-step";
import {
  DEFAULT_SKIN_PROFILE_VALUES,
  type SkinProfileFormValues,
} from "@/components/skin-profile/skin-profile-form.constants";
import { mockSkinProfileOptions } from "@/test/skin-profile-fixtures";
import { renderWithProviders } from "@/test/utils";

function formValues(
  overrides: Partial<SkinProfileFormValues> = {},
): SkinProfileFormValues {
  return {
    ...DEFAULT_SKIN_PROFILE_VALUES,
    ...overrides,
  };
}

const translateOption = (value: string) => value;

describe("skin profile wizard steps", () => {
  it("wires preference chip selections and smart-pick buttons", async () => {
    const user = userEvent.setup();
    const toggleSingleSelect = jest.fn();
    const setBoolField = jest.fn();

    renderWithProviders(
      <PreferencesStep
        values={formValues({
          fragranceFree: "yes",
          nonComedogenic: "no",
          sunscreenFilter: "mineral",
          sunscreenFinish: "matte",
          budgetTier: "mid",
          allowSmartPicks: true,
        })}
        options={mockSkinProfileOptions}
        toggleSingleSelect={toggleSingleSelect}
        setBoolField={setBoolField}
        translateOption={translateOption}
        errors={{
          sunscreenFinish: "Pick a finish",
          allowSmartPicks: "Choose one",
        }}
      />,
    );

    await user.click(screen.getAllByRole("radio", { name: "Yes" })[0]);
    await user.click(screen.getAllByRole("radio", { name: "No" })[1]);
    await user.click(screen.getByRole("radio", { name: "chemical" }));
    await user.click(screen.getByRole("radio", { name: "dewy" }));
    await user.click(screen.getByRole("radio", { name: "drugstore" }));
    await user.click(screen.getByRole("button", { name: "No" }));

    expect(toggleSingleSelect).toHaveBeenCalledWith("fragranceFree", "yes");
    expect(toggleSingleSelect).toHaveBeenCalledWith("nonComedogenic", "no");
    expect(toggleSingleSelect).toHaveBeenCalledWith(
      "sunscreenFilter",
      "chemical",
    );
    expect(toggleSingleSelect).toHaveBeenCalledWith(
      "sunscreenFinish",
      "dewy",
    );
    expect(toggleSingleSelect).toHaveBeenCalledWith("budgetTier", "drugstore");
    expect(setBoolField).toHaveBeenCalledWith("allowSmartPicks", false);
    expect(screen.getByText("Pick a finish")).toBeInTheDocument();
  });

  it("wires sun and pigment behavior selections", async () => {
    const user = userEvent.setup();
    const toggleSingleSelect = jest.fn();

    renderWithProviders(
      <SunPigmentStep
        values={formValues({
          fitzpatrickPhototype: "IV",
          pihTendency: "often",
          melasmaTendency: "never",
          keloidTendency: "sometimes",
          sunscreenHabit: "most_days",
          sunscreenTolerance: "fine",
        })}
        options={mockSkinProfileOptions}
        toggleSingleSelect={toggleSingleSelect}
        translateOption={translateOption}
        errors={{
          sunscreenTolerance: "Pick a tolerance",
        }}
      />,
    );

    await user.click(screen.getByRole("radio", { name: "V" }));
    await user.click(screen.getAllByRole("radio", { name: "always" })[0]);
    await user.click(screen.getAllByRole("radio", { name: "often" })[1]);
    await user.click(screen.getAllByRole("radio", { name: "never" })[2]);
    await user.click(screen.getByRole("radio", { name: "every_day" }));
    await user.click(
      screen.getByRole("radio", { name: "a_bit_irritating" }),
    );

    expect(toggleSingleSelect).toHaveBeenCalledWith(
      "fitzpatrickPhototype",
      "V",
    );
    expect(toggleSingleSelect).toHaveBeenCalledWith("pihTendency", "always");
    expect(toggleSingleSelect).toHaveBeenCalledWith(
      "melasmaTendency",
      "often",
    );
    expect(toggleSingleSelect).toHaveBeenCalledWith("keloidTendency", "never");
    expect(toggleSingleSelect).toHaveBeenCalledWith(
      "sunscreenHabit",
      "every_day",
    );
    expect(toggleSingleSelect).toHaveBeenCalledWith(
      "sunscreenTolerance",
      "a_bit_irritating",
    );
    expect(screen.getByText("Pick a tolerance")).toBeInTheDocument();
  });

  it("wires concern, severity, primary-goal, and routine pace actions", async () => {
    const user = userEvent.setup();
    const toggleMultiSelect = jest.fn();
    const toggleSingleSelect = jest.fn();
    const onConcernSeverityChange = jest.fn();

    renderWithProviders(
      <>
        <ConcernsPriorityStep
          values={formValues({
            currentConcerns: ["acne"],
            concernSeverities: { acne: "mild" },
            primaryGoal: "acne",
          })}
          options={mockSkinProfileOptions}
          toggleMultiSelect={toggleMultiSelect}
          toggleSingleSelect={toggleSingleSelect}
          onConcernSeverityChange={onConcernSeverityChange}
          translateOption={translateOption}
          errors={{
            "concernSeverities.acne": "Pick severity",
          }}
        />
        <RoutineBaselineStep
          values={formValues({ routinePace: "cautious" })}
          options={mockSkinProfileOptions}
          toggleSingleSelect={toggleSingleSelect}
          translateOption={translateOption}
          errors={{ routinePace: "Pick pace" }}
        />
      </>,
    );

    await user.click(screen.getByRole("checkbox", { name: "dark_marks" }));
    await user.click(screen.getByRole("button", { name: "severe" }));
    await user.click(screen.getByRole("radio", { name: "acne" }));
    await user.click(screen.getByRole("radio", { name: "moderate" }));

    expect(toggleMultiSelect).toHaveBeenCalledWith(
      "currentConcerns",
      "dark_marks",
    );
    expect(onConcernSeverityChange).toHaveBeenCalledWith("acne", "severe");
    expect(toggleSingleSelect).toHaveBeenCalledWith("primaryGoal", "acne");
    expect(toggleSingleSelect).toHaveBeenCalledWith(
      "routinePace",
      "moderate",
    );
    expect(screen.getByText("Pick severity")).toBeInTheDocument();
    expect(screen.getByText("Pick pace")).toBeInTheDocument();
  });

  it("renders step actions for normal, optional, and edit flows", async () => {
    const user = userEvent.setup();
    const onBack = jest.fn();
    const onContinue = jest.fn();
    const onSkip = jest.fn();
    const onCancel = jest.fn();
    const { rerender } = renderWithProviders(
      <StepActions
        step={2}
        totalSteps={5}
        canContinue
        isSubmitting={false}
        isOptionalStep
        onBack={onBack}
        onContinue={onContinue}
        onSkip={onSkip}
      />,
    );

    await user.click(screen.getByRole("button", { name: /back/i }));
    await user.click(screen.getByRole("button", { name: /skip/i }));
    await user.click(screen.getByRole("button", { name: /continue/i }));

    expect(onBack).toHaveBeenCalled();
    expect(onSkip).toHaveBeenCalled();
    expect(onContinue).toHaveBeenCalled();

    rerender(
      <StepActions
        step={5}
        totalSteps={5}
        canContinue
        isSubmitting
        onBack={onBack}
        onContinue={onContinue}
        onCancel={onCancel}
      />,
    );

    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();
  });
});
