import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import {
  ProductCategory,
  type CatalogueSuggestion,
} from '@/types/shelf';

const mockUseSearchCatalogue = jest.fn();

jest.mock('@/hooks/use-debounced-value', () => ({
  useDebouncedValue: <T,>(value: T) => value,
}));

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
    });

    renderWithProviders(<SearchTab onPick={jest.fn()} />);

    expect(screen.getByText(/type at least two letters/i)).toBeInTheDocument();

    await user.type(
      screen.getByRole('textbox', { name: /search by brand and product name/i }),
      're',
    );

    expect(mockUseSearchCatalogue).toHaveBeenCalled();
  });

  it('lets the user pick a search result', async () => {
    const user = userEvent.setup();
    const onPick = jest.fn();
    mockUseSearchCatalogue.mockReturnValue({
      data: [RESULT],
      isFetching: false,
    });

    renderWithProviders(<SearchTab onPick={onPick} />);

    await user.type(
      screen.getByRole('textbox', { name: /search by brand and product name/i }),
      're',
    );
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
});
