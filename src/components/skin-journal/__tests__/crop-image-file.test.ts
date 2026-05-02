import {
  calculateSquareCropPreviewStyle,
  calculateSquareCropRegion,
} from "@/components/skin-journal/crop-image-file";

describe("crop image math", () => {
  it("uses the centered source square at the default crop", () => {
    expect(
      calculateSquareCropRegion(4000, 2000, {
        zoom: 1,
        offsetX: 0,
        offsetY: 0,
      }),
    ).toEqual({
      sourceX: 1000,
      sourceY: 0,
      sourceSide: 2000,
    });
  });

  it("uses the same source region for the preview style and rendered crop", () => {
    const region = calculateSquareCropRegion(4000, 2000, {
      zoom: 2,
      offsetX: 100,
      offsetY: 0,
    });

    expect(region).toEqual({
      sourceX: 3000,
      sourceY: 500,
      sourceSide: 1000,
    });
    expect(calculateSquareCropPreviewStyle(4000, 2000, region)).toEqual({
      width: "400%",
      height: "200%",
      left: "-300%",
      top: "-50%",
    });
  });

  it("clamps out-of-range zoom and offsets", () => {
    expect(
      calculateSquareCropRegion(1200, 1800, {
        zoom: 10,
        offsetX: -400,
        offsetY: 400,
      }),
    ).toEqual({
      sourceX: 0,
      sourceY: 1400,
      sourceSide: 400,
    });
  });
});
