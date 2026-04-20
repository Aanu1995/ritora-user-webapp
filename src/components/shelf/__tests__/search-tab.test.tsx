import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import {
  CatalogueSource,
  LookupConfidence,
  ProductCategory,
  type ResolvedLookup,
} from '@/types/shelf';

const mockUseSearchCatalogueBestMatch = jest.fn();
const mockToastError = jest.fn();

jest.mock('@/hooks/use-shelf', () => ({
  useSearchCatalogueBestMatch: () => mockUseSearchCatalogueBestMatch(),
}));

jest.mock('sonner', () => ({
  toast: {
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

import { SearchTab } from '@/components/shelf/add-product/search-tab';

const RESOLVED_RESULT: ResolvedLookup = {
  identity: {
    brand: 'CeraVe',
    name: 'Retinol Serum',
    category: ProductCategory.Serum,
  },
  guidance: {},
  manufacturer: {
    brand: 'CeraVe',
  },
  provenance: 'catalogue' as const,
  source: CatalogueSource.OpenBeautyFacts,
  confidence: LookupConfidence.Medium,
  reviewRequired: true,
  warnings: [],
  evidence: [],
};

beforeEach(() => {
  mockUseSearchCatalogueBestMatch.mockReset();
  mockToastError.mockReset();
  mockUseSearchCatalogueBestMatch.mockReturnValue({
    mutate: jest.fn(),
    isPending: false,
  });
});

describe('SearchTab', () => {
  it('renders the initial empty state', () => {
    renderWithProviders(<SearchTab onResolved={jest.fn()} />);

    expect(
      screen.getByText(/type at least two letters to search the catalogue/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /starting a new search clears the current draft fields before import/i,
      ),
    ).toBeInTheDocument();
  });

  it('searches in one backend call and forwards the resolved result', async () => {
    const user = userEvent.setup();
    const onResolved = jest.fn();
    const onSearchStart = jest.fn();
    const mutate = jest.fn((query, options) => {
      expect(query).toBe('retinol');
      options?.onSuccess?.(RESOLVED_RESULT);
    });

    mockUseSearchCatalogueBestMatch.mockReturnValue({
      mutate,
      isPending: false,
    });

    renderWithProviders(
      <SearchTab onResolved={onResolved} onSearchStart={onSearchStart} />,
    );

    await user.type(
      screen.getByRole('textbox', { name: /search by brand and product name/i }),
      'retinol',
    );
    await user.click(screen.getByRole('button', { name: /^search$/i }));

    expect(mutate).toHaveBeenCalledWith(
      'retinol',
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    );
    expect(onSearchStart).toHaveBeenCalledTimes(1);
    expect(onResolved).toHaveBeenCalledWith(RESOLVED_RESULT);
    expect(
      screen.getByText(/type at least two letters to search the catalogue/i),
    ).toBeInTheDocument();
  });

  it('submits the search when enter is pressed', async () => {
    const user = userEvent.setup();
    const mutate = jest.fn((_query, options) => {
      options?.onSuccess?.(RESOLVED_RESULT);
    });

    mockUseSearchCatalogueBestMatch.mockReturnValue({
      mutate,
      isPending: false,
    });

    renderWithProviders(<SearchTab onResolved={jest.fn()} />);

    await user.type(
      screen.getByRole('textbox', { name: /search by brand and product name/i }),
      'ret{enter}',
    );

    expect(mutate).toHaveBeenCalledWith(
      'ret',
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    );
  });

  it('shows loading in the search button while the backend search is pending', async () => {
    const user = userEvent.setup();

    mockUseSearchCatalogueBestMatch.mockReturnValue({
      mutate: jest.fn(),
      isPending: true,
    });

    renderWithProviders(<SearchTab onResolved={jest.fn()} />);

    await user.type(
      screen.getByRole('textbox', { name: /search by brand and product name/i }),
      'retinol',
    );

    expect(
      screen.getByRole('button', { name: /searching/i }),
    ).toBeInTheDocument();
  });

  it('shows a no-results message when the backend finds no acceptable match', async () => {
    const user = userEvent.setup();
    const mutate = jest.fn((_query, options) => {
      options?.onSuccess?.(null);
    });

    mockUseSearchCatalogueBestMatch.mockReturnValue({
      mutate,
      isPending: false,
    });

    renderWithProviders(<SearchTab onResolved={jest.fn()} />);

    await user.type(
      screen.getByRole('textbox', { name: /search by brand and product name/i }),
      'retinol',
    );
    await user.click(screen.getByRole('button', { name: /^search$/i }));

    await waitFor(() => {
      expect(
        screen.getByText(
          /nothing matched\. try another name, or enter the product manually\./i,
        ),
      ).toBeInTheDocument();
    });
  });

  it('shows a toast when the backend search fails and keeps the search UI usable', async () => {
    const user = userEvent.setup();
    const mutate = jest.fn((_query, options) => {
      options?.onError?.(new Error('timeout'));
    });

    mockUseSearchCatalogueBestMatch.mockReturnValue({
      mutate,
      isPending: false,
    });

    renderWithProviders(<SearchTab onResolved={jest.fn()} />);

    await user.type(
      screen.getByRole('textbox', { name: /search by brand and product name/i }),
      'retinol',
    );
    await user.click(screen.getByRole('button', { name: /^search$/i }));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        expect.stringMatching(/we couldn't search right now/i),
        expect.objectContaining({
          description: expect.stringMatching(
            /the catalogue search did not load this time/i,
          ),
        }),
      );
    });
    expect(
      screen.queryByRole('heading', { name: /we couldn't search right now/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /^search$/i }),
    ).toBeInTheDocument();
  });
});
