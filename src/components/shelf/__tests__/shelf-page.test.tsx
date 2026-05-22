import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import { createReadySkinProfile } from '@/test/skin-profile';
import { useShelfUiStore } from '@/stores/shelf-ui-store';
import {
  DataProvenance,
  ProductCategory,
  ShelfCategoryFilter,
  ShelfSort,
  ShelfStatFilter,
  ShelfStatus,
  ShelfViewMode,
  type ShelfProduct,
} from '@/types/shelf';

const mockProducts: ShelfProduct[] = [
  {
    id: 'p1',
    identity: {
      brand: 'CeraVe',
      name: 'Resurfacing Retinol Serum',
      category: ProductCategory.Serum,
      barcode: null,
      imageUrls: [],
      sizeMl: 30,
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
      brand: 'CeraVe',
      parentCompany: null,
      countryOfOrigin: null,
      countryOfManufacture: null,
      supportEmail: null,
      productUrl: null,
      websiteUrl: null,
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
    updatedAt: '2026-03-27T00:00:00.000Z',
  },
];

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/shelf',
  useSearchParams: () => new URLSearchParams(),
}));

const mockUseShelfProducts = jest.fn();
const mockUseShelfStats = jest.fn();
const mockUseSkinProfile = jest.fn();
const mockFetchNextPage = jest.fn();
const intersectionObservers: MockIntersectionObserverInstance[] = [];

type MockIntersectionObserverInstance = {
  callback: IntersectionObserverCallback;
  elements: Set<Element>;
  observe: jest.Mock<void, [Element]>;
  unobserve: jest.Mock<void, [Element]>;
  disconnect: jest.Mock<void, []>;
};

function installIntersectionObserverMock() {
  intersectionObservers.length = 0;

  class MockIntersectionObserver {
    readonly root: Element | Document | null = null;
    readonly rootMargin = '0px';
    readonly thresholds = [0];
    private readonly instance: MockIntersectionObserverInstance;

    constructor(callback: IntersectionObserverCallback) {
      this.instance = {
        callback,
        elements: new Set<Element>(),
        observe: jest.fn((element: Element) => {
          this.instance.elements.add(element);
        }),
        unobserve: jest.fn((element: Element) => {
          this.instance.elements.delete(element);
        }),
        disconnect: jest.fn(() => {
          this.instance.elements.clear();
        }),
      };
      intersectionObservers.push(this.instance);
    }

    observe = (element: Element) => this.instance.observe(element);
    unobserve = (element: Element) => this.instance.unobserve(element);
    disconnect = () => this.instance.disconnect();
    takeRecords = () => [];
  }

  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
  });
}

function triggerIntersection(testId: string) {
  const target = screen.getByTestId(testId);
  const observer = intersectionObservers.at(-1);

  if (!observer) {
    throw new Error('No IntersectionObserver instance was registered.');
  }

  observer.callback(
    [
      {
        isIntersecting: true,
        target,
        time: 0,
        intersectionRatio: 1,
        boundingClientRect: target.getBoundingClientRect(),
        intersectionRect: target.getBoundingClientRect(),
        rootBounds: null,
      } as IntersectionObserverEntry,
    ],
    {} as IntersectionObserver,
  );
}

jest.mock('@/hooks/use-shelf', () => ({
  useShelfProducts: () => mockUseShelfProducts(),
  useShelfStats: () => mockUseShelfStats(),
  useArchiveProducts: () => ({ archive: jest.fn(), isPending: false }),
  useMarkFinished: () => ({ markFinished: jest.fn(), isPending: false }),
  useDeleteProducts: () => ({ mutate: jest.fn(), isPending: false }),
  useCreateProduct: () => ({ mutate: jest.fn(), isPending: false }),
}));

jest.mock('@/hooks/use-skin-profile', () => ({
  useSkinProfile: () => mockUseSkinProfile(),
}));

import { ShelfPage } from '@/components/shelf/shelf-page';

beforeEach(() => {
  installIntersectionObserverMock();
  mockUseShelfProducts.mockReset();
  mockUseShelfStats.mockReset();
  mockUseSkinProfile.mockReset();
  mockFetchNextPage.mockReset();
  mockUseSkinProfile.mockReturnValue({
    data: createReadySkinProfile(),
    error: null,
    isError: false,
    isPending: false,
    refetch: jest.fn(),
  });

  useShelfUiStore.setState({
    selectedIds: new Set<string>(),
    sort: ShelfSort.RecentlyAdded,
    view: ShelfViewMode.Grid,
    stat: ShelfStatFilter.All,
    activeCategory: ShelfCategoryFilter.All,
    search: '',
  });
});

describe('ShelfPage', () => {
  it('opens a skin-profile prerequisite dialog when Add Product is clicked before profile completion', async () => {
    const user = userEvent.setup();
    mockUseSkinProfile.mockReturnValue({
      data: createReadySkinProfile({ primaryGoal: null }),
      error: null,
      isError: false,
      isPending: false,
      refetch: jest.fn(),
    });
    mockUseShelfProducts.mockReturnValue({
      data: mockProducts,
      isPending: false,
      isError: false,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: mockFetchNextPage,
    });
    mockUseShelfStats.mockReturnValue({
      data: { all: 1 },
      isPending: false,
      isError: false,
    });

    renderWithProviders(<ShelfPage />);

    await user.click(screen.getByRole('button', { name: /add product/i }));

    expect(
      screen.getByRole('heading', {
        name: /finish your skin profile first/i,
      }),
    ).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalledWith('/shelf/new');
  });

  it('renders the empty state when there are no products and not loading', () => {
    mockUseShelfProducts.mockReturnValue({
      data: [],
      isPending: false,
      isError: false,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: mockFetchNextPage,
    });
    mockUseShelfStats.mockReturnValue({
      data: {},
      isPending: false,
      isError: false,
    });

    renderWithProviders(<ShelfPage />);

    expect(
      screen.getByRole('heading', { name: /your shelf is empty/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /add your first product/i }),
    ).toBeInTheDocument();
  });

  it('renders the loading skeleton while products are pending', () => {
    mockUseShelfProducts.mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: mockFetchNextPage,
    });
    mockUseShelfStats.mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
    });

    renderWithProviders(<ShelfPage />);

    expect(screen.getByTestId('product-grid-skeleton')).toBeInTheDocument();
  });

  it('renders the list loading skeleton when list view is active', () => {
    useShelfUiStore.setState({ view: ShelfViewMode.List });

    mockUseShelfProducts.mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: mockFetchNextPage,
    });
    mockUseShelfStats.mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
    });

    renderWithProviders(<ShelfPage />);

    expect(screen.getByTestId('product-list-skeleton')).toBeInTheDocument();
  });

  it('renders the product grid when products are present', () => {
    mockUseShelfProducts.mockReturnValue({
      data: mockProducts,
      isPending: false,
      isError: false,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: mockFetchNextPage,
    });
    mockUseShelfStats.mockReturnValue({
      data: { all: 1, 'in-use': 1 },
      isPending: false,
      isError: false,
    });

    renderWithProviders(<ShelfPage />);

    expect(
      screen.getByText(/resurfacing retinol/i),
    ).toBeInTheDocument();
  });

  it('does not include morning/evening counts in any subtitle text', () => {
    mockUseShelfProducts.mockReturnValue({
      data: mockProducts,
      isPending: false,
      isError: false,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: mockFetchNextPage,
    });
    mockUseShelfStats.mockReturnValue({
      data: { all: 1 },
      isPending: false,
      isError: false,
    });

    renderWithProviders(<ShelfPage />);

    expect(screen.queryByText(/morning routine/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/evening routine/i)).not.toBeInTheDocument();
  });

  it('loads the next inventory page automatically when the sentinel enters view', async () => {
    mockUseShelfProducts.mockReturnValue({
      data: mockProducts,
      isPending: false,
      isError: false,
      hasNextPage: true,
      isFetchingNextPage: false,
      fetchNextPage: mockFetchNextPage,
    });
    mockUseShelfStats.mockReturnValue({
      data: { all: 1 },
      isPending: false,
      isError: false,
    });

    renderWithProviders(<ShelfPage />);

    triggerIntersection('shelf-auto-load-sentinel');

    expect(mockFetchNextPage).toHaveBeenCalled();
  });

  it('renders a retry state when the shelf request fails without cached data', () => {
    mockUseShelfProducts.mockReturnValue({
      data: [],
      isPending: false,
      isError: true,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: mockFetchNextPage,
      refetch: jest.fn(),
    });
    mockUseShelfStats.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: false,
    });

    renderWithProviders(<ShelfPage />);

    expect(
      screen.getByRole('heading', { name: /we couldn't load your shelf/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });
});
