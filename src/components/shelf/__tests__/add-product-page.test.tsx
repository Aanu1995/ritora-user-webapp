import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  getStepInput,
  mockMutate,
  mockPush,
  mockReplace,
  renderAddProductPage,
  resetAddProductPageMocks,
  setAddProductSearchParams,
  setSuccessfulPhotoExtraction,
} from '@/test/shelf/add-product-page.test-harness';

function setInputValue(label: RegExp, value: string): void {
  fireEvent.change(screen.getByLabelText(label), {
    target: { value },
  });
}

beforeEach(() => {
  resetAddProductPageMocks();
});

describe('AddProductPage', () => {
  it('shows a validation error when required fields are missing', async () => {
    const user = userEvent.setup();
    renderAddProductPage();

    await user.click(screen.getByRole('button', { name: /add to shelf/i }));

    expect(screen.getByText(/brand is required/i)).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('requires core shelf details before adding a product', async () => {
    const user = userEvent.setup();
    renderAddProductPage();

    setInputValue(/^brand$/i, 'CeraVe');
    setInputValue(/^product name$/i, 'Barrier Serum');

    await user.click(screen.getByRole('button', { name: /add to shelf/i }));

    expect(screen.getByText(/size is required/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /add at least one step so ritora can explain how to use this product/i,
      ),
    ).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('does not show unrelated validation errors while the user is still typing', async () => {
    const user = userEvent.setup();
    renderAddProductPage();

    await user.type(screen.getByLabelText(/^brand$/i), 'C');

    expect(screen.queryByText(/size is required/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        /add at least one step so ritora can explain how to use this product/i,
      ),
    ).not.toBeInTheDocument();
  });

  it('requires the about fields before adding a product', async () => {
    const user = userEvent.setup();
    renderAddProductPage();

    fireEvent.change(screen.getByLabelText(/^brand$/i), {
      target: { value: 'CeraVe' },
    });
    fireEvent.change(screen.getByLabelText(/^product name$/i), {
      target: { value: 'Barrier Serum' },
    });
    fireEvent.change(screen.getByLabelText(/^size$/i), {
      target: { value: '30' },
    });
    await user.click(screen.getByRole('button', { name: /add step/i }));
    fireEvent.change(getStepInput(1), {
      target: { value: 'Pat onto clean skin.' },
    });
    fireEvent.change(screen.getByLabelText(/^opened on$/i), {
      target: { value: '2026-04-15' },
    });

    await user.click(screen.getByRole('button', { name: /add to shelf/i }));

    expect(screen.getByText(/description is required/i)).toBeInTheDocument();
    expect(
      screen.getByText(/add at least one product benefit/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/add at least one skin type this product suits/i),
    ).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('shows inline validation feedback for invalid structured fields', async () => {
    const user = userEvent.setup();
    renderAddProductPage();

    setInputValue(/^brand$/i, 'CeraVe');
    setInputValue(/^product name$/i, 'Barrier Serum');
    setInputValue(/^support$/i, 'not-an-email');

    await user.click(screen.getByRole('button', { name: /add to shelf/i }));

    expect(
      screen.getByText(/support email must be a valid email address/i),
    ).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('shows validation feedback when a how-to-use step is too long', async () => {
    const user = userEvent.setup();
    renderAddProductPage();

    setInputValue(/^brand$/i, 'CeraVe');
    setInputValue(/^product name$/i, 'Barrier Serum');
    await user.click(screen.getByRole('button', { name: /add step/i }));
    const stepInput = screen
      .getAllByLabelText(/step 1/i)
      .find((element) => element.tagName === 'INPUT');

    expect(stepInput).toBeDefined();

    fireEvent.change(stepInput as HTMLInputElement, {
      target: { value: 'a'.repeat(281) },
    });

    await user.click(screen.getByRole('button', { name: /add to shelf/i }));

    expect(
      screen.getByText(/keep each step under 280 characters/i),
    ).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('creates a product and returns to the source page', async () => {
    const user = userEvent.setup();
    mockMutate.mockImplementation((_draft, options) => {
      options?.onSuccess?.({ id: 'product-123' });
    });
    setAddProductSearchParams(new URLSearchParams('returnTo=/community'));
    setSuccessfulPhotoExtraction();

    renderAddProductPage();

    setInputValue(/^brand$/i, 'CeraVe');
    setInputValue(/^product name$/i, 'Barrier Serum');
    setInputValue(
      /^description$/i,
      'A calming serum that supports smoother texture overnight.',
    );
    setInputValue(/^benefits$/i, 'calming, smoothing');
    setInputValue(/^suited for$/i, 'dry, sensitive');
    setInputValue(/^ingredients \(inci\)$/i, 'Aqua, Glycerin, Niacinamide');
    setInputValue(/^size$/i, '30');
    await user.click(screen.getByRole('button', { name: /add step/i }));
    fireEvent.change(getStepInput(1), {
      target: { value: 'Pat onto clean skin.' },
    });
    setInputValue(/^opened on$/i, '2026-04-15');
    await user.click(screen.getByRole('button', { name: /import lookup/i }));

    await user.click(screen.getByRole('button', { name: /add to shelf/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith('/community');
    });
    expect(mockPush).not.toHaveBeenCalledWith('/shelf/product-123');
  });

  it('creates a product when the ingredient list is not available yet', async () => {
    const user = userEvent.setup();
    mockMutate.mockImplementation((_draft, options) => {
      options?.onSuccess?.({ id: 'product-123' });
    });
    setSuccessfulPhotoExtraction();

    renderAddProductPage();

    setInputValue(/^brand$/i, 'Eucerin');
    setInputValue(/^product name$/i, 'Oil Control SPF 50+');
    setInputValue(/^description$/i, 'A dry-touch sunscreen for oily skin.');
    setInputValue(/^benefits$/i, 'oil control');
    setInputValue(/^suited for$/i, 'oily');
    setInputValue(/^size$/i, '50');
    await user.click(screen.getByRole('button', { name: /add step/i }));
    fireEvent.change(getStepInput(1), {
      target: { value: 'Apply before sun exposure.' },
    });
    await user.click(screen.getByRole('button', { name: /import lookup/i }));

    await user.click(screen.getByRole('button', { name: /add to shelf/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith('/shelf');
    });
    expect(mockMutate.mock.calls[0]?.[0].identity.inciIngredients).toEqual([]);
  });

  it('creates an unopened product without an opened date', async () => {
    const user = userEvent.setup();
    mockMutate.mockImplementation((_draft, options) => {
      options?.onSuccess?.({ id: 'product-123' });
    });
    setSuccessfulPhotoExtraction();

    renderAddProductPage();

    setInputValue(/^brand$/i, 'CeraVe');
    setInputValue(/^product name$/i, 'Barrier Serum');
    setInputValue(
      /^description$/i,
      'A calming serum that supports smoother texture overnight.',
    );
    setInputValue(/^benefits$/i, 'calming, smoothing');
    setInputValue(/^suited for$/i, 'dry, sensitive');
    setInputValue(/^ingredients \(inci\)$/i, 'Aqua, Glycerin, Niacinamide');
    setInputValue(/^size$/i, '30');
    await user.click(screen.getByRole('button', { name: /add step/i }));
    fireEvent.change(getStepInput(1), {
      target: { value: 'Pat onto clean skin.' },
    });
    await user.click(screen.getByRole('button', { name: /import lookup/i }));

    await user.click(screen.getByRole('button', { name: /add to shelf/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith('/shelf');
    });

    expect(mockMutate.mock.calls[0]?.[0].userFields.openedAt).toBeNull();
  });

  it('keeps the add-product page at a single form', () => {
    renderAddProductPage();

    expect(document.querySelectorAll('form')).toHaveLength(1);
  });
});
