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

import { AddProductPage } from '@/components/shelf/add-product-page';

beforeEach(() => {
  mockPush.mockReset();
  mockMutate.mockReset();
});

describe('AddProductPage', () => {
  it('shows a validation error when required fields are missing', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddProductPage />);

    await user.click(screen.getByRole('button', { name: /add to shelf/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/brand is required/i);
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
    fireEvent.change(screen.getByLabelText(/^product url$/i), {
      target: { value: 'https://example.com/product' },
    });

    await user.click(screen.getByRole('button', { name: /add to shelf/i }));

    expect(
      screen.getByRole('alert'),
    ).toHaveTextContent(/could not save this product/i);
  });
});
