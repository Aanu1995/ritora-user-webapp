import type { ProductFormValue } from '../product-form-body';
import { ProductIntroductionStatus, type ShelfProduct } from '@/types/shelf';

export function getProductEditDefaultValues(
  product: ShelfProduct,
): ProductFormValue {
  return {
    identity: product.identity,
    guidance: product.guidance,
    manufacturer: product.manufacturer,
    userFields: product.userFields,
    introductionStatus:
      product.introduction?.status ?? ProductIntroductionStatus.Tolerated,
  };
}

export function withUploadedImageUrl<
  T extends { identity: { imageUrls: string[] } },
>(value: T, imageUrl: string): T {
  return {
    ...value,
    identity: {
      ...value.identity,
      imageUrls: [imageUrl],
    },
  };
}

export function withIdentityImageUrl<T extends { imageUrls: string[] }>(
  value: T,
  imageUrl: string,
): T {
  return {
    ...value,
    imageUrls: [imageUrl],
  };
}
