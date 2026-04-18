import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import {
  ProductCategory,
  type CatalogueSuggestion,
} from '@/types/shelf';

const mockUseSearchCatalogue = jest.fn();

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

  it('offers a load more action when another search page exists', async () => {
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
    await user.click(screen.getByRole('button', { name: /load more/i }));

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
