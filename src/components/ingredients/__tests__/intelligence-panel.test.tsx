import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import { IntelligencePanel } from '@/components/ingredients/intelligence-panel';
import {
  AnalysisConfidence,
  AnalysisMode,
  AnalysisStatus,
  IngredientCategory,
  type AnalysisActive,
  type AnalysisResult,
} from '@/types/ingredients';

const mockUseFocusProductAnalysis = jest.fn();

jest.mock('@/hooks/use-ingredients', () => ({
  useFocusProductAnalysis: (...args: unknown[]) =>
    mockUseFocusProductAnalysis(...args),
}));

function buildActive(partial: Partial<AnalysisActive> = {}): AnalysisActive {
  return {
    slug: 'retinol',
    displayName: 'Retinol',
    category: IngredientCategory.Retinoid,
    summary: 'A retinoid that speeds turnover and evens tone.',
    avoidCategories: [IngredientCategory.Aha, IngredientCategory.Bha],
    avoidIngredientSlugs: [],
    mitigationHint: 'Alternate nights.',
    ...partial,
  };
}

function buildResult(partial: Partial<AnalysisResult> = {}): AnalysisResult {
  return {
    mode: AnalysisMode.Focus,
    status: AnalysisStatus.Ok,
    confidence: AnalysisConfidence.High,
    safetyScore: null,
    actives: [],
    conflicts: [],
    overlaps: [],
    layeringOrder: [],
    productsMissingInci: [],
    engineVersion: 'v2',
    generatedAt: '2026-04-24T00:00:00.000Z',
    ...partial,
  };
}

beforeEach(() => {
  mockUseFocusProductAnalysis.mockReset();
});

describe('IntelligencePanel', () => {
  it('renders a skeleton while loading', () => {
    mockUseFocusProductAnalysis.mockReturnValue({
      isPending: true,
      isError: false,
    });

    renderWithProviders(<IntelligencePanel productId="product-1" />);

    expect(
      screen.getByTestId('intelligence-panel-skeleton'),
    ).toBeInTheDocument();
  });

  it('renders a retry panel when analysis fails', async () => {
    const user = userEvent.setup();
    const refetch = jest.fn();
    mockUseFocusProductAnalysis.mockReturnValue({
      isPending: false,
      isError: true,
      refetch,
    });

    renderWithProviders(<IntelligencePanel productId="product-1" />);

    expect(
      screen.getByRole('heading', { name: /couldn't run the check/i }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /retry/i }));
    expect(refetch).toHaveBeenCalled();
  });

  it('renders the insufficient-data state', () => {
    mockUseFocusProductAnalysis.mockReturnValue({
      isPending: false,
      isError: false,
      data: buildResult({
        status: AnalysisStatus.InsufficientData,
        productsMissingInci: ['product-1'],
      }),
    });

    renderWithProviders(<IntelligencePanel productId="product-1" />);

    expect(
      screen.getByText(/we need more ingredient data/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /add ingredients/i }),
    ).toHaveAttribute('href', '/shelf/product-1/edit');
  });

  it('renders the Key actives section with a category badge and blurb', () => {
    mockUseFocusProductAnalysis.mockReturnValue({
      isPending: false,
      isError: false,
      data: buildResult({
        actives: [buildActive()],
      }),
    });

    renderWithProviders(<IntelligencePanel productId="product-1" />);

    expect(
      screen.getByRole('heading', { name: /key actives/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/retinol/i).length).toBeGreaterThan(0);
    expect(
      screen.getByText(/a retinoid that speeds turnover/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/^Retinoid$/i)).toBeInTheDocument();
  });

  it('renders pairing guidance with the avoid-with pills and mitigation hint', () => {
    mockUseFocusProductAnalysis.mockReturnValue({
      isPending: false,
      isError: false,
      data: buildResult({
        actives: [buildActive()],
      }),
    });

    renderWithProviders(<IntelligencePanel productId="product-1" />);

    expect(
      screen.getByRole('heading', { name: /how to pair it/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/avoid in the same routine with/i),
    ).toBeInTheDocument();
    expect(screen.getByText('AHA')).toBeInTheDocument();
    expect(screen.getByText('BHA')).toBeInTheDocument();
    expect(screen.getByText(/alternate nights/i)).toBeInTheDocument();
  });

  it('omits the pairing section when no active has avoid-targets', () => {
    mockUseFocusProductAnalysis.mockReturnValue({
      isPending: false,
      isError: false,
      data: buildResult({
        actives: [
          buildActive({
            slug: 'niacinamide',
            displayName: 'Niacinamide',
            category: IngredientCategory.Niacinamide,
            avoidCategories: [],
            avoidIngredientSlugs: [],
            mitigationHint: null,
          }),
        ],
      }),
    });

    renderWithProviders(<IntelligencePanel productId="product-1" />);

    expect(screen.queryByRole('heading', { name: /how to pair it/i })).toBeNull();
  });

  it('renders an empty actives notice when the list is empty', () => {
    mockUseFocusProductAnalysis.mockReturnValue({
      isPending: false,
      isError: false,
      data: buildResult({ actives: [] }),
    });

    renderWithProviders(<IntelligencePanel productId="product-1" />);

    expect(
      screen.getByText(/couldn't match any active ingredients/i),
    ).toBeInTheDocument();
  });
});
