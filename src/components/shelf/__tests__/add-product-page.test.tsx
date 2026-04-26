import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UnsavedChangesDialog } from '@/components/app/unsaved-changes-dialog';
import { useUnsavedChangesStore } from '@/stores/unsaved-changes-store';
import { renderWithProviders } from '@/test/utils';
import {
  CatalogueSource,
  DataProvenance,
  LookupConfidence,
  LookupWarningCode,
  ProductCategory,
} from '@/types/shelf';

const mockPush = jest.fn();
const mockMutate = jest.fn();
const mockExtractFromImagesMutate = jest.fn();
const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();
let mockLookupResolve:
  | ((onResult: (value: unknown) => void) => void)
  | null = null;

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/shelf/new',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

jest.mock('@/hooks/use-shelf', () => ({
  useCreateProduct: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
  useExtractProductFromImages: () => ({
    mutate: mockExtractFromImagesMutate,
    isPending: false,
  }),
}));

jest.mock('@/components/shelf/add-product/quick-lookup-card', () => ({
  QuickLookupCard: ({
    onResult,
  }: {
    onResult: (value: unknown) => void;
  }) => (
    <button
      type="button"
      onClick={() => mockLookupResolve?.(onResult)}
    >
      import lookup
    </button>
  ),
}));

jest.mock('@/components/ui/date-picker', () => ({
  DatePicker: ({
    value,
    onChange,
    ariaLabel,
  }: {
    value: string;
    onChange: (next: string) => void;
    ariaLabel?: string;
  }) => (
    <input
      type="date"
      aria-label={ariaLabel}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));

import { AddProductPage } from '@/components/shelf/add-product-page';

function getStepInput(index: number) {
  return screen
    .getAllByLabelText(new RegExp(`step ${index}`, 'i'))
    .find((element) => element.tagName === 'INPUT') as HTMLInputElement;
}

beforeEach(() => {
  mockPush.mockReset();
  mockMutate.mockReset();
  mockExtractFromImagesMutate.mockReset();
  mockToastSuccess.mockReset();
  mockToastError.mockReset();
  mockLookupResolve = null;
  useUnsavedChangesStore.setState({
    hasUnsavedChanges: false,
    isDialogOpen: false,
    pendingProceed: null,
  });
});

describe('AddProductPage', () => {
  it('shows a validation error when required fields are missing', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddProductPage />);

    await user.click(screen.getByRole('button', { name: /add to shelf/i }));

    expect(screen.getByText(/brand is required/i)).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('requires core shelf details before adding a product', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddProductPage />);

    await user.type(screen.getByLabelText(/^brand$/i), 'CeraVe');
    await user.type(screen.getByLabelText(/^product name$/i), 'Barrier Serum');

    await user.click(screen.getByRole('button', { name: /add to shelf/i }));

    expect(screen.getByText(/size is required/i)).toBeInTheDocument();
    expect(
      screen.getByText(/add at least one step so ritora can explain how to use this product/i),
    ).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('does not show unrelated validation errors while the user is still typing', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddProductPage />);

    await user.type(screen.getByLabelText(/^brand$/i), 'C');

    expect(screen.queryByText(/size is required/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        /add at least one step so ritora can explain how to use this product/i,
      ),
    ).not.toBeInTheDocument();
  });

  it('requires the about fields before adding a product', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddProductPage />);

    fireEvent.change(screen.getByLabelText(/^brand$/i), {
      target: { value: 'CeraVe' },
    });
    fireEvent.change(screen.getByLabelText(/^product name$/i), {
      target: { value: 'Barrier Serum' },
    });
    fireEvent.change(screen.getByLabelText(/^size$/i), {
      target: { value: '30' },
    });
    await user.click(screen.getByRole('button', { name: /add step/i }));
    fireEvent.change(getStepInput(1), {
      target: { value: 'Pat onto clean skin.' },
    });
    fireEvent.change(screen.getByLabelText(/^opened on$/i), {
      target: { value: '2026-04-15' },
    });

    await user.click(screen.getByRole('button', { name: /add to shelf/i }));

    expect(screen.getByText(/description is required/i)).toBeInTheDocument();
    expect(
      screen.getByText(/add at least one product benefit/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/add at least one skin type this product suits/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/paste the inci ingredients list/i),
    ).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('shows inline validation feedback for invalid structured fields', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddProductPage />);

    await user.type(screen.getByLabelText(/^brand$/i), 'CeraVe');
    await user.type(screen.getByLabelText(/^product name$/i), 'Barrier Serum');
    await user.type(screen.getByLabelText(/^support$/i), 'not-an-email');

    await user.click(screen.getByRole('button', { name: /add to shelf/i }));

    expect(screen.getByText(/support email must be a valid email address/i)).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('shows validation feedback when a how-to-use step is too long', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddProductPage />);

    await user.type(screen.getByLabelText(/^brand$/i), 'CeraVe');
    await user.type(screen.getByLabelText(/^product name$/i), 'Barrier Serum');
    await user.click(screen.getByRole('button', { name: /add step/i }));
    const stepInput = screen
      .getAllByLabelText(/step 1/i)
      .find((element) => element.tagName === 'INPUT');

    expect(stepInput).toBeDefined();

    fireEvent.change(stepInput as HTMLInputElement, {
      target: { value: 'a'.repeat(281) },
    });

    await user.click(screen.getByRole('button', { name: /add to shelf/i }));

    expect(
      screen.getByText(/keep each step short/i),
    ).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('creates a product and redirects to the detail page', async () => {
    const user = userEvent.setup();
    mockMutate.mockImplementation((_draft, options) => {
      options?.onSuccess?.({ id: 'product-123' });
    });

    renderWithProviders(<AddProductPage />);

    await user.type(screen.getByLabelText(/^brand$/i), 'CeraVe');
    await user.type(screen.getByLabelText(/^product name$/i), 'Barrier Serum');
    await user.type(
      screen.getByLabelText(/^description$/i),
      'A calming serum that supports smoother texture overnight.',
    );
    await user.type(screen.getByLabelText(/^benefits$/i), 'calming, smoothing');
    await user.type(screen.getByLabelText(/^suited for$/i), 'dry, sensitive');
    await user.type(
      screen.getByLabelText(/^ingredients \(inci\)$/i),
      'Aqua, Glycerin, Niacinamide',
    );
    await user.type(screen.getByLabelText(/^size$/i), '30');
    await user.click(screen.getByRole('button', { name: /add step/i }));
    await user.type(getStepInput(1), 'Pat onto clean skin.');
    await user.type(screen.getByLabelText(/^opened on$/i), '2026-04-15');

    await user.click(screen.getByRole('button', { name: /add to shelf/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/shelf/product-123');
    });
  });

  it('creates after a lookup fills ingredients following a validation failure', async () => {
    const user = userEvent.setup();
    mockMutate.mockImplementation((_draft, options) => {
      options?.onSuccess?.({ id: 'product-123' });
    });
    mockLookupResolve = (onResult) => {
      onResult({
        identity: {
          brand: 'CeraVe',
          name: 'Resurfacing Retinol Serum',
          category: ProductCategory.Serum,
          imageUrls: [],
          sizeMl: 30,
          description: 'A renewing serum for smoother-looking skin.',
          benefits: ['smoother texture'],
          suitedFor: ['combination'],
          inciIngredients: ['Aqua', 'Glycerin'],
          inciLastConfirmedAt: null,
        },
        guidance: {
          steps: ['Apply at night after cleansing.'],
          cautions: [],
        },
        manufacturer: {
          brand: 'CeraVe',
          parentCompany: null,
          countryOfOrigin: null,
          countryOfManufacture: null,
          supportEmail: null,
          productUrl: null,
          websiteUrl: null,
        },
        provenance: DataProvenance.PhotoLookup,
        source: CatalogueSource.UserPhotos,
        confidence: LookupConfidence.Medium,
        reviewRequired: true,
        warnings: [
          LookupWarningCode.ReviewRequired,
          LookupWarningCode.IngredientsUnverified,
        ],
        evidence: [],
      });
    };

    renderWithProviders(<AddProductPage />);

    await user.click(screen.getByRole('button', { name: /add to shelf/i }));
    expect(
      screen.getByText(/paste the inci ingredients list/i),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /import lookup/i }));
    expect(screen.getByLabelText(/^ingredients \(inci\)$/i)).toHaveValue(
      'Aqua, Glycerin',
    );

    await user.click(screen.getByRole('button', { name: /add to shelf/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/shelf/product-123');
    });
    expect(mockMutate.mock.calls[0]?.[0].identity.inciIngredients).toEqual([
      'Aqua',
      'Glycerin',
    ]);
  });

  it('creates an unopened product without an opened date', async () => {
    const user = userEvent.setup();
    mockMutate.mockImplementation((_draft, options) => {
      options?.onSuccess?.({ id: 'product-123' });
    });

    renderWithProviders(<AddProductPage />);

    await user.type(screen.getByLabelText(/^brand$/i), 'CeraVe');
    await user.type(screen.getByLabelText(/^product name$/i), 'Barrier Serum');
    await user.type(
      screen.getByLabelText(/^description$/i),
      'A calming serum that supports smoother texture overnight.',
    );
    await user.type(screen.getByLabelText(/^benefits$/i), 'calming, smoothing');
    await user.type(screen.getByLabelText(/^suited for$/i), 'dry, sensitive');
    await user.type(
      screen.getByLabelText(/^ingredients \(inci\)$/i),
      'Aqua, Glycerin, Niacinamide',
    );
    await user.type(screen.getByLabelText(/^size$/i), '30');
    await user.click(screen.getByRole('button', { name: /add step/i }));
    await user.type(getStepInput(1), 'Pat onto clean skin.');

    await user.click(screen.getByRole('button', { name: /add to shelf/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/shelf/product-123');
    });

    expect(mockMutate.mock.calls[0]?.[0].userFields.openedAt).toBeNull();
  });

  it('shows a server error when create fails', async () => {
    const user = userEvent.setup();
    mockMutate.mockImplementation((_draft, options) => {
      options?.onError?.(new Error('boom'));
    });

    renderWithProviders(<AddProductPage />);

    await user.type(screen.getByLabelText(/^brand$/i), 'CeraVe');
    await user.type(screen.getByLabelText(/^product name$/i), 'Barrier Serum');
    await user.type(
      screen.getByLabelText(/^description$/i),
      'A calming serum that supports smoother texture overnight.',
    );
    await user.type(screen.getByLabelText(/^benefits$/i), 'calming, smoothing');
    await user.type(screen.getByLabelText(/^suited for$/i), 'dry, sensitive');
    await user.type(
      screen.getByLabelText(/^ingredients \(inci\)$/i),
      'Aqua, Glycerin, Niacinamide',
    );
    await user.type(screen.getByLabelText(/^size$/i), '30');
    await user.click(screen.getByRole('button', { name: /add step/i }));
    await user.type(getStepInput(1), 'Pat onto clean skin.');
    await user.type(screen.getByLabelText(/^opened on$/i), '2026-04-15');
    fireEvent.change(screen.getByLabelText(/^product url$/i), {
      target: { value: 'https://example.com/product' },
    });

    await user.click(screen.getByRole('button', { name: /add to shelf/i }));

    expect(
      screen.getByRole('alert'),
    ).toHaveTextContent(/could not save this product/i);
  });

  it('shows a success toast after product details are imported from lookup', async () => {
    const user = userEvent.setup();
    mockLookupResolve = (onResult) => {
      onResult({
        identity: {
          brand: 'CeraVe',
          name: 'Resurfacing Retinol Serum',
          category: ProductCategory.Serum,
          barcode: '3337875684118',
          imageUrls: [],
          sizeMl: 30,
          description: 'A renewing serum for smoother-looking skin.',
          benefits: ['smoother texture'],
          suitedFor: ['combination'],
          inciIngredients: ['Aqua', 'Glycerin'],
          inciLastConfirmedAt: null,
        },
        guidance: {
          steps: ['Apply at night after cleansing.'],
          cautions: ['Use sunscreen during the day.'],
        },
        manufacturer: {
          brand: 'CeraVe',
          parentCompany: 'Loreal',
          countryOfOrigin: 'France',
          countryOfManufacture: 'France',
          supportEmail: 'support@example.com',
          productUrl: 'https://example.com/product',
          websiteUrl: null,
        },
        provenance: DataProvenance.Catalogue,
        source: CatalogueSource.OpenBeautyFacts,
        confidence: LookupConfidence.Medium,
        reviewRequired: true,
        warnings: [LookupWarningCode.ReviewRequired],
        evidence: [],
      });
    };

    renderWithProviders(<AddProductPage />);

    await user.click(screen.getByRole('button', { name: /import lookup/i }));

    expect(mockToastSuccess).toHaveBeenCalledWith(
      'Product details filled in',
      expect.objectContaining({
        description: expect.stringMatching(
          /review the highlighted fields before saving/i,
        ),
      }),
    );
    expect(screen.getByLabelText(/^brand$/i)).toHaveValue('CeraVe');
    expect(screen.getByLabelText(/^product name$/i)).toHaveValue(
      'Resurfacing Retinol Serum',
    );
    expect(screen.getByLabelText(/^description$/i)).toHaveValue(
      'A renewing serum for smoother-looking skin.',
    );
    expect(screen.getByLabelText(/^benefits$/i)).toHaveValue(
      'smoother texture',
    );
    expect(screen.getByLabelText(/^suited for$/i)).toHaveValue(
      'combination',
    );
    expect(screen.getByLabelText(/^support$/i)).toHaveValue(
      'support@example.com',
    );
    expect(screen.getByLabelText(/^product url$/i)).toHaveValue(
      'https://example.com/product',
    );
    expect(screen.getByRole('button', { name: /^made in$/i })).toHaveTextContent(
      /france/i,
    );
  });

  it('handles partial lookup payloads without crashing and fills available fields', async () => {
    const user = userEvent.setup();
    mockLookupResolve = (onResult) => {
      onResult({
        identity: {
          brand: 'CeraVe',
          name: 'Resurfacing Retinol Serum',
          category: ProductCategory.Serum,
          description: 'A resurfacing serum.',
        },
        provenance: DataProvenance.Catalogue,
        source: CatalogueSource.RitoraCatalogue,
        confidence: LookupConfidence.High,
        reviewRequired: false,
        warnings: [],
        evidence: [],
      });
    };

    renderWithProviders(<AddProductPage />);

    await user.type(screen.getByLabelText(/^support$/i), 'stale@example.com');
    fireEvent.change(screen.getByLabelText(/^product url$/i), {
      target: { value: 'https://example.com/stale-product' },
    });
    await user.type(screen.getByLabelText(/^benefits$/i), 'stale benefit');
    await user.type(screen.getByLabelText(/^suited for$/i), 'stale skin');

    await user.click(screen.getByRole('button', { name: /import lookup/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/^brand$/i)).toHaveValue('CeraVe');
    });

    expect(screen.getByLabelText(/^product name$/i)).toHaveValue(
      'Resurfacing Retinol Serum',
    );
    expect(screen.getByLabelText(/^description$/i)).toHaveValue(
      'A resurfacing serum.',
    );
    expect(screen.getByLabelText(/^benefits$/i)).toHaveValue('stale benefit');
    expect(screen.getByLabelText(/^suited for$/i)).toHaveValue('stale skin');
    expect(screen.getByLabelText(/^support$/i)).toHaveValue('stale@example.com');
    expect(screen.getByLabelText(/^product url$/i)).toHaveValue(
      'https://example.com/stale-product',
    );
  });

  it('keeps review badges for high-confidence AI-backed fields and maps origin to made in', async () => {
    const user = userEvent.setup();
    mockLookupResolve = (onResult) => {
      onResult({
        identity: {
          brand: 'CeraVe',
          name: 'SA Smoothing Cleanser',
          category: ProductCategory.Cleanser,
          description: 'A cleanser that smooths rough texture.',
          benefits: ['smooths texture'],
          suitedFor: ['rough skin'],
          barcode: '3337875795456',
          imageUrls: [],
          sizeMl: 236,
          inciIngredients: ['Aqua'],
          inciLastConfirmedAt: null,
        },
        guidance: {
          cautions: ['Avoid contact with eyes.'],
        },
        manufacturer: {
          brand: 'CeraVe',
          parentCompany: "L'Oréal",
          countryOfOrigin: 'France',
          countryOfManufacture: null,
          supportEmail: 'support@example.com',
          productUrl: 'https://example.com/product',
          websiteUrl: null,
        },
        provenance: DataProvenance.Catalogue,
        source: CatalogueSource.OfficialPage,
        confidence: LookupConfidence.High,
        reviewRequired: true,
        warnings: [LookupWarningCode.AiNormalized],
        evidence: [],
      });
    };

    renderWithProviders(<AddProductPage />);

    await user.click(screen.getByRole('button', { name: /import lookup/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/^brand$/i)).toHaveValue('CeraVe');
    });

    expect(screen.getByRole('button', { name: /^made in$/i })).toHaveTextContent(
      /france/i,
    );
    expect(screen.getAllByText(/needs review/i).length).toBeGreaterThan(0);
    expect(mockToastSuccess).toHaveBeenCalledWith(
      'Product details filled in',
      expect.objectContaining({
        description: expect.stringMatching(
          /review the highlighted fields before saving/i,
        ),
      }),
    );
  });

  it('keeps the add-product page at a single form', () => {
    renderWithProviders(<AddProductPage />);

    expect(document.querySelectorAll('form')).toHaveLength(1);
  });

  describe('unsaved changes guard', () => {
    it('opens the discard dialog when the back arrow is clicked with dirty state', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <>
          <AddProductPage />
          <UnsavedChangesDialog />
        </>,
      );

      await user.type(screen.getByLabelText(/^brand$/i), 'CeraVe');

      const backLink = screen.getByLabelText(/back to shelf/i);
      await user.click(backLink);

      expect(screen.getByText(/unsaved changes/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /keep editing/i })).toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('keeps the user on the form when "Keep editing" is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <>
          <AddProductPage />
          <UnsavedChangesDialog />
        </>,
      );

      await user.type(screen.getByLabelText(/^brand$/i), 'CeraVe');
      await user.click(screen.getByLabelText(/back to shelf/i));
      await user.click(screen.getByRole('button', { name: /keep editing/i }));

      await waitFor(() => {
        expect(screen.queryByText(/unsaved changes/i)).not.toBeInTheDocument();
      });
      expect(mockPush).not.toHaveBeenCalled();
      expect(
        (screen.getByLabelText(/^brand$/i) as HTMLInputElement).value,
      ).toBe('CeraVe');
    });

    it('navigates to the shelf when "Discard changes" is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <>
          <AddProductPage />
          <UnsavedChangesDialog />
        </>,
      );

      await user.type(screen.getByLabelText(/^brand$/i), 'CeraVe');
      await user.click(screen.getByLabelText(/back to shelf/i));
      await user.click(screen.getByRole('button', { name: /discard changes/i }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/shelf');
      });
    });

    it('does not open the dialog when the back arrow is clicked with a clean form', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <>
          <AddProductPage />
          <UnsavedChangesDialog />
        </>,
      );

      await user.click(screen.getByLabelText(/back to shelf/i));

      expect(screen.queryByText(/unsaved changes/i)).not.toBeInTheDocument();
    });
  });
});
