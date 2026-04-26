import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  getStepInput,
  mockCreateObjectUrl,
  mockMutate,
  mockPush,
  mockRevokeObjectUrl,
  mockUploadMutate,
  renderProductEditForm,
  resetProductEditFormMocks,
} from './product-edit-form.test-harness';
import { useUnsavedChangesStore } from '@/stores/unsaved-changes-store';

beforeEach(() => {
  resetProductEditFormMocks();
});

describe('ProductEditForm', () => {
  it('shows validation feedback instead of silently failing', async () => {
    const user = userEvent.setup();
    renderProductEditForm();

    await user.clear(screen.getByLabelText(/product name/i));
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

    await user.clear(screen.getByLabelText(/product url/i));
    await user.type(
      screen.getByLabelText(/product url/i),
      'ftp://example.com/product',
    );
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

    await user.clear(screen.getByLabelText(/^description$/i));
    await user.clear(screen.getByLabelText(/^benefits$/i));
    await user.clear(screen.getByLabelText(/^suited for$/i));
    await user.clear(screen.getByLabelText(/^ingredients \(inci\)$/i));
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

    await user.clear(screen.getByLabelText(/^ingredients \(inci\)$/i));
    await user.click(screen.getByRole('button', { name: /add step/i }));
    await user.type(getStepInput(1), 'Pat onto clean skin.');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
    });
    expect(
      mockMutate.mock.calls[0]?.[0].patch.identity.inciIngredients,
    ).toEqual([]);
  });

  it('lets the user choose a photo first and upload it before saving', async () => {
    const user = userEvent.setup();
    mockUploadMutate.mockImplementation((_file, options) => {
      options?.onSuccess?.({
        imageUrl: 'https://cdn.example.com/product-images/processed/photo.webp',
      });
    });
    mockMutate.mockImplementation((_input, options) => {
      options?.onSuccess?.();
    });

    renderProductEditForm();

    await user.upload(
      screen.getByLabelText(/choose product photo/i),
      new File(['photo'], 'product.jpg', { type: 'image/jpeg' }),
    );

    expect(
      screen.getByRole('button', { name: /upload photo/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /upload photo/i }));

    await waitFor(() => {
      expect(mockUploadMutate).toHaveBeenCalled();
    });

    await user.click(screen.getByRole('button', { name: /add step/i }));
    await user.type(getStepInput(1), 'Pat onto clean skin.');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
    });

    expect(mockMutate.mock.calls[0]?.[0].patch.identity.imageUrls).toEqual([
      'https://cdn.example.com/product-images/processed/photo.webp',
    ]);
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

  it('saves and redirects to the detail page', async () => {
    const user = userEvent.setup();
    mockMutate.mockImplementation((_input, options) => {
      options?.onSuccess?.();
    });

    renderProductEditForm();

    await user.clear(screen.getByLabelText(/product name/i));
    await user.type(screen.getByLabelText(/product name/i), 'Updated Serum');
    await user.click(screen.getByRole('button', { name: /add step/i }));
    await user.type(getStepInput(1), 'Pat onto clean skin.');
    await user.type(screen.getByLabelText(/^opened on$/i), '2026-04-15');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/shelf/product-1');
    });
  });

  it('saves an unopened product without requiring an opened date', async () => {
    const user = userEvent.setup();
    mockMutate.mockImplementation((_input, options) => {
      options?.onSuccess?.();
    });

    renderProductEditForm();

    await user.clear(screen.getByLabelText(/product name/i));
    await user.type(screen.getByLabelText(/product name/i), 'Updated Serum');
    await user.click(screen.getByRole('button', { name: /add step/i }));
    await user.type(getStepInput(1), 'Pat onto clean skin.');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/shelf/product-1');
    });

    expect(mockMutate.mock.calls[0]?.[0].patch.userFields.openedAt).toBeNull();
  });

  describe('unsaved changes guard', () => {
    it('opens the discard dialog when the back arrow is clicked with dirty state', async () => {
      const user = userEvent.setup();
      renderProductEditForm({ withUnsavedDialog: true });

      await user.clear(screen.getByLabelText(/product name/i));
      await user.type(screen.getByLabelText(/product name/i), 'Updated Serum');

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

      await user.clear(screen.getByLabelText(/product name/i));
      await user.type(screen.getByLabelText(/product name/i), 'Updated Serum');
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

      await user.clear(screen.getByLabelText(/product name/i));
      await user.type(screen.getByLabelText(/product name/i), 'Updated Serum');
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
