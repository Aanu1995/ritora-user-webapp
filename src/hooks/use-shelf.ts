"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { QueryKey } from "@/constants/query-keys";
import { useAuthEnabled } from "@/hooks/use-auth-enabled";
import type { ShelfDateContext } from "@/hooks/use-shelf-time-zone";
import {
  buildShelfProductsQueryKey,
  buildShelfStatsQueryKey,
} from "@/lib/shelf-query";
import {
  archiveProduct,
  archiveProducts,
  countProductsByStat,
  createProduct,
  createProductWithImage,
  extractProductFromImages,
  getProduct,
  listProducts,
  markProductFinished,
  markProductsFinished,
  removeProduct,
  removeProducts,
  restoreProduct,
  restoreProducts,
  updateProduct,
  uploadProductImage,
  uploadProductImageForProduct,
} from "@/services/shelf.service";
import {
  type DeepPartial,
  type ShelfListFilters,
  type ShelfProduct,
  type ShelfProductDraft,
} from "@/types/shelf";

type ShelfQueryClient = ReturnType<typeof useQueryClient>;
type ShelfProductMutationFn<TVariables> = (
  variables: TVariables,
) => Promise<ShelfProduct>;
type ShelfIdsMutationFn = (ids: string[]) => Promise<void>;

const MISSING_PRODUCT_ID_ERROR = "MISSING_PRODUCT_ID";

function invalidateShelfQueries(queryClient: ShelfQueryClient) {
  void queryClient.invalidateQueries({ queryKey: [QueryKey.Shelf] });
  // Focus-product ingredient analyses depend on each product's INCI data;
  // any mutation that changes a shelf product must bust them too.
  void queryClient.invalidateQueries({
    queryKey: [QueryKey.IngredientsAnalysis],
  });
}

function setShelfProductCache(
  queryClient: ShelfQueryClient,
  product: ShelfProduct,
) {
  queryClient.setQueryData([QueryKey.ShelfProduct, product.id], product);
}

function removeShelfProductCache(queryClient: ShelfQueryClient, id: string) {
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

function invalidateShelfProducts(queryClient: ShelfQueryClient, ids: string[]) {
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
    queryFn: ({ pageParam, signal }) =>
      listProducts(filters, pageParam, signal),
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
    queryFn: () => countProductsByStat(),
    enabled: isEnabled,
  });
}

export function useShelfProduct(id: string | null) {
  const isEnabled = useAuthEnabled(Boolean(id));

  return useQuery({
    queryKey: [QueryKey.ShelfProduct, id],
    queryFn: () => {
      if (!id) {
        throw new Error(MISSING_PRODUCT_ID_ERROR);
      }
      return getProduct(id);
    },
    enabled: isEnabled,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation(
    createShelfProductMutationOptions(queryClient, createProduct),
  );
}

type UpdateProductArgs = {
  id: string;
  patch: DeepPartial<ShelfProductDraft>;
};

type UploadProductImageForProductArgs = {
  id: string;
  file: File;
};

type CreateProductWithImageArgs = {
  draft: ShelfProductDraft;
  file: File;
};

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation(
    createShelfProductMutationOptions(
      queryClient,
      ({ id, patch }: UpdateProductArgs) => updateProduct(id, patch),
    ),
  );
}

export function useUploadProductImage() {
  return useMutation({
    mutationFn: (file: File) => uploadProductImage(file),
  });
}

export function useCreateProductWithImage() {
  const queryClient = useQueryClient();

  return useMutation(
    createShelfProductMutationOptions(
      queryClient,
      (input: CreateProductWithImageArgs) => createProductWithImage(input),
    ),
  );
}

export function useUploadProductImageForProduct() {
  const queryClient = useQueryClient();

  return useMutation(
    createShelfProductMutationOptions(
      queryClient,
      ({ id, file }: UploadProductImageForProductArgs) =>
        uploadProductImageForProduct(id, file),
    ),
  );
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => removeProduct(id),
    onSuccess: (_data, id) => {
      removeShelfProductCache(queryClient, id);
      invalidateShelfQueries(queryClient);
    },
  });
}

export function useDeleteProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => removeProducts(ids),
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
    createShelfProductMutationOptions(queryClient, archiveProduct),
  );
}

export function useExtractProductFromImages() {
  return useMutation({
    mutationKey: [QueryKey.PhotoExtract],
    mutationFn: (input: { images: File[]; heroImageIndex: number }) =>
      extractProductFromImages(input),
  });
}

export function useArchiveProducts() {
  const queryClient = useQueryClient();

  const mutation = useMutation(
    createShelfIdsMutationOptions(queryClient, archiveProducts),
  );

  return {
    ...mutation,
    archive: (ids: string[], options?: Parameters<typeof mutation.mutate>[1]) =>
      mutation.mutate(ids, options),
  };
}

export function useRestoreProduct() {
  const queryClient = useQueryClient();

  return useMutation(
    createShelfProductMutationOptions(queryClient, restoreProduct),
  );
}

export function useRestoreProducts() {
  const queryClient = useQueryClient();

  const mutation = useMutation(
    createShelfIdsMutationOptions(queryClient, restoreProducts),
  );

  return {
    ...mutation,
    restore: (ids: string[], options?: Parameters<typeof mutation.mutate>[1]) =>
      mutation.mutate(ids, options),
  };
}

export function useMarkProductFinished() {
  const queryClient = useQueryClient();

  return useMutation(
    createShelfProductMutationOptions(queryClient, markProductFinished),
  );
}

export function useMarkFinished() {
  const queryClient = useQueryClient();

  const mutation = useMutation(
    createShelfIdsMutationOptions(queryClient, markProductsFinished),
  );

  return {
    ...mutation,
    markFinished: (
      ids: string[],
      options?: Parameters<typeof mutation.mutate>[1],
    ) => mutation.mutate(ids, options),
  };
}

export type { ShelfProduct };
