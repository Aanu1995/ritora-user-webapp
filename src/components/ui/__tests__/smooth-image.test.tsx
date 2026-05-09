import { fireEvent, screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/utils";
import { SmoothImage } from "@/components/ui/smooth-image";

jest.mock("next/image", () => {
  const react = jest.requireActual<typeof import("react")>("react");

  type MockImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
    fill?: boolean;
    priority?: boolean;
    unoptimized?: boolean;
  };

  return {
    __esModule: true,
    default: ({
      fill,
      priority,
      unoptimized,
      ...props
    }: MockImageProps) => {
      void fill;
      void priority;
      void unoptimized;
      return react.createElement("img", props);
    },
  };
});

describe("SmoothImage", () => {
  it("reserves the image frame and fades in after loading", () => {
    renderWithProviders(
      <SmoothImage
        src="/product.webp"
        alt="Product bottle"
        className="h-12 w-10 rounded-md"
        sizes="40px"
      />,
    );

    const image = screen.getByRole("img", { name: "Product bottle" });
    const frame = image.parentElement;

    expect(frame).toHaveAttribute("data-image-loaded", "false");
    expect(image).toHaveClass("opacity-0");

    fireEvent.load(image);

    expect(frame).toHaveAttribute("data-image-loaded", "true");
    expect(image).toHaveClass("opacity-100");
  });

  it("shows the fallback if the image fails", () => {
    renderWithProviders(
      <SmoothImage
        src="/missing.webp"
        alt="Product bottle"
        className="h-12 w-10 rounded-md"
        sizes="40px"
        fallback={<span>R</span>}
      />,
    );

    fireEvent.error(screen.getByRole("img", { name: "Product bottle" }));

    expect(screen.getByText("R")).toBeInTheDocument();
    expect(
      screen.queryByRole("img", { name: "Product bottle" }),
    ).not.toBeInTheDocument();
  });
});
