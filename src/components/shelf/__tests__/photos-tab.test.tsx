import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
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
const mockCreateObjectURL = jest.fn(() => 'blob:preview');
const mockRevokeObjectURL = jest.fn();

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

function getFileInput(container: HTMLElement): HTMLInputElement {
  const input = container.querySelector('input[type="file"]');
  expect(input).toBeInstanceOf(HTMLInputElement);
  return input as HTMLInputElement;
}

beforeEach(() => {
  mockUseExtractProductFromImages.mockReset();
  mockToastError.mockReset();
  mockCreateObjectURL.mockClear();
  mockRevokeObjectURL.mockClear();
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
  it('requires at least two photos before extraction starts', async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(
      <PhotosTab onResolved={jest.fn()} />,
    );
    const input = getFileInput(container);

    expect(
      screen.getByText(
        /add at least 2 photos and choose which one should be saved with the product/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /extract from photos/i }),
    ).toBeDisabled();

    await user.upload(
      input,
      new File(['product'], 'product.jpg', { type: 'image/jpeg' }),
    );

    expect(
      screen.getByRole('button', { name: /extract from photos/i }),
    ).toBeDisabled();

    await user.upload(
      input,
      new File(['label'], 'label.jpg', { type: 'image/jpeg' }),
    );

    expect(
      screen.getByRole('button', { name: /extract from photos/i }),
    ).toBeEnabled();
  });

  it('uploads ordered images with a selected hero image and forwards the extracted result', async () => {
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
        expect(input.heroImageIndex).toBe(2);
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
    const input = getFileInput(container);

    await user.upload(input, productImage);
    await user.upload(input, ingredientImage);
    await user.upload(input, directionsImage);
    await user.click(
      screen.getAllByRole('button', { name: /use as product image/i })[1],
    );
    await user.click(screen.getByRole('button', { name: /extract from photos/i }));

    expect(mutate).toHaveBeenCalledWith(
      {
        images: [productImage, ingredientImage, directionsImage],
        heroImageIndex: 2,
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

  it('prevents adding more than six photos', async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(
      <PhotosTab onResolved={jest.fn()} />,
    );
    const input = getFileInput(container);

    for (let index = 0; index < 6; index += 1) {
      await user.upload(
        input,
        new File([`photo-${index}`], `photo-${index}.jpg`, {
          type: 'image/jpeg',
        }),
      );
    }

    expect(
      screen.getByRole('button', { name: /max 6 photos/i }),
    ).toBeDisabled();

    await user.upload(
      input,
      new File(['overflow'], 'overflow.jpg', { type: 'image/jpeg' }),
    );

    expect(container.querySelectorAll('img')).toHaveLength(6);
  });

  it('shows a toast when extraction fails', async () => {
    const user = userEvent.setup();
    const mutate = jest.fn(
      (
        _input: { images: File[]; heroImageIndex: number },
        options?: { onError?: (error: unknown) => void },
      ) => {
        options?.onError?.(new Error('timeout'));
      },
    );

    mockUseExtractProductFromImages.mockReturnValue({
      mutate,
      isPending: false,
    });

    const { container } = renderWithProviders(
      <PhotosTab onResolved={jest.fn()} />,
    );
    const input = getFileInput(container);

    await user.upload(
      input,
      new File(['product'], 'product.jpg', { type: 'image/jpeg' }),
    );
    await user.upload(
      input,
      new File(['label'], 'label.jpg', { type: 'image/jpeg' }),
    );
    await user.click(screen.getByRole('button', { name: /extract from photos/i }));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        expect.stringMatching(/we couldn't read these photos/i),
        expect.objectContaining({
          description: expect.stringMatching(
            /add clearer or more complete label photos/i,
          ),
        }),
      );
    });
  });
});
