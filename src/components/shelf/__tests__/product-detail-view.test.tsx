import svMessages from '../../../../messages/sv.json';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { renderWithProviders } from '@/test/utils';

const mockArchive = jest.fn();
const mockRestore = jest.fn();
const mockFinish = jest.fn();
const mockDelete = jest.fn();
const mockPush = jest.fn();

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
}));

import { ProductDetailView } from '@/components/shelf/detail/product-detail-view';
import { getAppScrollPosition } from '@/lib/app-scroll-restoration';
import {
  ApplicationMethod,
  DataProvenance,
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

  it('renders Edit, Archive, Mark finished, Delete actions', () => {
    renderWithProviders(<ProductDetailView product={PRODUCT} />);

    expect(screen.getByRole('link', { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /archive/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /mark finished/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('renders the all four detail tabs', () => {
    renderWithProviders(<ProductDetailView product={PRODUCT} />);

    expect(screen.getByRole('tab', { name: /about/i })).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: /ingredients/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /how to use/i })).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: /manufacturer/i }),
    ).toBeInTheDocument();
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

    render(
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
