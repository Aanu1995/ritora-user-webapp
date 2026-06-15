import {
  NO_CLIENT_SIDE_REQUEST_TIMEOUT_MS,
  type ApiRequestOptions,
  deleteRequest,
  getRequest,
  patchRequest,
  postMultipartRequest,
  postRequest,
} from "@/lib/api";
import { ApiPath } from "@/constants/api-paths";
import {
  type DeepPartial,
  type PaginatedResult,
  type ResolvedLookup,
  type ShelfListFilters,
  type ShelfProduct,
  type ShelfProductDraft,
  type UpdateProductIntroductionPayload,
  ShelfIntroductionStatusFilter,
} from "@/types/shelf";
import type { UploadProgressOptions } from "@/lib/upload-progress";

type UploadedProductImage = {
  imageUrl: string;
};

const PRODUCT_IMAGE_FORM_FIELD = "image";
const PRODUCT_DRAFT_FORM_FIELD = "product";
const PRODUCT_IMAGE_UPLOAD_TIMEOUT_MS = 30000;
const PRODUCT_PHOTO_EXTRACTION_TIMEOUT_MS =
  NO_CLIENT_SIDE_REQUEST_TIMEOUT_MS;

function buildUploadConfig(
  timeout: number,
  options: UploadProgressOptions,
) {
  return options.onUploadProgress
    ? { timeout, onUploadProgress: options.onUploadProgress }
    : { timeout };
}

function getWithOptions<T>(path: string, options?: ApiRequestOptions) {
  return options ? getRequest<T>(path, options) : getRequest<T>(path);
}

export async function listProducts(
  filters: ShelfListFilters,
  cursor?: string | null,
  signal?: AbortSignal,
): Promise<PaginatedResult<ShelfProduct>> {
  const introductionStatus =
    filters.introductionStatus ?? ShelfIntroductionStatusFilter.All;
  const params = {
    stat: filters.stat,
    category: filters.category,
    ...(introductionStatus !== ShelfIntroductionStatusFilter.All
      ? { introductionStatus }
      : {}),
    search: filters.search,
    sort: filters.sort,
    ...(cursor ? { cursor } : {}),
  };

  return getRequest<PaginatedResult<ShelfProduct>>(ApiPath.InventoryProducts, {
    params,
    signal,
  });
}

export async function countProductsByStat(
  options?: ApiRequestOptions,
): Promise<Record<string, number>> {
  return getWithOptions<Record<string, number>>(
    ApiPath.InventoryProductsStats,
    options,
  );
}

export async function getProduct(
  id: string,
  options?: ApiRequestOptions,
): Promise<ShelfProduct> {
  return getWithOptions<ShelfProduct>(ApiPath.InventoryProduct(id), options);
}

export async function createProduct(
  draft: ShelfProductDraft,
): Promise<ShelfProduct> {
  return postRequest<ShelfProduct>(ApiPath.InventoryProducts, draft);
}

export async function createProductWithImage(
  input: {
    draft: ShelfProductDraft;
    file: File;
  },
  options: UploadProgressOptions = {},
): Promise<ShelfProduct> {
  const body = new FormData();
  body.append(PRODUCT_DRAFT_FORM_FIELD, JSON.stringify(input.draft));
  body.append(PRODUCT_IMAGE_FORM_FIELD, input.file);

  return postMultipartRequest<ShelfProduct>(
    ApiPath.InventoryProductsWithImage,
    body,
    buildUploadConfig(PRODUCT_IMAGE_UPLOAD_TIMEOUT_MS, options),
  );
}

export async function updateProduct(
  id: string,
  patch: DeepPartial<ShelfProductDraft>,
): Promise<ShelfProduct> {
  return patchRequest<ShelfProduct>(ApiPath.InventoryProduct(id), patch);
}

export async function updateProductIntroduction(
  id: string,
  payload: UpdateProductIntroductionPayload,
): Promise<ShelfProduct> {
  return patchRequest<ShelfProduct>(
    ApiPath.InventoryProductIntroduction(id),
    payload,
  );
}

export async function uploadProductImage(
  file: File,
  options: UploadProgressOptions = {},
): Promise<UploadedProductImage> {
  const body = new FormData();
  body.append(PRODUCT_IMAGE_FORM_FIELD, file);

  return postMultipartRequest<UploadedProductImage>(
    ApiPath.InventoryProductsUploadImage,
    body,
    buildUploadConfig(PRODUCT_IMAGE_UPLOAD_TIMEOUT_MS, options),
  );
}

export async function uploadProductImageForProduct(
  id: string,
  file: File,
  options: UploadProgressOptions = {},
): Promise<ShelfProduct> {
  const body = new FormData();
  body.append(PRODUCT_IMAGE_FORM_FIELD, file);

  return postMultipartRequest<ShelfProduct>(
    ApiPath.InventoryProductUploadImage(id),
    body,
    buildUploadConfig(PRODUCT_IMAGE_UPLOAD_TIMEOUT_MS, options),
  );
}

export async function removeProduct(id: string): Promise<void> {
  return deleteRequest<void>(ApiPath.InventoryProduct(id));
}

export async function removeProducts(ids: string[]): Promise<void> {
  return postRequest<void>(ApiPath.InventoryProductsBulkDelete, { ids });
}

export async function archiveProduct(id: string): Promise<ShelfProduct> {
  return postRequest<ShelfProduct>(ApiPath.InventoryProductArchive(id));
}

export async function restoreProduct(id: string): Promise<ShelfProduct> {
  return postRequest<ShelfProduct>(ApiPath.InventoryProductRestore(id));
}

export async function markProductFinished(id: string): Promise<ShelfProduct> {
  return postRequest<ShelfProduct>(ApiPath.InventoryProductMarkFinished(id));
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

export async function extractProductFromImages(
  input: {
    images: File[];
    heroImageIndex: number;
  },
  options: UploadProgressOptions = {},
): Promise<ResolvedLookup | null> {
  const body = new FormData();
  input.images.forEach((image) => {
    body.append("images", image);
  });
  body.append("heroImageIndex", String(input.heroImageIndex));

  return postMultipartRequest<ResolvedLookup | null>(
    ApiPath.CatalogueProductsExtractFromImages,
    body,
    buildUploadConfig(PRODUCT_PHOTO_EXTRACTION_TIMEOUT_MS, options),
  );
}
