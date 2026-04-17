import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';

const mockPush = jest.fn();
const mockMutate = jest.fn();

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

jest.mock('@/hooks/use-shelf', () => ({
  useCreateProduct: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
  useResolveUrl: () => ({ mutate: jest.fn(), isPending: false }),
  useSearchCatalogue: () => ({ data: [], isFetching: false }),
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

function getStepInput(index: number) {
  return screen
    .getAllByLabelText(new RegExp(`step ${index}`, 'i'))
    .find((element) => element.tagName === 'INPUT') as HTMLInputElement;
}

beforeEach(() => {
  mockPush.mockReset();
  mockMutate.mockReset();
});

describe('AddProductPage', () => {
  it('shows a validation error when required fields are missing', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddProductPage />);

    await user.click(screen.getByRole('button', { name: /add to shelf/i }));

    expect(screen.getByText(/brand is required/i)).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('requires core shelf details before adding a product', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddProductPage />);

    await user.type(screen.getByLabelText(/^brand$/i), 'CeraVe');
    await user.type(screen.getByLabelText(/^product name$/i), 'Barrier Serum');

    await user.click(screen.getByRole('button', { name: /add to shelf/i }));

    expect(screen.getByText(/size is required/i)).toBeInTheDocument();
    expect(
      screen.getByText(/add either an opened date or an expiry date/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/add at least one step so ritora can explain how to use this product/i),
    ).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('requires the about fields before adding a product', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddProductPage />);

    await user.type(screen.getByLabelText(/^brand$/i), 'CeraVe');
    await user.type(screen.getByLabelText(/^product name$/i), 'Barrier Serum');
    await user.type(screen.getByLabelText(/^size$/i), '30');
    await user.click(screen.getByRole('button', { name: /add step/i }));
    await user.type(getStepInput(1), 'Pat onto clean skin.');
    await user.type(screen.getByLabelText(/^opened on$/i), '2026-04-15');

    await user.click(screen.getByRole('button', { name: /add to shelf/i }));

    expect(screen.getByText(/description is required/i)).toBeInTheDocument();
    expect(
      screen.getByText(/add at least one product benefit/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/add at least one skin type this product suits/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/paste the inci ingredients list/i),
    ).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('shows inline validation feedback for invalid structured fields', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddProductPage />);

    await user.type(screen.getByLabelText(/^brand$/i), 'CeraVe');
    await user.type(screen.getByLabelText(/^product name$/i), 'Barrier Serum');
    await user.type(screen.getByLabelText(/^support$/i), 'not-an-email');

    await user.click(screen.getByRole('button', { name: /add to shelf/i }));

    expect(screen.getByText(/support email must be a valid email address/i)).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('shows validation feedback when a how-to-use step is too long', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddProductPage />);

    await user.type(screen.getByLabelText(/^brand$/i), 'CeraVe');
    await user.type(screen.getByLabelText(/^product name$/i), 'Barrier Serum');
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
      screen.getByText(/keep each step short/i),
    ).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('creates a product and redirects to the detail page', async () => {
    const user = userEvent.setup();
    mockMutate.mockImplementation((_draft, options) => {
      options?.onSuccess?.({ id: 'product-123' });
    });

    renderWithProviders(<AddProductPage />);

    await user.type(screen.getByLabelText(/^brand$/i), 'CeraVe');
    await user.type(screen.getByLabelText(/^product name$/i), 'Barrier Serum');
    await user.type(
      screen.getByLabelText(/^description$/i),
      'A calming serum that supports smoother texture overnight.',
    );
    await user.type(screen.getByLabelText(/^benefits$/i), 'calming, smoothing');
    await user.type(screen.getByLabelText(/^suited for$/i), 'dry, sensitive');
    await user.type(
      screen.getByLabelText(/^ingredients \(inci\)$/i),
      'Aqua, Glycerin, Niacinamide',
    );
    await user.type(screen.getByLabelText(/^size$/i), '30');
    await user.click(screen.getByRole('button', { name: /add step/i }));
    await user.type(getStepInput(1), 'Pat onto clean skin.');
    await user.type(screen.getByLabelText(/^opened on$/i), '2026-04-15');

    await user.click(screen.getByRole('button', { name: /add to shelf/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/shelf/product-123');
    });
  });

  it('shows a server error when create fails', async () => {
    const user = userEvent.setup();
    mockMutate.mockImplementation((_draft, options) => {
      options?.onError?.(new Error('boom'));
    });

    renderWithProviders(<AddProductPage />);

    await user.type(screen.getByLabelText(/^brand$/i), 'CeraVe');
    await user.type(screen.getByLabelText(/^product name$/i), 'Barrier Serum');
    await user.type(
      screen.getByLabelText(/^description$/i),
      'A calming serum that supports smoother texture overnight.',
    );
    await user.type(screen.getByLabelText(/^benefits$/i), 'calming, smoothing');
    await user.type(screen.getByLabelText(/^suited for$/i), 'dry, sensitive');
    await user.type(
      screen.getByLabelText(/^ingredients \(inci\)$/i),
      'Aqua, Glycerin, Niacinamide',
    );
    await user.type(screen.getByLabelText(/^size$/i), '30');
    await user.click(screen.getByRole('button', { name: /add step/i }));
    await user.type(getStepInput(1), 'Pat onto clean skin.');
    await user.type(screen.getByLabelText(/^opened on$/i), '2026-04-15');
    fireEvent.change(screen.getByLabelText(/^product url$/i), {
      target: { value: 'https://example.com/product' },
    });

    await user.click(screen.getByRole('button', { name: /add to shelf/i }));

    expect(
      screen.getByRole('alert'),
    ).toHaveTextContent(/could not save this product/i);
  });
});
