import { screen } from '@testing-library/react';
import { UnsavedChangesDialog } from '@/components/app/unsaved-changes-dialog';
import { useUnsavedChangesStore } from '@/stores/unsaved-changes-store';
import { renderWithProviders } from '@/test/utils';

export const mockPush = jest.fn();
export const mockMutate = jest.fn();
export const mockExtractFromImagesMutate = jest.fn();
export const mockToastSuccess = jest.fn();
export const mockToastError = jest.fn();

let mockLookupResolve: ((onResult: (value: unknown) => void) => void) | null =
  null;

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/shelf/new',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

jest.mock('@/hooks/use-shelf', () => ({
  useCreateProduct: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
  useExtractProductFromImages: () => ({
    mutate: mockExtractFromImagesMutate,
    isPending: false,
  }),
}));

jest.mock('@/components/shelf/add-product/quick-lookup-card', () => ({
  QuickLookupCard: ({ onResult }: { onResult: (value: unknown) => void }) => (
    <button type="button" onClick={() => mockLookupResolve?.(onResult)}>
      import lookup
    </button>
  ),
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

import { AddProductPage } from '@/components/shelf/add-product-page';

export function resetAddProductPageMocks(): void {
  mockPush.mockReset();
  mockMutate.mockReset();
  mockExtractFromImagesMutate.mockReset();
  mockToastSuccess.mockReset();
  mockToastError.mockReset();
  mockLookupResolve = null;
  useUnsavedChangesStore.setState({
    hasUnsavedChanges: false,
    isDialogOpen: false,
    pendingProceed: null,
  });
}

export function setMockLookupResolve(
  resolver: (onResult: (value: unknown) => void) => void,
): void {
  mockLookupResolve = resolver;
}

export function renderAddProductPage(options?: {
  withUnsavedDialog?: boolean;
}): void {
  renderWithProviders(
    options?.withUnsavedDialog ? (
      <>
        <AddProductPage />
        <UnsavedChangesDialog />
      </>
    ) : (
      <AddProductPage />
    ),
  );
}

export function getStepInput(index: number) {
  return screen
    .getAllByLabelText(new RegExp(`step ${index}`, 'i'))
    .find((element) => element.tagName === 'INPUT') as HTMLInputElement;
}
