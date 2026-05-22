jest.mock("@/lib/api", () => ({
  getRequest: jest.fn(),
  postRequest: jest.fn(),
  patchRequest: jest.fn(),
  deleteRequest: jest.fn(),
  setAccessToken: jest.fn(),
}));

import { ApiPath } from "@/constants/api-paths";
import { deleteRequest, getRequest, patchRequest, postRequest } from "@/lib/api";
import {
  createSkinProfile,
  deleteSkinProfile,
  deleteSkinProfileHormonalContext,
  getSkinProfile,
  getSkinProfileAccessLogs,
  getSkinProfileOptions,
  updateSkinProfile,
} from "@/services/skin-profile.service";

afterEach(() => jest.clearAllMocks());

describe("skin-profile.service", () => {
  it("getSkinProfile calls getRequest", async () => {
    const profile = { id: "p1", skinType: "oily" };
    (getRequest as jest.Mock).mockResolvedValue(profile);

    const result = await getSkinProfile();

    expect(getRequest).toHaveBeenCalledWith(ApiPath.SkinProfile);
    expect(result).toEqual(profile);
  });

  it("getSkinProfileOptions calls getRequest", async () => {
    const options = { skinTypes: ["oily"] };
    (getRequest as jest.Mock).mockResolvedValue(options);

    const result = await getSkinProfileOptions();

    expect(getRequest).toHaveBeenCalledWith(ApiPath.SkinProfileOptions);
    expect(result).toEqual(options);
  });

  it("getSkinProfileAccessLogs calls getRequest", async () => {
    const logs = [{ id: "access-log-1" }];
    (getRequest as jest.Mock).mockResolvedValue(logs);

    const result = await getSkinProfileAccessLogs();

    expect(getRequest).toHaveBeenCalledWith(ApiPath.SkinProfileAccessLogs);
    expect(result).toEqual(logs);
  });

  it("createSkinProfile calls postRequest with data", async () => {
    const input = { skinType: "oily", currentConcerns: ["acne"] };
    (postRequest as jest.Mock).mockResolvedValue({ id: "p1", ...input });

    await createSkinProfile(input);

    expect(postRequest).toHaveBeenCalledWith(ApiPath.SkinProfile, input);
  });

  it("updateSkinProfile calls patchRequest with data", async () => {
    const input = { skinType: "dry" };
    (patchRequest as jest.Mock).mockResolvedValue({ id: "p1", ...input });

    await updateSkinProfile(input);

    expect(patchRequest).toHaveBeenCalledWith(ApiPath.SkinProfile, input);
  });

  it("deleteSkinProfile calls deleteRequest", async () => {
    (deleteRequest as jest.Mock).mockResolvedValue(undefined);

    await deleteSkinProfile();

    expect(deleteRequest).toHaveBeenCalledWith(ApiPath.SkinProfile);
  });

  it("deleteSkinProfileHormonalContext calls deleteRequest", async () => {
    const profile = { id: "p1", hormonalContext: {} };
    (deleteRequest as jest.Mock).mockResolvedValue(profile);

    const result = await deleteSkinProfileHormonalContext();

    expect(deleteRequest).toHaveBeenCalledWith(
      ApiPath.SkinProfileHormonalContext,
    );
    expect(result).toEqual(profile);
  });
});
