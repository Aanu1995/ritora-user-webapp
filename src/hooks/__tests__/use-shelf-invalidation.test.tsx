import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactNode } from 'react';
import messages from '../../../messages/en.json';
import { AppPreferencesProvider } from '@/components/preferences/app-preferences-provider';
import { QueryKey } from '@/constants/query-keys';
import { useAuthStore } from '@/stores/auth-store';
import {
  DataProvenance,
  ProductCategory,
  ShelfStatus,
  type ShelfProduct,
} from '@/types/shelf';

jest.mock('@/services/shelf.service', () => ({
  archiveProduct: jest.fn(),
  archiveProducts: jest.fn(),
  countProductsByStat: jest.fn(),
  createProduct: jest.fn(),
  extractProductFromImages: jest.fn(),
  listProducts: jest.fn(),
  markProductFinished: jest.fn(),
  markProductsFinished: jest.fn(),
  removeProduct: jest.fn(),
  removeProducts: jest.fn(),
  restoreProduct: jest.fn(),
  restoreProducts: jest.fn(),
  updateProduct: jest.fn(),
  uploadProductImage: jest.fn(),
}));

import {
  archiveProducts,
  createProduct,
  markProductsFinished,
  removeProducts,
} from '@/services/shelf.service';
import {
  useArchiveProducts,
  useCreateProduct,
  useDeleteProducts,
  useMarkFinished,
} from '@/hooks/use-shelf';

const PRODUCT: ShelfProduct = {
  id: 'product-1',
  identity: {
    brand: 'CeraVe',
    name: 'Retinol Serum',
    category: ProductCategory.Serum,
    barcode: null,
    imageUrls: [],
    sizeMl: null,
    description: null,
    benefits: [],
    suitedFor: [],
    inciIngredients: ['Retinol'],
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
    openedAt: null,
    expiresAt: null,
    periodAfterOpeningMonths: 12,
    pricePaid: null,
    pricePaidCurrency: null,
    purchasedFrom: null,
    personalNotes: null,
    preferredTimeOfDay: null,
  },
  status: ShelfStatus.Active,
  provenance: DataProvenance.UserEntered,
  createdAt: '2026-04-17T00:00:00.000Z',
  updatedAt: '2026-04-17T00:00:00.000Z',
};

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  // Seed an "ingredient" query so we can detect invalidation afterwards.
  queryClient.setQueryData(
    [QueryKey.IngredientsAnalysis, 'focus-product', 'product-1', false],
    { placeholder: true },
  );

  const wrapper = ({ children }: { children: ReactNode }) => (
    <NextIntlClientProvider locale="en" messages={messages}>
      <AppPreferencesProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </AppPreferencesProvider>
    </NextIntlClientProvider>
  );

  return { queryClient, wrapper };
}

function queriesInvalidated(queryClient: QueryClient, queryKey: unknown[]) {
  return queryClient
    .getQueryCache()
    .findAll({ queryKey })
    .every((query) => query.state.isInvalidated);
}

beforeEach(() => {
  jest.clearAllMocks();
  useAuthStore.setState({
    user: null,
    isAuthenticated: true,
    isLoading: false,
  });
});

describe('shelf mutations invalidate ingredient queries', () => {
  it('createProduct invalidates shelf-summary and focus-product analyses', async () => {
    const { queryClient, wrapper } = setup();
    (createProduct as jest.Mock).mockResolvedValue(PRODUCT);

    const { result } = renderHook(() => useCreateProduct(), { wrapper });

    result.current.mutate({
      identity: PRODUCT.identity,
      guidance: PRODUCT.guidance,
      manufacturer: PRODUCT.manufacturer,
      userFields: PRODUCT.userFields,
      status: PRODUCT.status,
      provenance: PRODUCT.provenance,
    });

    await waitFor(() =>
      expect(
        queriesInvalidated(queryClient, [QueryKey.IngredientsAnalysis]),
      ).toBe(true),
    );
  });

  it('bulk archive invalidates ingredient queries', async () => {
    const { queryClient, wrapper } = setup();
    (archiveProducts as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useArchiveProducts(), { wrapper });

    result.current.archive(['product-1']);

    await waitFor(() =>
      expect(
        queriesInvalidated(queryClient, [QueryKey.IngredientsAnalysis]),
      ).toBe(true),
    );
  });

  it('bulk mark-finished invalidates ingredient queries', async () => {
    const { queryClient, wrapper } = setup();
    (markProductsFinished as jest.Mock).mockResolvedValue(
      undefined,
    );

    const { result } = renderHook(() => useMarkFinished(), { wrapper });

    result.current.markFinished(['product-1']);

    await waitFor(() =>
      expect(
        queriesInvalidated(queryClient, [QueryKey.IngredientsAnalysis]),
      ).toBe(true),
    );
  });

  it('bulk delete invalidates ingredient queries', async () => {
    const { queryClient, wrapper } = setup();
    (removeProducts as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteProducts(), { wrapper });

    result.current.mutate(['product-1']);

    await waitFor(() =>
      expect(
        queriesInvalidated(queryClient, [QueryKey.IngredientsAnalysis]),
      ).toBe(true),
    );
  });
});
