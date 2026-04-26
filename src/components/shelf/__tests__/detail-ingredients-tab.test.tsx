import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';
import { DetailIngredientsTab } from '@/components/shelf/detail/detail-ingredients-tab';

const mockUseFocusProductAnalysis = jest.fn();

jest.mock('@/hooks/use-ingredients', () => ({
  useFocusProductAnalysis: (...args: unknown[]) =>
    mockUseFocusProductAnalysis(...args),
}));

beforeEach(() => {
  mockUseFocusProductAnalysis.mockReset();
  mockUseFocusProductAnalysis.mockReturnValue({
    isPending: false,
    isError: false,
    data: {
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
    },
  });
});

describe('DetailIngredientsTab', () => {
  it('renders local insufficient data when no ingredients are available', () => {
    renderWithProviders(
      <DetailIngredientsTab
        productId="01HWXYZ0000000000000000001"
        ingredients={[]}
        lastConfirmedAt={null}
      />,
    );

    expect(
      screen.getByText(/no ingredient list on file/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/we need more ingredient data/i)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /add ingredients/i }),
    ).toHaveAttribute('href', '/shelf/01HWXYZ0000000000000000001/edit');
    expect(mockUseFocusProductAnalysis).not.toHaveBeenCalled();
  });

  it('renders ingredients and the last confirmed date', () => {
    renderWithProviders(
      <DetailIngredientsTab
        productId="01HWXYZ0000000000000000001"
        ingredients={['Aqua', 'Glycerin']}
        lastConfirmedAt="2026-04-17T09:00:00.000Z"
      />,
    );

    expect(screen.getByText(/aqua, glycerin/i)).toBeInTheDocument();
    expect(screen.getByText(/last confirmed on/i)).toBeInTheDocument();
  });
});
