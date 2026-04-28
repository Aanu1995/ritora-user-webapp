export type ProductDetailTab =
  | 'about'
  | 'ingredients'
  | 'how-to-use'
  | 'manufacturer';

const PRODUCT_DETAIL_TAB_STORAGE_PREFIX = 'ritora:shelf:product-detail-tab:';

const PRODUCT_DETAIL_TABS = new Set<string>([
  'about',
  'ingredients',
  'how-to-use',
  'manufacturer',
]);

export function isProductDetailTab(value: string): value is ProductDetailTab {
  return PRODUCT_DETAIL_TABS.has(value);
}

export function readProductDetailTab(productId: string): ProductDetailTab {
  if (typeof window === 'undefined') {
    return 'about';
  }

  try {
    const value = window.sessionStorage.getItem(
      `${PRODUCT_DETAIL_TAB_STORAGE_PREFIX}${productId}`,
    );

    return value !== null && isProductDetailTab(value) ? value : 'about';
  } catch {
    return 'about';
  }
}

export function saveProductDetailTab(
  productId: string,
  tab: ProductDetailTab,
) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.setItem(
      `${PRODUCT_DETAIL_TAB_STORAGE_PREFIX}${productId}`,
      tab,
    );
  } catch {
    // Tab restoration is a progressive enhancement.
  }
}
