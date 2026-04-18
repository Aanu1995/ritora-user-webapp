import {
  deleteRequest,
  getRequest,
  patchRequest,
  postRequest,
} from '@/lib/api';
import { ApiPath } from '@/constants/api-paths';
import {
  type CatalogueSuggestion,
  type PaginatedResult,
  type ResolvedLookup,
  type ShelfListFilters,
  type ShelfProduct,
  type ShelfProductDraft,
} from '@/types/shelf';

export async function listProducts(
  filters: ShelfListFilters,
  cursor?: string | null,
): Promise<PaginatedResult<ShelfProduct>> {
  const params = {
    stat: filters.stat,
    category: filters.category,
    search: filters.search,
    sort: filters.sort,
    limit: 30,
    ...(cursor ? { cursor } : {}),
  };

  return getRequest<PaginatedResult<ShelfProduct>>(ApiPath.InventoryProducts, {
    params,
  });
}

export async function countProductsByStat(): Promise<Record<string, number>> {
  return getRequest<Record<string, number>>(ApiPath.InventoryProductsStats);
}

export async function getProduct(id: string): Promise<ShelfProduct> {
  return getRequest<ShelfProduct>(`${ApiPath.InventoryProducts}/${id}`);
}

export async function createProduct(
  draft: ShelfProductDraft,
): Promise<ShelfProduct> {
  return postRequest<ShelfProduct>(ApiPath.InventoryProducts, draft);
}

export async function updateProduct(
  id: string,
  patch: Partial<ShelfProductDraft>,
): Promise<ShelfProduct> {
  return patchRequest<ShelfProduct>(`${ApiPath.InventoryProducts}/${id}`, patch);
}

export async function removeProduct(id: string): Promise<void> {
  return deleteRequest<void>(`${ApiPath.InventoryProducts}/${id}`);
}

export async function removeProducts(ids: string[]): Promise<void> {
  return postRequest<void>(ApiPath.InventoryProductsBulkDelete, { ids });
}

export async function archiveProduct(id: string): Promise<ShelfProduct> {
  return postRequest<ShelfProduct>(`${ApiPath.InventoryProducts}/${id}/archive`);
}

export async function restoreProduct(id: string): Promise<ShelfProduct> {
  return postRequest<ShelfProduct>(`${ApiPath.InventoryProducts}/${id}/restore`);
}

export async function markProductFinished(id: string): Promise<ShelfProduct> {
  return postRequest<ShelfProduct>(
    `${ApiPath.InventoryProducts}/${id}/mark-finished`,
  );
}

export async function archiveProducts(ids: string[]): Promise<void> {
  return postRequest<void>(ApiPath.InventoryProductsBulkArchive, { ids });
}

export async function restoreProducts(ids: string[]): Promise<void> {
  return postRequest<void>(ApiPath.InventoryProductsBulkRestore, { ids });
}

export async function markProductsFinished(ids: string[]): Promise<void> {
  return postRequest<void>(ApiPath.InventoryProductsBulkMarkFinished, { ids });
}

export async function searchCatalogue(
  query: string,
  cursor?: string | null,
): Promise<PaginatedResult<CatalogueSuggestion>> {
  const params = {
    q: query,
    limit: 30,
    ...(cursor ? { cursor } : {}),
  };

  return getRequest<PaginatedResult<CatalogueSuggestion>>(
    ApiPath.CatalogueProductsSearch,
    { params },
  );
}

export async function resolveBarcode(
  barcode: string,
): Promise<ResolvedLookup | null> {
  return getRequest<ResolvedLookup | null>(
    `${ApiPath.CatalogueProductsBarcode}/${encodeURIComponent(barcode)}`,
  );
}

export async function resolveUrl(url: string): Promise<ResolvedLookup | null> {
  return postRequest<ResolvedLookup | null>(
    ApiPath.CatalogueProductsResolveUrl,
    { url },
  );
}
