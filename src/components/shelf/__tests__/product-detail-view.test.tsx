import svMessages from '../../../../messages/sv.json';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { renderWithProviders } from '@/test/utils';

const mockArchive = jest.fn();
const mockRestore = jest.fn();
const mockFinish = jest.fn();
const mockDelete = jest.fn();
const mockCompare = jest.fn();
const mockUpdateIntroduction = jest.fn();
const mockPush = jest.fn();
const mockGetCommunityProductEvidence = jest.fn();
const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/shelf/p1',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/hooks/use-shelf', () => ({
  useShelfProducts: () => ({
    data: [],
    isLoading: false,
  }),
  useArchiveProduct: () => ({
    mutate: mockArchive,
    isPending: false,
  }),
  useRestoreProduct: () => ({
    mutate: mockRestore,
    isPending: false,
  }),
  useMarkProductFinished: () => ({
    mutate: mockFinish,
    isPending: false,
  }),
  useDeleteProduct: () => ({
    mutate: mockDelete,
    isPending: false,
  }),
  useUpdateProductIntroduction: () => ({
    mutate: mockUpdateIntroduction,
    isPending: false,
  }),
}));

jest.mock('@/hooks/use-ingredients', () => ({
  useCompareProducts: () => ({
    mutate: mockCompare,
    isPending: false,
    data: null,
  }),
}));

jest.mock('@/services/community.service', () => ({
  getCommunityProductEvidence: (...args: unknown[]) =>
    mockGetCommunityProductEvidence(...args),
}));

jest.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

import { ProductDetailView } from '@/components/shelf/detail/product-detail-view';
import { getAppScrollPosition } from '@/lib/app-scroll-restoration';
import {
  ApplicationMethod,
  DataProvenance,
  ProductIntroductionStatus,
  ProductCategory,
  Quantity,
  ShelfStatus,
  type ShelfProduct,
} from '@/types/shelf';

const PRODUCT: ShelfProduct = {
  id: 'p1',
  identity: {
    brand: 'CeraVe',
    name: 'Resurfacing Retinol Serum',
    category: ProductCategory.Serum,
    barcode: '123',
    imageUrls: [],
    sizeMl: 30,
    description: 'Calm nightly retinol.',
    benefits: ['smoothing'],
    suitedFor: ['dry'],
    inciIngredients: ['Aqua', 'Glycerin'],
    inciLastConfirmedAt: '2026-04-14T09:00:00.000Z',
  },
  guidance: {
    applicationMethod: ApplicationMethod.Fingertips,
    quantity: Quantity.TwoToThreeDrops,
    steps: ['Cleanse first.', 'Pat gently.'],
    cautions: ['Avoid eye area.'],
    waitMinutes: null,
  },
  manufacturer: {
    brand: 'CeraVe',
    parentCompany: "L'Oréal",
    countryOfOrigin: 'US',
    countryOfManufacture: 'US',
    supportEmail: 'support@cerave.com',
    productUrl: 'https://www.cerave.com',
    websiteUrl: 'https://www.cerave.com',
  },
  userFields: {
    openedAt: '2026-03-27T00:00:00.000Z',
    expiresAt: '2027-02-14T00:00:00.000Z',
    periodAfterOpeningMonths: 12,
    pricePaid: null,
    pricePaidCurrency: null,
    purchasedFrom: null,
    personalNotes: null,
    preferredTimeOfDay: null,
  },
  introduction: {
    status: ProductIntroductionStatus.Week1,
    startedAt: '2026-06-14T08:00:00.000Z',
    statusUpdatedAt: '2026-06-14T08:00:00.000Z',
  },
  status: ShelfStatus.Active,
  provenance: DataProvenance.PhotoLookup,
  createdAt: '2026-03-27T00:00:00.000Z',
  updatedAt: '2026-04-14T09:00:00.000Z',
};

beforeEach(() => {
  mockArchive.mockReset();
  mockRestore.mockReset();
  mockFinish.mockReset();
  mockDelete.mockReset();
  mockCompare.mockReset();
  mockUpdateIntroduction.mockReset();
  mockToastSuccess.mockReset();
  mockToastError.mockReset();
  mockGetCommunityProductEvidence.mockReset();
  mockGetCommunityProductEvidence.mockResolvedValue({
    averageEffectivenessRating: 4,
    averageIrritationRating: 1,
    averageOverallRating: 5,
    outcomeSignalCounts: {
      caused_irritation: 0,
      did_not_work: 1,
      mixed_result: 1,
      not_relevant: 0,
      worked_for_me_too: 8,
      worked_with_changes: 2,
    },
    playbookCount: 3,
    productBrand: 'CeraVe',
    productId: 'p1',
    productName: 'Resurfacing Retinol Serum',
    reviewCount: 5,
    similarAuthorEvidenceCount: 4,
    similarOutcomeConfirmationCount: 3,
    similarOutcomeSignalCounts: {
      caused_irritation: 0,
      did_not_work: 0,
      mixed_result: 0,
      not_relevant: 0,
      worked_for_me_too: 3,
      worked_with_changes: 0,
    },
    topAvoids: [{ value: 'over-exfoliation', count: 2 }],
    topGoals: [{ value: 'smoother-texture', count: 3 }],
    topOutcomes: [{ value: 'smoothing', count: 4 }],
  });
  window.sessionStorage.clear();
});

describe('ProductDetailView', () => {
  it('renders the back link, brand, product name, and category', () => {
    renderWithProviders(<ProductDetailView product={PRODUCT} />);

    expect(
      screen.getByRole('link', { name: /back to shelf/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('CeraVe')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /resurfacing retinol/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Serum')).toBeInTheDocument();
  });

  it('renders Compare, Edit, Archive, Mark finished, Delete actions', () => {
    renderWithProviders(<ProductDetailView product={PRODUCT} />);

    expect(screen.getByRole('button', { name: /compare/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /archive/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /mark finished/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('renders all product detail tabs', () => {
    renderWithProviders(<ProductDetailView product={PRODUCT} />);

    expect(screen.getByRole('tab', { name: /about/i })).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: /introduction/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: /ingredients/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /how to use/i })).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: /manufacturer/i }),
    ).toBeInTheDocument();
  });

  it('surfaces community evidence on the product decision page', async () => {
    renderWithProviders(<ProductDetailView product={PRODUCT} />);

    const evidenceHeading = await screen.findByRole('heading', {
      name: /community evidence/i,
    });

    expect(evidenceHeading).toBeInTheDocument();
    expect(
      screen
        .getByRole('tab', { name: /manufacturer/i })
        .compareDocumentPosition(evidenceHeading) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    // Metric tiles now render label and value separately. Verify the
    // labels appear and the right numbers show up inside the evidence
    // section as a whole.
    const sectionText = evidenceHeading.closest('section')?.textContent ?? '';
    expect(sectionText).toContain('Reviews');
    expect(sectionText).toContain('Playbooks');
    expect(sectionText).toContain('5'); // review count
    expect(sectionText).toContain('3'); // playbook count + confirmation count

    // Plural template renders the number via Intl, so the count and
    // the rest of the phrase can land in separate text nodes. Match
    // both halves inside the same section instead.
    expect(sectionText).toMatch(/3\s*similar-user confirmations/);
    expect(screen.getByText(/over-exfoliation/i)).toBeInTheDocument();
  });

  it('restores the active tab for the product detail page', async () => {
    const user = userEvent.setup();
    const { unmount } = renderWithProviders(
      <ProductDetailView product={PRODUCT} />,
    );

    await user.click(screen.getByRole('tab', { name: /manufacturer/i }));
    expect(screen.getByRole('tab', { name: /manufacturer/i })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    unmount();
    renderWithProviders(<ProductDetailView product={PRODUCT} />);

    expect(screen.getByRole('tab', { name: /manufacturer/i })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('saves product detail scroll before opening edit', async () => {
    const user = userEvent.setup();
    const scrollRoot = document.createElement('main');
    scrollRoot.setAttribute('data-app-scroll-root', '');
    Object.defineProperty(scrollRoot, 'scrollTop', {
      configurable: true,
      value: 420,
    });
    document.body.appendChild(scrollRoot);

    renderWithProviders(<ProductDetailView product={PRODUCT} />);

    expect(screen.getByRole('link', { name: /edit/i })).toHaveAttribute(
      'href',
      '/shelf/p1/edit?returnTo=%2Fshelf%2Fp1',
    );

    await user.click(screen.getByRole('link', { name: /edit/i }));

    expect(getAppScrollPosition('/shelf/p1')).toBe(420);
    scrollRoot.remove();
  });

  it('does not render any AM/PM/step chips next to the title', () => {
    renderWithProviders(<ProductDetailView product={PRODUCT} />);

    expect(screen.queryByText('AM')).not.toBeInTheDocument();
    expect(screen.queryByText('PM')).not.toBeInTheDocument();
    expect(screen.queryByText(/step \d/i)).not.toBeInTheDocument();
  });

  it('shows and updates the product introduction lifecycle', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProductDetailView product={PRODUCT} />);

    await user.click(screen.getByRole('tab', { name: /introduction/i }));

    expect(
      screen.getByRole('heading', { name: /product introduction/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/week 1/i).length).toBeGreaterThan(0);

    await user.click(
      screen.getByRole('button', { name: /building tolerance/i }),
    );

    expect(mockUpdateIntroduction).toHaveBeenCalledWith(
      {
        id: PRODUCT.id,
        payload: { status: ProductIntroductionStatus.BuildingTolerance },
      },
      expect.any(Object),
    );
  });

  it('explains each product introduction status in the detail tab dialog', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProductDetailView product={PRODUCT} />);

    await user.click(screen.getByRole('tab', { name: /introduction/i }));
    await user.click(
      screen.getByRole('button', {
        name: /explain product introduction statuses/i,
      }),
    );

    expect(
      screen.getByRole('dialog', { name: /how introduction statuses work/i }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(/lower frequency/i).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/Ritora can use it normally in suggestions/i).length,
    ).toBeGreaterThan(0);
  });

  it('archives, finishes, and deletes through the action handlers', async () => {
    const user = userEvent.setup();
    mockArchive.mockImplementation((_ids, options) => {
      options?.onSuccess?.();
    });
    mockFinish.mockImplementation((_ids, options) => {
      options?.onSuccess?.();
    });
    mockDelete.mockImplementation((_id, options) => {
      options?.onSuccess?.();
    });

    renderWithProviders(<ProductDetailView product={PRODUCT} />);

    await user.click(screen.getByRole('button', { name: /archive/i }));
    await user.click(screen.getByRole('button', { name: /mark finished/i }));
    await user.click(screen.getByRole('button', { name: /delete/i }));
    await user.click(screen.getAllByRole('button', { name: /^delete$/i }).at(-1)!);

    await waitFor(() => {
      expect(mockArchive).toHaveBeenCalled();
      expect(mockFinish).toHaveBeenCalled();
      expect(mockDelete).toHaveBeenCalledWith(PRODUCT.id, expect.any(Object));
      expect(mockPush).toHaveBeenCalledWith('/shelf');
    });
  });

  it('shows restore for archived products and uses the restore mutation', async () => {
    const user = userEvent.setup();
    mockRestore.mockImplementation((_ids, options) => {
      options?.onSuccess?.();
    });

    renderWithProviders(
      <ProductDetailView
        product={{ ...PRODUCT, status: ShelfStatus.Archived }}
      />,
    );

    await user.click(screen.getByRole('button', { name: /restore/i }));

    expect(mockRestore).toHaveBeenCalledWith(PRODUCT.id, expect.any(Object));
  });

  it('renders translated delete confirmation copy when the locale changes', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <NextIntlClientProvider locale="sv" messages={svMessages}>
        <ProductDetailView product={PRODUCT} />
      </NextIntlClientProvider>,
    );

    await user.click(screen.getByRole('button', { name: /^ta bort$/i }));

    expect(screen.getByText(/detta kan inte ångras/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /behåll/i }),
    ).toBeInTheDocument();
  });
});
