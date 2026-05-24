import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import {
  getStepInput,
  mockCreateObjectUrl,
  mockMutate,
  mockUploadForProductMutate,
  mockPush,
  mockReplace,
  mockRevokeObjectUrl,
  renderProductEditForm,
  resetProductEditFormMocks,
} from '@/test/shelf/product-edit-form.test-harness';
import { ApiError } from '@/lib/api-error';
import { useUnsavedChangesStore } from '@/stores/unsaved-changes-store';

function setInputValue(label: RegExp, value: string): void {
  fireEvent.change(screen.getByLabelText(label), {
    target: { value },
  });
}

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

beforeEach(() => {
  resetProductEditFormMocks();
  jest.clearAllMocks();
});

describe('ProductEditForm', () => {
  it('shows validation feedback instead of silently failing', async () => {
    const user = userEvent.setup();
    renderProductEditForm();

    setInputValue(/product name/i, '');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    expect(screen.getByText(/product name is required/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /add at least one step so ritora can explain how to use this product/i,
      ),
    ).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('shows inline validation for invalid product links', async () => {
    const user = userEvent.setup();
    renderProductEditForm();

    setInputValue(/product url/i, 'ftp://example.com/product');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    expect(
      screen.getByText(/product url must start with http:\/\/ or https:\/\//i),
    ).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('requires shelf-critical data before saving', async () => {
    const user = userEvent.setup();
    renderProductEditForm();

    await user.click(screen.getByRole('button', { name: /save changes/i }));

    expect(
      screen.getByText(
        /add at least one step so ritora can explain how to use this product/i,
      ),
    ).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('does not show unrelated validation errors while the user is still typing', async () => {
    const user = userEvent.setup();
    renderProductEditForm();

    await user.clear(screen.getByLabelText(/product name/i));
    await user.type(screen.getByLabelText(/product name/i), 'U');

    expect(
      screen.queryByText(
        /add at least one step so ritora can explain how to use this product/i,
      ),
    ).not.toBeInTheDocument();
  });

  it('requires the about fields before saving', async () => {
    const user = userEvent.setup();
    renderProductEditForm();

    setInputValue(/^description$/i, '');
    setInputValue(/^benefits$/i, '');
    setInputValue(/^suited for$/i, '');
    setInputValue(/^ingredients \(inci\)$/i, '');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    expect(screen.getByText(/description is required/i)).toBeInTheDocument();
    expect(
      screen.getByText(/add at least one product benefit/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/add at least one skin type this product suits/i),
    ).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('saves when ingredients are cleared because the list is optional', async () => {
    const user = userEvent.setup();
    mockMutate.mockImplementation((_input, options) => {
      options?.onSuccess?.();
    });

    renderProductEditForm();

    setInputValue(/^ingredients \(inci\)$/i, '');
    await user.click(screen.getByRole('button', { name: /add step/i }));
    fireEvent.change(getStepInput(1), {
      target: { value: 'Pat onto clean skin.' },
    });
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
    });
    expect(
      mockMutate.mock.calls[0]?.[0].patch.identity.inciIngredients,
    ).toEqual([]);
  });

  it('persists an uploaded photo immediately and clears the photo-only dirty state', async () => {
    const user = userEvent.setup();
    mockUploadForProductMutate.mockImplementation((_input, options) => {
      options?.onSuccess?.({
        identity: {
          imageUrls: [
            'https://cdn.example.com/product-images/processed/photo.webp',
          ],
        },
      });
    });
    mockMutate.mockImplementation((_input, options) => {
      options?.onSuccess?.();
    });

    renderProductEditForm({ withUnsavedDialog: true });

    await user.upload(
      screen.getByLabelText(/choose product photo/i),
      new File(['photo'], 'product.jpg', { type: 'image/jpeg' }),
    );

    expect(
      screen.getByRole('button', { name: /upload photo/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /upload photo/i }));

    await waitFor(() => {
      expect(mockUploadForProductMutate).toHaveBeenCalledWith(
        {
          id: 'product-1',
          file: expect.any(File),
        },
        expect.any(Object),
      );
      expect(mockMutate).not.toHaveBeenCalled();
      expect(useUnsavedChangesStore.getState().hasUnsavedChanges).toBe(false);
    });

    await user.click(screen.getByRole('button', { name: /add step/i }));
    fireEvent.change(getStepInput(1), {
      target: { value: 'Pat onto clean skin.' },
    });
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledTimes(1);
    });

    expect(mockMutate.mock.calls[0]?.[0].patch.identity.imageUrls).toEqual([
      'https://cdn.example.com/product-images/processed/photo.webp',
    ]);
  });

  it('keeps the unsaved warning after photo upload when other fields are dirty', async () => {
    const user = userEvent.setup();
    mockUploadForProductMutate.mockImplementation((_input, options) => {
      options?.onSuccess?.({
        identity: {
          imageUrls: [
            'https://cdn.example.com/product-images/processed/photo.webp',
          ],
        },
      });
    });
    mockMutate.mockImplementation((_input, options) => {
      options?.onSuccess?.();
    });

    renderProductEditForm({ withUnsavedDialog: true });

    setInputValue(/product name/i, 'Updated Serum');
    await user.upload(
      screen.getByLabelText(/choose product photo/i),
      new File(['photo'], 'product.jpg', { type: 'image/jpeg' }),
    );
    await user.click(screen.getByRole('button', { name: /upload photo/i }));

    await waitFor(() => {
      expect(mockUploadForProductMutate).toHaveBeenCalledWith(
        {
          id: 'product-1',
          file: expect.any(File),
        },
        expect.any(Object),
      );
      expect(useUnsavedChangesStore.getState().hasUnsavedChanges).toBe(true);
    });
  });

  it('shows the server upload reason when product photo upload fails', async () => {
    const user = userEvent.setup();
    mockUploadForProductMutate.mockImplementation((_input, options) => {
      options?.onError?.(
        new ApiError('Product image signing is not configured correctly', {
          status: 503,
          body: {
            message: 'Product image signing is not configured correctly',
          },
        }),
      );
    });

    renderProductEditForm();

    await user.upload(
      screen.getByLabelText(/choose product photo/i),
      new File(['photo'], 'product.jpg', { type: 'image/jpeg' }),
    );
    await user.click(screen.getByRole('button', { name: /upload photo/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Product image signing is not configured correctly',
      );
    });
  });

  it('treats a selected but not yet uploaded photo as an unsaved change', async () => {
    const user = userEvent.setup();

    renderProductEditForm({ withUnsavedDialog: true });

    await user.upload(
      screen.getByLabelText(/choose product photo/i),
      new File(['photo'], 'product.jpg', { type: 'image/jpeg' }),
    );

    await waitFor(() => {
      expect(useUnsavedChangesStore.getState().hasUnsavedChanges).toBe(true);
    });
  });

  it('creates preview object URLs only after selection and revokes them when cleared', async () => {
    const user = userEvent.setup();

    renderProductEditForm();

    expect(mockCreateObjectUrl).not.toHaveBeenCalled();

    await user.upload(
      screen.getByLabelText(/choose product photo/i),
      new File(['photo'], 'product.jpg', { type: 'image/jpeg' }),
    );

    expect(mockCreateObjectUrl).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: /^clear$/i }));

    expect(mockRevokeObjectUrl).toHaveBeenCalledWith(
      'blob:product-photo-preview',
    );
  });

  it('saves and returns to the source page', async () => {
    const user = userEvent.setup();
    const historyBack = jest
      .spyOn(window.history, 'back')
      .mockImplementation(() => undefined);
    mockMutate.mockImplementation((_input, options) => {
      options?.onSuccess?.();
    });

    renderProductEditForm({ withUnsavedDialog: true });

    setInputValue(/product name/i, 'Updated Serum');
    await waitFor(() => {
      expect(useUnsavedChangesStore.getState().hasUnsavedChanges).toBe(true);
    });
    await user.click(screen.getByRole('button', { name: /add step/i }));
    fireEvent.change(getStepInput(1), {
      target: { value: 'Pat onto clean skin.' },
    });
    setInputValue(/^opened on$/i, '2026-04-15');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalledWith('/shelf/product-1');
      expect(mockReplace).toHaveBeenCalledWith('/shelf/product-1');
    });
    expect(historyBack).not.toHaveBeenCalled();
    historyBack.mockRestore();
  });

  it('saves an unopened product without requiring an opened date', async () => {
    const user = userEvent.setup();
    mockMutate.mockImplementation((_input, options) => {
      options?.onSuccess?.();
    });

    renderProductEditForm();

    setInputValue(/product name/i, 'Updated Serum');
    await user.click(screen.getByRole('button', { name: /add step/i }));
    fireEvent.change(getStepInput(1), {
      target: { value: 'Pat onto clean skin.' },
    });
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalledWith('/shelf/product-1');
      expect(mockReplace).toHaveBeenCalledWith('/shelf/product-1');
    });

    expect(mockMutate.mock.calls[0]?.[0].patch.userFields.openedAt).toBeNull();
  });

  describe('unsaved changes guard', () => {
    it('opens the discard dialog when the back arrow is clicked with dirty state', async () => {
      const user = userEvent.setup();
      renderProductEditForm({ withUnsavedDialog: true });

      setInputValue(/product name/i, 'Updated Serum');

      await user.click(screen.getByLabelText(/back to shelf/i));

      expect(screen.getByText(/unsaved changes/i)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /keep editing/i }),
      ).toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('keeps the user on the form when "Keep editing" is clicked', async () => {
      const user = userEvent.setup();
      renderProductEditForm({ withUnsavedDialog: true });

      setInputValue(/product name/i, 'Updated Serum');
      await user.click(screen.getByLabelText(/back to shelf/i));
      await user.click(screen.getByRole('button', { name: /keep editing/i }));

      await waitFor(() => {
        expect(screen.queryByText(/unsaved changes/i)).not.toBeInTheDocument();
      });
      expect(mockPush).not.toHaveBeenCalled();
      expect(
        (screen.getByLabelText(/product name/i) as HTMLInputElement).value,
      ).toBe('Updated Serum');
    });

    it('navigates to the detail page when "Discard changes" is clicked', async () => {
      const user = userEvent.setup();
      renderProductEditForm({ withUnsavedDialog: true });

      setInputValue(/product name/i, 'Updated Serum');
      await user.click(screen.getByLabelText(/back to shelf/i));
      await user.click(
        screen.getByRole('button', { name: /discard changes/i }),
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/shelf/product-1');
      });
    });

    it('does not open the dialog when the back arrow is clicked with a clean form', async () => {
      const user = userEvent.setup();
      renderProductEditForm({ withUnsavedDialog: true });

      await user.click(screen.getByLabelText(/back to shelf/i));

      expect(screen.queryByText(/unsaved changes/i)).not.toBeInTheDocument();
    });
  });
});
