import { screen } from '@testing-library/react';
import { UnsavedChangesDialog } from '@/components/app/unsaved-changes-dialog';
import { useUnsavedChangesStore } from '@/stores/unsaved-changes-store';
import { renderWithProviders } from '@/test/utils';
import {
  DataProvenance,
  ProductCategory,
  ShelfStatus,
  type ShelfProduct,
} from '@/types/shelf';

export const mockPush = jest.fn();
export const mockMutate = jest.fn();
export const mockUploadMutate = jest.fn();
export const mockUploadForProductMutate = jest.fn();
export const mockCreateObjectUrl = jest.fn(() => 'blob:product-photo-preview');
export const mockRevokeObjectUrl = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/shelf/product-1/edit',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/hooks/use-shelf', () => ({
  useUpdateProduct: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
  useUploadProductImage: () => ({
    mutate: mockUploadMutate,
    isPending: false,
  }),
  useUploadProductImageForProduct: () => ({
    mutate: mockUploadForProductMutate,
    isPending: false,
  }),
}));

jest.mock('@/components/ui/date-picker', () => ({
  DatePicker: ({
    value,
    onChange,
    ariaLabel,
  }: {
    value: string;
    onChange: (next: string) => void;
    ariaLabel?: string;
  }) => (
    <input
      type="date"
      aria-label={ariaLabel}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));

import { ProductEditForm } from '@/components/shelf/edit/product-edit-form';

export const PRODUCT: ShelfProduct = {
  id: 'product-1',
  identity: {
    brand: 'CeraVe',
    name: 'Retinol Serum',
    category: ProductCategory.Serum,
    barcode: null,
    imageUrls: [],
    sizeMl: 30,
    description: 'A calm nightly serum that smooths texture over time.',
    benefits: ['smoothing'],
    suitedFor: ['dry'],
    inciIngredients: ['Aqua', 'Niacinamide'],
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
  provenance: DataProvenance.PhotoLookup,
  createdAt: '2026-04-17T00:00:00.000Z',
  updatedAt: '2026-04-17T00:00:00.000Z',
};

export function resetProductEditFormMocks(): void {
  mockPush.mockReset();
  mockMutate.mockReset();
  mockUploadMutate.mockReset();
  mockUploadForProductMutate.mockReset();
  mockCreateObjectUrl.mockClear();
  mockRevokeObjectUrl.mockClear();
  URL.createObjectURL = mockCreateObjectUrl;
  URL.revokeObjectURL = mockRevokeObjectUrl;
  useUnsavedChangesStore.setState({
    hasUnsavedChanges: false,
    isDialogOpen: false,
    pendingProceed: null,
  });
}

export function renderProductEditForm(options?: {
  withUnsavedDialog?: boolean;
}): void {
  renderWithProviders(
    options?.withUnsavedDialog ? (
      <>
        <ProductEditForm product={PRODUCT} />
        <UnsavedChangesDialog />
      </>
    ) : (
      <ProductEditForm product={PRODUCT} />
    ),
  );
}

export function getStepInput(index: number) {
  return screen
    .getAllByLabelText(new RegExp(`step ${index}`, 'i'))
    .find((element) => element.tagName === 'INPUT') as HTMLInputElement;
}
