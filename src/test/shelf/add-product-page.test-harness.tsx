import { screen } from "@testing-library/react";
import { UnsavedChangesDialog } from "@/components/app/unsaved-changes-dialog";
import { useUnsavedChangesStore } from "@/stores/unsaved-changes-store";
import { renderWithProviders } from "@/test/utils";
import {
  CatalogueSource,
  DataProvenance,
  LookupConfidence,
  type ResolvedLookup,
} from "@/types/shelf";

export const mockPush = jest.fn();
export const mockReplace = jest.fn();
export const mockBack = jest.fn();
export const mockMutate = jest.fn();
export const mockCreateWithImageMutate = jest.fn();
export const mockExtractFromImagesMutate = jest.fn();
export const mockToastSuccess = jest.fn();
export const mockToastError = jest.fn();

let mockLookupResolve:
  | ((onResult: (value: ResolvedLookup) => void) => void)
  | null = null;
let mockLookupProductPhotoFile: File | null = null;
let mockSearchParams = new URLSearchParams("returnTo=/shelf");

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
    prefetch: jest.fn(),
  }),
  usePathname: () => "/shelf/new",
  useSearchParams: () => mockSearchParams,
}));

jest.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

jest.mock("@/hooks/use-shelf", () => ({
  useCreateProduct: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
  useCreateProductWithImage: () => ({
    mutate: mockCreateWithImageMutate,
    isPending: false,
  }),
  useExtractProductFromImages: () => ({
    mutate: mockExtractFromImagesMutate,
    isPending: false,
  }),
}));

jest.mock("@/components/shelf/add-product/quick-lookup-card", () => ({
  QuickLookupCard: ({
    onProductPhotoChange,
    onResult,
  }: {
    onProductPhotoChange?: (file: File | null) => void;
    onResult: (value: ResolvedLookup) => void;
  }) => (
    <button
      type="button"
      onClick={() => {
        onProductPhotoChange?.(mockLookupProductPhotoFile);
        mockLookupResolve?.(onResult);
      }}
    >
      import lookup
    </button>
  ),
}));

jest.mock("@/components/ui/date-picker", () => ({
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

import { AddProductPage } from "@/components/shelf/add-product-page";

export function resetAddProductPageMocks(): void {
  mockPush.mockReset();
  mockReplace.mockReset();
  mockBack.mockReset();
  mockMutate.mockReset();
  mockCreateWithImageMutate.mockReset();
  mockExtractFromImagesMutate.mockReset();
  mockToastSuccess.mockReset();
  mockToastError.mockReset();
  mockLookupResolve = null;
  mockLookupProductPhotoFile = null;
  mockSearchParams = new URLSearchParams("returnTo=/shelf");
  useUnsavedChangesStore.setState({
    hasUnsavedChanges: false,
    isDialogOpen: false,
    pendingProceed: null,
  });
}

export function setAddProductSearchParams(params: URLSearchParams): void {
  mockSearchParams = params;
}

export function setMockLookupProductPhotoFile(file: File | null): void {
  mockLookupProductPhotoFile = file;
}

export function setMockLookupResolve(
  resolver: (onResult: (value: ResolvedLookup) => void) => void,
): void {
  mockLookupResolve = resolver;
}

export function setSuccessfulPhotoExtraction(
  overrides: Partial<ResolvedLookup> = {},
): void {
  setMockLookupResolve((onResult) => {
    onResult({
      identity: {},
      guidance: {},
      manufacturer: {},
      provenance: DataProvenance.PhotoLookup,
      source: CatalogueSource.UserPhotos,
      confidence: LookupConfidence.High,
      reviewRequired: false,
      warnings: [],
      evidence: [],
      ...overrides,
    });
  });
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
    .getAllByLabelText(new RegExp(`step ${index}`, "i"))
    .find((element) => element.tagName === "INPUT") as HTMLInputElement;
}
