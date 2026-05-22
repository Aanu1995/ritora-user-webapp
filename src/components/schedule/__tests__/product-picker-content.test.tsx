import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';
import { useScheduleUiStore } from '@/stores/schedule-ui-store';
import {
  ProductCategory,
  ShelfCategoryFilter,
  ShelfStatus,
  type ShelfProduct,
} from '@/types/shelf';
import { StepLabel } from '@/types/schedule';
import { ProductPickerContent } from '../product-picker-content';

const mockUseShelfProducts = jest.fn();

jest.mock('@/hooks/use-shelf', () => ({
  useShelfProducts: (...args: unknown[]) => mockUseShelfProducts(...args),
}));

function createProduct(
  overrides: Partial<ShelfProduct> & {
    identity?: Partial<ShelfProduct['identity']>;
  },
): ShelfProduct {
  return {
    id: overrides.id ?? 'product-1',
    identity: {
      brand: overrides.identity?.brand ?? 'Brand',
      name: overrides.identity?.name ?? 'Product',
      category: overrides.identity?.category ?? ProductCategory.Cleanser,
      barcode: null,
      imageUrls: [],
      sizeMl: null,
      description: null,
      benefits: [],
      suitedFor: [],
      inciIngredients: [],
      inciLastConfirmedAt: null,
    },
    guidance: {
      applicationMethod: null,
      quantity: null,
      steps: [],
      cautions: [],
      waitMinutes: null,
    },
    manufacturer: {
      brand: overrides.identity?.brand ?? 'Brand',
      parentCompany: null,
      countryOfOrigin: null,
      countryOfManufacture: null,
      supportEmail: null,
      productUrl: null,
      websiteUrl: null,
    },
    userFields: {
      openedAt: null,
      expiresAt: null,
      periodAfterOpeningMonths: null,
      pricePaid: null,
      pricePaidCurrency: null,
      purchasedFrom: null,
      personalNotes: null,
      preferredTimeOfDay: null,
    },
    status: overrides.status ?? ShelfStatus.Active,
    provenance: overrides.provenance ?? 'photo-lookup',
    createdAt: overrides.createdAt ?? '2026-04-22T00:00:00.000Z',
    updatedAt: overrides.updatedAt ?? '2026-04-22T00:00:00.000Z',
  };
}

describe('ProductPickerContent', () => {
  beforeEach(() => {
    mockUseShelfProducts.mockReset();
    mockUseShelfProducts.mockReturnValue({
      data: [
        createProduct({
          id: 'cleanser-1',
          identity: {
            brand: 'Clean Brand',
            name: 'Daily Cleanser',
            category: ProductCategory.Cleanser,
          },
        }),
        createProduct({
          id: 'serum-1',
          identity: {
            brand: 'Serum Brand',
            name: 'Night Serum',
            category: ProductCategory.Serum,
          },
        }),
        createProduct({
          id: 'archived-cleanser',
          status: ShelfStatus.Archived,
          identity: {
            brand: 'Old Brand',
            name: 'Archived Cleanser',
            category: ProductCategory.Cleanser,
          },
        }),
      ],
      isLoading: false,
    });
    useScheduleUiStore.setState({
      productPickerStepLabel: null,
      productPickerOpenForStepIndex: null,
      pendingProductSelection: null,
    });
  });

  it('filters the picker to the matching product category for the selected step', () => {
    useScheduleUiStore.setState({
      productPickerStepLabel: StepLabel.Cleanser,
    });

    renderWithProviders(
      <ProductPickerContent onSelect={jest.fn()} onClose={jest.fn()} />,
    );

    expect(mockUseShelfProducts).toHaveBeenCalledWith(
      expect.objectContaining({
        category: ProductCategory.Cleanser,
      }),
      expect.anything(),
    );
    expect(screen.getByText('Clean Brand')).toBeInTheDocument();
    expect(screen.queryByText('Serum Brand')).not.toBeInTheDocument();
    expect(screen.queryByText('Old Brand')).not.toBeInTheDocument();
  });

  it.each([StepLabel.Other, StepLabel.Custom])(
    'shows all non-archived products when %s is selected',
    (stepLabel) => {
      useScheduleUiStore.setState({
        productPickerStepLabel: stepLabel,
      });

      renderWithProviders(
        <ProductPickerContent onSelect={jest.fn()} onClose={jest.fn()} />,
      );

      expect(mockUseShelfProducts).toHaveBeenCalledWith(
        expect.objectContaining({
          category: ShelfCategoryFilter.All,
        }),
        expect.anything(),
      );
      expect(screen.getByText('Clean Brand')).toBeInTheDocument();
      expect(screen.getByText('Serum Brand')).toBeInTheDocument();
      expect(screen.queryByText('Old Brand')).not.toBeInTheDocument();
    },
  );
});
