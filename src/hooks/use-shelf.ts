'use client';

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { QueryKey } from '@/constants/query-keys';
import { useAuthStore } from '@/stores/auth-store';
import * as shelfService from '@/services/shelf.service';
import {
  type ShelfListFilters,
  type ShelfProduct,
  type ShelfProductDraft,
  ShelfStatus,
} from '@/types/shelf';

export function useShelfProducts(filters: ShelfListFilters) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: [
      QueryKey.Shelf,
      filters.stat,
      filters.category,
      filters.search,
      filters.sort,
    ],
    queryFn: () => shelfService.listProducts(filters),
    enabled: isAuthenticated,
    placeholderData: keepPreviousData,
  });
}

export function useShelfStats() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: [QueryKey.Shelf, 'stats'],
    queryFn: () => shelfService.countProductsByStat(),
    enabled: isAuthenticated,
    placeholderData: keepPreviousData,
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
      queryClient.setQueryData([QueryKey.ShelfProduct, created.id], created);
      void queryClient.invalidateQueries({ queryKey: [QueryKey.Shelf] });
    },
  });
}

type UpdateProductArgs = {
  id: string;
  patch: Partial<ShelfProductDraft>;
};

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, patch }: UpdateProductArgs) =>
      shelfService.updateProduct(id, patch),
    onSuccess: (updated) => {
      queryClient.setQueryData([QueryKey.ShelfProduct, updated.id], updated);
      void queryClient.invalidateQueries({ queryKey: [QueryKey.Shelf] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => shelfService.removeProduct(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: [QueryKey.ShelfProduct, id] });
      void queryClient.invalidateQueries({ queryKey: [QueryKey.Shelf] });
    },
  });
}

export function useDeleteProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => shelfService.removeProducts(ids),
    onSuccess: (_data, ids) => {
      ids.forEach((id) => {
        queryClient.removeQueries({ queryKey: [QueryKey.ShelfProduct, id] });
      });
      void queryClient.invalidateQueries({ queryKey: [QueryKey.Shelf] });
    },
  });
}

type SetStatusArgs = {
  ids: string[];
  status: ShelfStatus;
};

export function useSetProductsStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, status }: SetStatusArgs) =>
      shelfService.setProductsStatus(ids, status),
    onSuccess: (_data, { ids }) => {
      ids.forEach((id) => {
        queryClient.invalidateQueries({ queryKey: [QueryKey.ShelfProduct, id] });
      });
      void queryClient.invalidateQueries({ queryKey: [QueryKey.Shelf] });
    },
  });
}

/** Convenience wrappers over useSetProductsStatus. */
export function useArchiveProducts() {
  const set = useSetProductsStatus();
  return {
    ...set,
    archive: (
      ids: string[],
      options?: Parameters<typeof set.mutate>[1],
    ) => set.mutate({ ids, status: ShelfStatus.Archived }, options),
  };
}

export function useRestoreProducts() {
  const set = useSetProductsStatus();
  return {
    ...set,
    restore: (
      ids: string[],
      options?: Parameters<typeof set.mutate>[1],
    ) => set.mutate({ ids, status: ShelfStatus.Active }, options),
  };
}

export function useMarkFinished() {
  const set = useSetProductsStatus();
  return {
    ...set,
    markFinished: (
      ids: string[],
      options?: Parameters<typeof set.mutate>[1],
    ) => set.mutate({ ids, status: ShelfStatus.FinishedUp }, options),
  };
}

export function useSearchCatalogue(query: string) {
  const trimmed = query.trim();

  return useQuery({
    queryKey: [QueryKey.CatalogueSearch, trimmed],
    queryFn: () => shelfService.searchCatalogue(trimmed),
    enabled: trimmed.length >= 2,
    staleTime: 30_000,
  });
}

export function useResolveBarcode(barcode: string | null) {
  return useQuery({
    queryKey: [QueryKey.BarcodeResolve, barcode],
    queryFn: () => {
      if (!barcode) {
        throw new Error('Barcode is required');
      }
      return shelfService.resolveBarcode(barcode);
    },
    enabled: Boolean(barcode && barcode.length >= 6),
  });
}

export function useResolveUrl() {
  return useMutation({
    mutationFn: (url: string) => shelfService.resolveUrl(url),
  });
}

/** Export for consumers that need the raw product type. */
export type { ShelfProduct };
