import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import { ApiError } from '@/lib/api-error';
import {
  CatalogueSource,
  DataProvenance,
  LookupConfidence,
  LookupWarningCode,
  ProductCategory,
  type ResolvedLookup,
} from '@/types/shelf';

const mockUseExtractProductFromImages = jest.fn();
const mockToastError = jest.fn();
const mockCreateObjectURL = jest.fn();
const mockRevokeObjectURL = jest.fn();
let objectUrlSequence = 0;

jest.mock('@/hooks/use-shelf', () => ({
  useExtractProductFromImages: () => mockUseExtractProductFromImages(),
}));

jest.mock('sonner', () => ({
  toast: {
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

import { PhotosTab } from '@/components/shelf/add-product/photos-tab';

const RESOLVED_RESULT: ResolvedLookup = {
  identity: {
    brand: 'CeraVe',
    name: 'Resurfacing Retinol Serum',
    category: ProductCategory.Serum,
    imageUrls: ['http://localhost:3001/media/catalogue-front-photos/front.jpg'],
  },
  guidance: {},
  manufacturer: {
    brand: 'CeraVe',
  },
  provenance: DataProvenance.PhotoLookup,
  source: CatalogueSource.UserPhotos,
  confidence: LookupConfidence.Medium,
  reviewRequired: true,
  warnings: [LookupWarningCode.ReviewRequired, LookupWarningCode.PartialData],
  evidence: [],
};

function getProductInput(container: HTMLElement): HTMLInputElement {
  const input = container.querySelector(
    'input[type="file"][aria-label="Add product photo"]',
  );
  expect(input).toBeInstanceOf(HTMLInputElement);
  return input as HTMLInputElement;
}

function getLabelInput(container: HTMLElement): HTMLInputElement {
  const input = container.querySelector(
    'input[type="file"][aria-label="Add label photo"]',
  );
  expect(input).toBeInstanceOf(HTMLInputElement);
  return input as HTMLInputElement;
}

beforeEach(() => {
  mockUseExtractProductFromImages.mockReset();
  mockToastError.mockReset();
  mockCreateObjectURL.mockClear();
  mockCreateObjectURL.mockImplementation(() => {
    objectUrlSequence += 1;
    return `blob:preview-${objectUrlSequence}`;
  });
  mockRevokeObjectURL.mockClear();
  objectUrlSequence = 0;
  mockUseExtractProductFromImages.mockReturnValue({
    mutate: jest.fn(),
    isPending: false,
  });
});

beforeAll(() => {
  Object.defineProperty(URL, 'createObjectURL', {
    writable: true,
    value: mockCreateObjectURL,
  });
  Object.defineProperty(URL, 'revokeObjectURL', {
    writable: true,
    value: mockRevokeObjectURL,
  });
});

describe('PhotosTab', () => {
  it('keeps photo lookup disabled when the capability is unavailable', async () => {
    const user = userEvent.setup();
    const mutate = jest.fn();
    mockUseExtractProductFromImages.mockReturnValue({
      mutate,
      isPending: false,
    });

    const { container } = renderWithProviders(
      <PhotosTab disabled onResolved={jest.fn()} />,
    );

    expect(getProductInput(container)).toBeDisabled();
    expect(getLabelInput(container)).toBeDisabled();
    expect(
      screen.queryByText(/temporarily unavailable/i),
    ).not.toBeInTheDocument();
    await user.click(
      screen.getByRole('button', { name: /extract from photos/i }),
    );

    expect(mutate).not.toHaveBeenCalled();
  });

  it('keeps extract disabled until a product photo and at least one label photo are present', async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(
      <PhotosTab onResolved={jest.fn()} />,
    );

    expect(
      screen.getByText(/add a product photo and at least one label photo/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /extract from photos/i }),
    ).toBeDisabled();

    await user.upload(
      getProductInput(container),
      new File(['product'], 'product.jpg', { type: 'image/jpeg' }),
    );

    expect(
      screen.getByRole('button', { name: /extract from photos/i }),
    ).toBeDisabled();

    await user.upload(
      getLabelInput(container),
      new File(['label'], 'label.jpg', { type: 'image/jpeg' }),
    );

    expect(
      screen.getByRole('button', { name: /extract from photos/i }),
    ).toBeEnabled();
    expect(getLabelInput(container)).toHaveProperty('multiple', true);
  });

  it('supports uploading multiple label photos at once and sends the product photo first', async () => {
    const user = userEvent.setup();
    const onResolved = jest.fn();
    const productImage = new File(['product'], 'product.jpg', {
      type: 'image/jpeg',
    });
    const ingredientImage = new File(['ingredients'], 'ingredients.jpg', {
      type: 'image/jpeg',
    });
    const directionsImage = new File(['directions'], 'directions.jpg', {
      type: 'image/jpeg',
    });
    const mutate = jest.fn(
      (
        input: { images: File[]; heroImageIndex: number },
        options?: { onSuccess?: (value: ResolvedLookup | null) => void },
      ) => {
        expect(input.images).toEqual([
          productImage,
          ingredientImage,
          directionsImage,
        ]);
        expect(input.heroImageIndex).toBe(0);
        options?.onSuccess?.(RESOLVED_RESULT);
      },
    );

    mockUseExtractProductFromImages.mockReturnValue({
      mutate,
      isPending: false,
    });

    const { container } = renderWithProviders(
      <PhotosTab onResolved={onResolved} />,
    );

    await user.upload(getProductInput(container), productImage);
    await user.upload(getLabelInput(container), [
      ingredientImage,
      directionsImage,
    ]);
    await user.click(
      screen.getByRole('button', { name: /extract from photos/i }),
    );

    expect(mutate).toHaveBeenCalledWith(
      {
        images: [productImage, ingredientImage, directionsImage],
        heroImageIndex: 0,
      },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    );
    expect(onResolved).toHaveBeenCalledWith(RESOLVED_RESULT);
    expect(
      screen.getByText(/some fields still need review/i),
    ).toBeInTheDocument();
  });

  it('caps batch label uploads at five label photos', async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(
      <PhotosTab onResolved={jest.fn()} />,
    );
    const productImage = new File(['product'], 'product.jpg', {
      type: 'image/jpeg',
    });
    const labelImages = Array.from(
      { length: 6 },
      (_, index) =>
        new File([`label-${index}`], `label-${index}.jpg`, {
          type: 'image/jpeg',
        }),
    );

    await user.upload(getProductInput(container), productImage);
    await user.upload(getLabelInput(container), labelImages);

    expect(container.querySelectorAll('img')).toHaveLength(6);
    expect(
      screen.queryByRole('button', { name: /add label photo/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/you're at the 6-photo limit/i),
    ).toBeInTheDocument();
  });

  it('prevents adding more than six photos total', async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(
      <PhotosTab onResolved={jest.fn()} />,
    );

    await user.upload(
      getProductInput(container),
      new File(['product'], 'product.jpg', { type: 'image/jpeg' }),
    );

    for (let index = 0; index < 5; index += 1) {
      await user.upload(
        getLabelInput(container),
        new File([`label-${index}`], `label-${index}.jpg`, {
          type: 'image/jpeg',
        }),
      );
    }

    expect(container.querySelectorAll('img')).toHaveLength(6);
    expect(
      screen.queryByRole('button', { name: /add label photo/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/you're at the 6-photo limit/i),
    ).toBeInTheDocument();
  });

  it('revokes preview URLs when photos are replaced, removed, or unmounted', async () => {
    const user = userEvent.setup();
    const { container, unmount } = renderWithProviders(
      <PhotosTab onResolved={jest.fn()} />,
    );

    await user.upload(
      getProductInput(container),
      new File(['product-a'], 'product-a.jpg', { type: 'image/jpeg' }),
    );
    await user.upload(
      getProductInput(container),
      new File(['product-b'], 'product-b.jpg', { type: 'image/jpeg' }),
    );
    await user.upload(
      getLabelInput(container),
      new File(['label'], 'label.jpg', { type: 'image/jpeg' }),
    );

    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:preview-1');

    await user.click(screen.getAllByRole('button', { name: /^remove$/i })[1]);
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:preview-3');

    unmount();
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:preview-2');
  });

  it('shows a toast when extraction fails on content', async () => {
    const user = userEvent.setup();
    const mutate = jest.fn(
      (
        _input: { images: File[]; heroImageIndex: number },
        options?: { onError?: (error: unknown) => void },
      ) => {
        options?.onError?.(new ApiError('Unprocessable', { status: 422 }));
      },
    );

    mockUseExtractProductFromImages.mockReturnValue({
      mutate,
      isPending: false,
    });

    const { container } = renderWithProviders(
      <PhotosTab onResolved={jest.fn()} />,
    );

    await user.upload(
      getProductInput(container),
      new File(['product'], 'product.jpg', { type: 'image/jpeg' }),
    );
    await user.upload(
      getLabelInput(container),
      new File(['label'], 'label.jpg', { type: 'image/jpeg' }),
    );
    await user.click(
      screen.getByRole('button', { name: /extract from photos/i }),
    );

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        expect.stringMatching(/couldn't read those photos/i),
        expect.objectContaining({
          description: expect.stringMatching(
            /try clearer product and label photos/i,
          ),
        }),
      );
    });
  });

  it('shows a service-unavailable toast when extraction fails on network', async () => {
    const user = userEvent.setup();
    const mutate = jest.fn(
      (
        _input: { images: File[]; heroImageIndex: number },
        options?: { onError?: (error: unknown) => void },
      ) => {
        options?.onError?.(new Error('network timeout'));
      },
    );

    mockUseExtractProductFromImages.mockReturnValue({
      mutate,
      isPending: false,
    });

    const { container } = renderWithProviders(
      <PhotosTab onResolved={jest.fn()} />,
    );

    await user.upload(
      getProductInput(container),
      new File(['product'], 'product.jpg', { type: 'image/jpeg' }),
    );
    await user.upload(
      getLabelInput(container),
      new File(['label'], 'label.jpg', { type: 'image/jpeg' }),
    );
    await user.click(
      screen.getByRole('button', { name: /extract from photos/i }),
    );

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        expect.stringMatching(/couldn't reach the photo reader/i),
        expect.objectContaining({
          description: expect.stringMatching(/check your connection/i),
        }),
      );
    });
  });

  it('ignores extraction callbacks after unmount', async () => {
    const user = userEvent.setup();
    const onResolved = jest.fn();
    let resolveExtraction: ((value: ResolvedLookup) => void) | null = null;
    const mutate = jest.fn(
      (
        _input: { images: File[]; heroImageIndex: number },
        options?: { onSuccess?: (value: ResolvedLookup | null) => void },
      ) => {
        resolveExtraction = (value) => options?.onSuccess?.(value);
      },
    );

    mockUseExtractProductFromImages.mockReturnValue({
      mutate,
      isPending: false,
    });

    const { container, unmount } = renderWithProviders(
      <PhotosTab onResolved={onResolved} />,
    );

    await user.upload(
      getProductInput(container),
      new File(['product'], 'product.jpg', { type: 'image/jpeg' }),
    );
    await user.upload(
      getLabelInput(container),
      new File(['label'], 'label.jpg', { type: 'image/jpeg' }),
    );
    await user.click(
      screen.getByRole('button', { name: /extract from photos/i }),
    );

    unmount();

    await act(async () => {
      resolveExtraction?.(RESOLVED_RESULT);
      await Promise.resolve();
    });

    expect(onResolved).not.toHaveBeenCalled();
  });
});
