import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import {
  ProductCategory,
  type CatalogueSuggestion,
} from '@/types/shelf';

const mockUseSearchCatalogue = jest.fn();
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
  useSearchCatalogue: (query: string) => mockUseSearchCatalogue(query),
}));

import { SearchTab } from '@/components/shelf/add-product/search-tab';

const RESULT: CatalogueSuggestion = {
  brand: 'CeraVe',
  name: 'Retinol Serum',
  category: ProductCategory.Serum,
  barcode: '123',
  imageUrls: [],
  sizeMl: 30,
};

beforeEach(() => {
  installIntersectionObserverMock();
  mockUseSearchCatalogue.mockReset();
});

describe('SearchTab', () => {
  it('renders loading and empty states', async () => {
    const user = userEvent.setup();
    mockUseSearchCatalogue.mockReturnValue({
      data: [],
      isFetching: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
    });

    renderWithProviders(<SearchTab onPick={jest.fn()} />);

    expect(screen.getByText(/type at least two letters/i)).toBeInTheDocument();
    expect(mockUseSearchCatalogue).toHaveBeenCalledWith('');

    await user.type(
      screen.getByRole('textbox', { name: /search by brand and product name/i }),
      're',
    );
    expect(mockUseSearchCatalogue).toHaveBeenLastCalledWith('');

    await user.click(screen.getByRole('button', { name: /search/i }));

    expect(mockUseSearchCatalogue).toHaveBeenLastCalledWith('re');
  });

  it('lets the user pick a search result', async () => {
    const user = userEvent.setup();
    const onPick = jest.fn();
    mockUseSearchCatalogue.mockReturnValue({
      data: [RESULT],
      isFetching: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
    });

    renderWithProviders(<SearchTab onPick={onPick} />);

    await user.type(
      screen.getByRole('textbox', { name: /search by brand and product name/i }),
      're',
    );
    await user.click(screen.getByRole('button', { name: /search/i }));
    await user.click(screen.getByRole('button', { name: /add/i }));

    expect(onPick).toHaveBeenCalledWith(
      expect.objectContaining({
        identity: expect.objectContaining({
          brand: 'CeraVe',
          name: 'Retinol Serum',
        }),
      }),
    );
  });

  it('submits the search when enter is pressed', async () => {
    const user = userEvent.setup();
    mockUseSearchCatalogue.mockReturnValue({
      data: [],
      isFetching: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
    });

    renderWithProviders(<SearchTab onPick={jest.fn()} />);

    await user.type(
      screen.getByRole('textbox', { name: /search by brand and product name/i }),
      'ret{enter}',
    );

    expect(mockUseSearchCatalogue).toHaveBeenLastCalledWith('ret');
  });

  it('loads the next search page automatically when the sentinel enters view', async () => {
    const user = userEvent.setup();
    const fetchNextPage = jest.fn();
    mockUseSearchCatalogue.mockReturnValue({
      data: [RESULT],
      isFetching: false,
      isFetchingNextPage: false,
      hasNextPage: true,
      fetchNextPage,
    });

    renderWithProviders(<SearchTab onPick={jest.fn()} />);

    await user.type(
      screen.getByRole('textbox', { name: /search by brand and product name/i }),
      'ret',
    );
    await user.click(screen.getByRole('button', { name: /search/i }));
    triggerIntersection('catalogue-auto-load-sentinel');

    expect(fetchNextPage).toHaveBeenCalled();
  });

  it('renders a retry state when the catalogue search fails', async () => {
    const user = userEvent.setup();
    mockUseSearchCatalogue.mockReturnValue({
      data: [],
      isError: true,
      isFetching: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
      refetch: jest.fn(),
    });

    renderWithProviders(<SearchTab onPick={jest.fn()} />);

    await user.type(
      screen.getByRole('textbox', { name: /search by brand and product name/i }),
      'ret',
    );
    await user.click(screen.getByRole('button', { name: /search/i }));

    expect(
      screen.getByRole('heading', { name: /we couldn't search right now/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });
});
