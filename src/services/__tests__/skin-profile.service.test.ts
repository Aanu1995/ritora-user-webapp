jest.mock('@/lib/api', () => ({
  getRequest: jest.fn(),
  postRequest: jest.fn(),
  patchRequest: jest.fn(),
  deleteRequest: jest.fn(),
  setAccessToken: jest.fn(),
}));

import { ApiPath } from '@/constants/api-paths';
import * as api from '@/lib/api';
import * as skinProfileService from '@/services/skin-profile.service';

afterEach(() => jest.clearAllMocks());

describe('skin-profile.service', () => {
  it('getSkinProfile calls getRequest', async () => {
    const profile = { id: 'p1', skinType: 'oily' };
    (api.getRequest as jest.Mock).mockResolvedValue(profile);

    const result = await skinProfileService.getSkinProfile();

    expect(api.getRequest).toHaveBeenCalledWith(ApiPath.SkinProfile);
    expect(result).toEqual(profile);
  });

  it('getSkinProfileOptions calls getRequest', async () => {
    const options = { skinTypes: ['oily'] };
    (api.getRequest as jest.Mock).mockResolvedValue(options);

    const result = await skinProfileService.getSkinProfileOptions();

    expect(api.getRequest).toHaveBeenCalledWith(ApiPath.SkinProfileOptions);
    expect(result).toEqual(options);
  });

  it('createSkinProfile calls postRequest with data', async () => {
    const input = { skinType: 'oily', currentConcerns: ['acne'] };
    (api.postRequest as jest.Mock).mockResolvedValue({ id: 'p1', ...input });

    await skinProfileService.createSkinProfile(input);

    expect(api.postRequest).toHaveBeenCalledWith(ApiPath.SkinProfile, input);
  });

  it('updateSkinProfile calls patchRequest with data', async () => {
    const input = { skinType: 'dry' };
    (api.patchRequest as jest.Mock).mockResolvedValue({ id: 'p1', ...input });

    await skinProfileService.updateSkinProfile(input);

    expect(api.patchRequest).toHaveBeenCalledWith(ApiPath.SkinProfile, input);
  });

  it('deleteSkinProfile calls deleteRequest', async () => {
    (api.deleteRequest as jest.Mock).mockResolvedValue(undefined);

    await skinProfileService.deleteSkinProfile();

    expect(api.deleteRequest).toHaveBeenCalledWith(ApiPath.SkinProfile);
  });
});
