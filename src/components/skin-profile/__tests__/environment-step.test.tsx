import { screen } from "@testing-library/react";
import { EnvironmentStep } from "@/components/skin-profile/environment-step";
import { DEFAULT_SKIN_PROFILE_VALUES } from "@/components/skin-profile/skin-profile-form.constants";
import { mockSkinProfileOptions } from "@/test/skin-profile-fixtures";
import { renderWithProviders } from "@/test/utils";

describe("EnvironmentStep", () => {
  it("keeps location out of the water context step", () => {
    renderWithProviders(
      <EnvironmentStep
        values={DEFAULT_SKIN_PROFILE_VALUES}
        options={mockSkinProfileOptions}
        setStringField={jest.fn()}
        toggleSingleSelect={jest.fn()}
        translateOption={(value) => value}
        errors={{}}
      />,
    );

    expect(screen.getByText("Water hardness")).toBeInTheDocument();
    expect(screen.getByText("Water sensitivity")).toBeInTheDocument();
    expect(screen.queryByText("Country")).not.toBeInTheDocument();
    expect(screen.queryByText("City")).not.toBeInTheDocument();
    expect(
      screen.queryByText(/location data for personalised guidance/i),
    ).not.toBeInTheDocument();
  });
});
