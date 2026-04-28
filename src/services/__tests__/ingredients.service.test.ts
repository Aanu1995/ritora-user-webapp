jest.mock('@/lib/api', () => ({
  getRequest: jest.fn(),
  postRequest: jest.fn(),
}));

import { postRequest } from '@/lib/api';
import { analyzeProducts } from '@/services/ingredients.service';

afterEach(() => jest.clearAllMocks());

describe('ingredients.service', () => {
  it('posts focus-product analysis requests with explanations', async () => {
    const controller = new AbortController();
    (postRequest as jest.Mock).mockResolvedValue({
      mode: 'focus',
      status: 'ok',
      confidence: 'high',
      safetyScore: null,
      actives: [],
      conflicts: [],
      overlaps: [],
      layeringOrder: [],
      productsMissingInci: [],
      engineVersion: 'v2',
      generatedAt: '2026-04-24T09:00:00.000Z',
    });

    await analyzeProducts(
      {
        focusProductId: 'product-1',
        language: 'sv',
        withExplanations: true,
      },
      controller.signal,
    );

    expect(postRequest).toHaveBeenCalledWith(
      '/ingredients/analyze',
      {
        focusProductId: 'product-1',
        language: 'sv',
        withExplanations: true,
      },
      { signal: controller.signal },
    );
  });

  it('posts explicit productIds analysis requests', async () => {
    (postRequest as jest.Mock).mockResolvedValue({
      mode: 'multi',
      status: 'ok',
      confidence: 'high',
      safetyScore: 78,
      actives: [],
      conflicts: [],
      overlaps: [],
      layeringOrder: [],
      productsMissingInci: [],
      engineVersion: 'v2',
      generatedAt: '2026-04-24T09:00:00.000Z',
    });

    await analyzeProducts({
      productIds: ['a', 'b'],
      language: 'en',
    });

    expect(postRequest).toHaveBeenCalledWith(
      '/ingredients/analyze',
      {
        productIds: ['a', 'b'],
        language: 'en',
        withExplanations: false,
      },
      { signal: undefined },
    );
  });
});
