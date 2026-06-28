import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/utils";
import { ShelfProductPickerPagination } from "../shelf-product-picker-pagination";

const LABELS = {
  loadMoreErrorLabel: "Couldn't load more products.",
  loadMoreLabel: "Load more products",
  loadingMoreLabel: "Loading more products",
  retryLabel: "Try again",
};

describe("ShelfProductPickerPagination", () => {
  it("renders nothing when there is no pagination state to show", () => {
    const { container } = renderWithProviders(
      <ShelfProductPickerPagination
        {...LABELS}
        hasNextPage={false}
        isFetchNextPageError={false}
        isFetchingNextPage={false}
        onLoadMore={jest.fn()}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("loads the next page when more shelf products are available", async () => {
    const onLoadMore = jest.fn();

    renderWithProviders(
      <ShelfProductPickerPagination
        {...LABELS}
        hasNextPage
        isFetchNextPageError={false}
        isFetchingNextPage={false}
        onLoadMore={onLoadMore}
      />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: /load more products/i }),
    );

    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it("keeps an accessible loading state while a page is fetching", () => {
    renderWithProviders(
      <ShelfProductPickerPagination
        {...LABELS}
        hasNextPage={false}
        isFetchNextPageError={false}
        isFetchingNextPage
        onLoadMore={jest.fn()}
      />,
    );

    expect(screen.getByText("Loading more products")).toBeInTheDocument();
  });

  it("shows a retry action after a next-page fetch fails", () => {
    renderWithProviders(
      <ShelfProductPickerPagination
        {...LABELS}
        hasNextPage={false}
        isFetchNextPageError
        isFetchingNextPage={false}
        onLoadMore={jest.fn()}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Couldn't load more products.",
    );
    expect(
      screen.getByRole("button", { name: /try again/i }),
    ).toBeInTheDocument();
  });
});
