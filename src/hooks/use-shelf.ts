'use client';

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { QueryKey } from '@/constants/query-keys';
import { useAuthEnabled } from '@/hooks/use-auth-enabled';
import type { ShelfDateContext } from '@/hooks/use-shelf-time-zone';
import {
  buildShelfProductsQueryKey,
  buildShelfStatsQueryKey,
} from '@/lib/shelf-query';
import * as shelfService from '@/services/shelf.service';
import {
  type DeepPartial,
  type ShelfListFilters,
  type ShelfProduct,
  type ShelfProductDraft,
} from '@/types/shelf';

type ShelfQueryClient = ReturnType<typeof useQueryClient>;
type ShelfProductMutationFn<TVariables> = (
  variables: TVariables,
) => Promise<ShelfProduct>;
type ShelfIdsMutationFn = (ids: string[]) => Promise<void>;

function invalidateShelfQueries(queryClient: ShelfQueryClient) {
  void queryClient.invalidateQueries({ queryKey: [QueryKey.Shelf] });
}

function setShelfProductCache(
  queryClient: ShelfQueryClient,
  product: ShelfProduct,
) {
  queryClient.setQueryData([QueryKey.ShelfProduct, product.id], product);
}

function removeShelfProductCache(
  queryClient: ShelfQueryClient,
  id: string,
) {
  queryClient.removeQueries({ queryKey: [QueryKey.ShelfProduct, id] });
}

function invalidateShelfProductCache(
  queryClient: ShelfQueryClient,
  id: string,
) {
  queryClient.invalidateQueries({ queryKey: [QueryKey.ShelfProduct, id] });
}

function invalidateShelfProductCaches(
  queryClient: ShelfQueryClient,
  ids: string[],
) {
  ids.forEach((id) => {
    invalidateShelfProductCache(queryClient, id);
  });
}

function syncShelfProduct(
  queryClient: ShelfQueryClient,
  product: ShelfProduct,
) {
  setShelfProductCache(queryClient, product);
  invalidateShelfQueries(queryClient);
}

function invalidateShelfProducts(
  queryClient: ShelfQueryClient,
  ids: string[],
) {
  invalidateShelfProductCaches(queryClient, ids);
  invalidateShelfQueries(queryClient);
}

function createShelfProductMutationOptions<TVariables>(
  queryClient: ShelfQueryClient,
  mutationFn: ShelfProductMutationFn<TVariables>,
) {
  return {
    mutationFn: (variables: TVariables) => mutationFn(variables),
    onSuccess: (product: ShelfProduct) => {
      syncShelfProduct(queryClient, product);
    },
  };
}

function createShelfIdsMutationOptions(
  queryClient: ShelfQueryClient,
  mutationFn: ShelfIdsMutationFn,
) {
  return {
    mutationFn: (ids: string[]) => mutationFn(ids),
    onSuccess: (_data: void, ids: string[]) => {
      invalidateShelfProducts(queryClient, ids);
    },
  };
}

export function useShelfProducts(
  filters: ShelfListFilters,
  dateContext: ShelfDateContext,
) {
  const isEnabled = useAuthEnabled();

  const query = useInfiniteQuery({
    queryKey: buildShelfProductsQueryKey(filters, dateContext),
    queryFn: ({ pageParam }) => shelfService.listProducts(filters, pageParam),
    enabled: isEnabled,
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
  const products = query.data?.pages.flatMap((page) => page.items) ?? [];

  return {
    ...query,
    data: products,
  };
}

export function useShelfStats(dateContext: ShelfDateContext) {
  const isEnabled = useAuthEnabled();

  return useQuery({
    queryKey: buildShelfStatsQueryKey(dateContext),
    queryFn: () => shelfService.countProductsByStat(),
    enabled: isEnabled,
  });
}

export function useShelfProduct(id: string | null) {
  const isEnabled = useAuthEnabled(Boolean(id));

  return useQuery({
    queryKey: [QueryKey.ShelfProduct, id],
    queryFn: () => {
      if (!id) {
        throw new Error('Product id is required');
      }
      return shelfService.getProduct(id);
    },
    enabled: isEnabled,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation(
    createShelfProductMutationOptions(queryClient, shelfService.createProduct),
  );
}

type UpdateProductArgs = {
  id: string;
  patch: DeepPartial<ShelfProductDraft>;
};

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation(
    createShelfProductMutationOptions(
      queryClient,
      ({ id, patch }: UpdateProductArgs) => shelfService.updateProduct(id, patch),
    ),
  );
}

export function useUploadProductImage() {
  return useMutation({
    mutationFn: (file: File) => shelfService.uploadProductImage(file),
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

  return useMutation(
    createShelfProductMutationOptions(queryClient, shelfService.archiveProduct),
  );
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

  const mutation = useMutation(
    createShelfIdsMutationOptions(queryClient, shelfService.archiveProducts),
  );

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

  return useMutation(
    createShelfProductMutationOptions(queryClient, shelfService.restoreProduct),
  );
}

export function useRestoreProducts() {
  const queryClient = useQueryClient();

  const mutation = useMutation(
    createShelfIdsMutationOptions(queryClient, shelfService.restoreProducts),
  );

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

  return useMutation(
    createShelfProductMutationOptions(
      queryClient,
      shelfService.markProductFinished,
    ),
  );
}

export function useMarkFinished() {
  const queryClient = useQueryClient();

  const mutation = useMutation(
    createShelfIdsMutationOptions(queryClient, shelfService.markProductsFinished),
  );

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
