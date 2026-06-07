import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SkinProfileOverview } from "@/components/skin-profile/skin-profile-overview";
import { createReadySkinProfile } from "@/test/skin-profile";
import { renderWithProviders } from "@/test/utils";

describe("SkinProfileOverview", () => {
  it("shows water context in essentials and opens the guided water step", async () => {
    const user = userEvent.setup();
    const onEdit = jest.fn();

    renderWithProviders(
      <SkinProfileOverview
        profile={createReadySkinProfile({
          lifestyleContext: {
            water_hardness: "hard",
            water_sensitivity: "suspected",
            water_reaction_notes: "Face feels tight after washing",
          },
        })}
        onEdit={onEdit}
      />,
    );

    expect(screen.getByText("Water context")).toBeInTheDocument();
    expect(screen.queryByText("Climate and water")).not.toBeInTheDocument();
    expect(screen.getByText("Hard")).toBeInTheDocument();
    expect(screen.getByText("Suspected")).toBeInTheDocument();
    expect(
      screen.getByText("Face feels tight after washing"),
    ).toBeInTheDocument();

    const waterRow = screen.getByText("Water context").closest(".border-b");
    expect(waterRow).not.toBeNull();
    await user.click(within(waterRow as HTMLElement).getByRole("button"));
    expect(onEdit).toHaveBeenCalledWith(5);
  });

  it("keeps location separate from the water context row", () => {
    renderWithProviders(
      <SkinProfileOverview
        profile={createReadySkinProfile({
          city: "Stockholm",
          countryCode: "SE",
          lifestyleContext: {
            water_hardness: "unknown",
            water_sensitivity: "none",
          },
        })}
        onEdit={jest.fn()}
      />,
    );

    const waterRow = screen.getByText("Water context").closest(".border-b");

    expect(waterRow).not.toBeNull();
    expect(
      within(waterRow as HTMLElement).getByText("Unknown"),
    ).toBeInTheDocument();
    expect(
      within(waterRow as HTMLElement).getByText("None"),
    ).toBeInTheDocument();
    expect(
      within(waterRow as HTMLElement).queryByText("Stockholm"),
    ).not.toBeInTheDocument();
    const waterContextLinks = screen
      .queryAllByRole("link")
      .filter(
        (link) => link.getAttribute("href") === "/skin-profile/water-context",
      );
    expect(waterContextLinks).toEqual([]);
  });

  it("marks lifestyle complete from every lifestyle-only field used by completeness", () => {
    renderWithProviders(
      <SkinProfileOverview
        profile={createReadySkinProfile({
          lifestyleContext: {
            climate_sensitivities: ["dry_air"],
          },
        })}
        onEdit={jest.fn()}
      />,
    );

    const lifestyleCard = screen.getByText("Lifestyle").closest(".rounded-2xl");

    expect(lifestyleCard).not.toBeNull();
    expect(
      within(lifestyleCard as HTMLElement).getAllByText("Review").length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      within(lifestyleCard as HTMLElement).queryByText("Add now"),
    ).not.toBeInTheDocument();
  });

  it("shows unanswered reaction history as incomplete", () => {
    renderWithProviders(
      <SkinProfileOverview
        profile={createReadySkinProfile({
          reactionHistory: {},
        })}
        onEdit={jest.fn()}
      />,
    );

    const reactionCard = screen
      .getByText("Reaction history")
      .closest(".rounded-2xl");

    expect(reactionCard).not.toBeNull();
    expect(
      within(reactionCard as HTMLElement).getByText("Add now"),
    ).toBeInTheDocument();
    expect(
      within(reactionCard as HTMLElement).queryByText("No known reactions"),
    ).not.toBeInTheDocument();
  });

  it("marks explicit no known reactions as complete", () => {
    renderWithProviders(
      <SkinProfileOverview
        profile={createReadySkinProfile({
          reactionHistory: {
            has_known_reactions: false,
            entries: [],
          },
        })}
        onEdit={jest.fn()}
      />,
    );

    const reactionCard = screen
      .getByText("Reaction history")
      .closest(".rounded-2xl");

    expect(reactionCard).not.toBeNull();
    expect(
      within(reactionCard as HTMLElement).getByText("No known reactions"),
    ).toBeInTheDocument();
    expect(
      within(reactionCard as HTMLElement).queryByText("Add now"),
    ).not.toBeInTheDocument();
  });

  it("does not mark yes without entries as complete", () => {
    renderWithProviders(
      <SkinProfileOverview
        profile={createReadySkinProfile({
          reactionHistory: {
            has_known_reactions: true,
            entries: [],
          },
        })}
        onEdit={jest.fn()}
      />,
    );

    const reactionCard = screen
      .getByText("Reaction history")
      .closest(".rounded-2xl");

    expect(reactionCard).not.toBeNull();
    expect(
      within(reactionCard as HTMLElement).getByText("Add now"),
    ).toBeInTheDocument();
    expect(
      within(reactionCard as HTMLElement).queryByText("0 entries"),
    ).not.toBeInTheDocument();
  });
});
