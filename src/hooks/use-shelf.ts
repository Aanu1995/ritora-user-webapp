'use client';

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { QueryKey } from '@/constants/query-keys';
import { useAuthStore } from '@/stores/auth-store';
import * as shelfService from '@/services/shelf.service';
import {
  type DeepPartial,
  type ShelfListFilters,
  type ShelfProduct,
  type ShelfProductDraft,
} from '@/types/shelf';

function invalidateShelfQueries(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: [QueryKey.Shelf] });
}

function setShelfProductCache(
  queryClient: ReturnType<typeof useQueryClient>,
  product: ShelfProduct,
) {
  queryClient.setQueryData([QueryKey.ShelfProduct, product.id], product);
}

function removeShelfProductCache(
  queryClient: ReturnType<typeof useQueryClient>,
  id: string,
) {
  queryClient.removeQueries({ queryKey: [QueryKey.ShelfProduct, id] });
}

function invalidateShelfProductCache(
  queryClient: ReturnType<typeof useQueryClient>,
  id: string,
) {
  queryClient.invalidateQueries({ queryKey: [QueryKey.ShelfProduct, id] });
}

function invalidateShelfProductCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  ids: string[],
) {
  ids.forEach((id) => {
    invalidateShelfProductCache(queryClient, id);
  });
}

function updateShelfProductCache(
  queryClient: ReturnType<typeof useQueryClient>,
  product: ShelfProduct,
) {
  setShelfProductCache(queryClient, product);
  invalidateShelfQueries(queryClient);
}

export function useShelfProducts(filters: ShelfListFilters) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const query = useInfiniteQuery({
    queryKey: [
      QueryKey.Shelf,
      filters.stat,
      filters.category,
      filters.search,
      filters.sort,
    ],
    queryFn: ({ pageParam }) => shelfService.listProducts(filters, pageParam),
    enabled: isAuthenticated,
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
  const products = query.data?.pages.flatMap((page) => page.items) ?? [];

  return {
    ...query,
    data: products,
  };
}

export function useShelfStats() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: [QueryKey.Shelf, 'stats'],
    queryFn: () => shelfService.countProductsByStat(),
    enabled: isAuthenticated,
  });
}

export function useShelfProduct(id: string | null) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: [QueryKey.ShelfProduct, id],
    queryFn: () => {
      if (!id) {
        throw new Error('Product id is required');
      }
      return shelfService.getProduct(id);
    },
    enabled: isAuthenticated && Boolean(id),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (draft: ShelfProductDraft) => shelfService.createProduct(draft),
    onSuccess: (created) => {
      updateShelfProductCache(queryClient, created);
    },
  });
}

type UpdateProductArgs = {
  id: string;
  patch: DeepPartial<ShelfProductDraft>;
};

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, patch }: UpdateProductArgs) =>
      shelfService.updateProduct(id, patch),
    onSuccess: (updated) => {
      updateShelfProductCache(queryClient, updated);
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => shelfService.removeProduct(id),
    onSuccess: (_data, id) => {
      removeShelfProductCache(queryClient, id);
      invalidateShelfQueries(queryClient);
    },
  });
}

export function useDeleteProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => shelfService.removeProducts(ids),
    onSuccess: (_data, ids) => {
      ids.forEach((id) => {
        removeShelfProductCache(queryClient, id);
      });

      invalidateShelfQueries(queryClient);
    },
  });
}

export function useArchiveProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => shelfService.archiveProduct(id),
    onSuccess: (updated) => {
      updateShelfProductCache(queryClient, updated);
    },
  });
}

export function useExtractProductFromImages() {
  return useMutation({
    mutationKey: [QueryKey.PhotoExtract],
    mutationFn: (input: { images: File[]; heroImageIndex: number }) =>
      shelfService.extractProductFromImages(input),
  });
}

export function useArchiveProducts() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (ids: string[]) => shelfService.archiveProducts(ids),
    onSuccess: (_data, ids) => {
      invalidateShelfProductCaches(queryClient, ids);
      invalidateShelfQueries(queryClient);
    },
  });

  return {
    ...mutation,
    archive: (
      ids: string[],
      options?: Parameters<typeof mutation.mutate>[1],
    ) => mutation.mutate(ids, options),
  };
}

export function useRestoreProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => shelfService.restoreProduct(id),
    onSuccess: (updated) => {
      updateShelfProductCache(queryClient, updated);
    },
  });
}

export function useRestoreProducts() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (ids: string[]) => shelfService.restoreProducts(ids),
    onSuccess: (_data, ids) => {
      invalidateShelfProductCaches(queryClient, ids);
      invalidateShelfQueries(queryClient);
    },
  });

  return {
    ...mutation,
    restore: (
      ids: string[],
      options?: Parameters<typeof mutation.mutate>[1],
    ) => mutation.mutate(ids, options),
  };
}

export function useMarkProductFinished() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => shelfService.markProductFinished(id),
    onSuccess: (updated) => {
      updateShelfProductCache(queryClient, updated);
    },
  });
}

export function useMarkFinished() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (ids: string[]) => shelfService.markProductsFinished(ids),
    onSuccess: (_data, ids) => {
      invalidateShelfProductCaches(queryClient, ids);
      invalidateShelfQueries(queryClient);
    },
  });

  return {
    ...mutation,
    markFinished: (
      ids: string[],
      options?: Parameters<typeof mutation.mutate>[1],
    ) => mutation.mutate(ids, options),
  };
}

/** Export for consumers that need the raw product type. */
export type { ShelfProduct };
