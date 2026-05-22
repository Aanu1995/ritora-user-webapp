import { screen } from "@testing-library/react";
import { HeaderContextSubtitle } from "@/components/app/header-context-subtitle";
import { renderWithProviders } from "@/test/utils";

describe("HeaderContextSubtitle", () => {
  it("renders the existing time and city subtitle context", () => {
    renderWithProviders(
      <HeaderContextSubtitle
        generatedAt="2026-05-08T20:30:00.000Z"
        timeZone="Europe/Stockholm"
        city="Stockholm"
      />,
    );

    expect(screen.getByText("Local time:")).toBeInTheDocument();
    expect(screen.getByText("City:")).toBeInTheDocument();
    expect(screen.getByText("Stockholm")).toBeInTheDocument();
    expect(screen.queryByText("Climate data:")).not.toBeInTheDocument();
  });
});
