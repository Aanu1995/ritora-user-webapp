import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';

const mockMutate = jest.fn();

jest.mock('@/hooks/use-shelf', () => ({
  useResolveUrl: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
}));

import { UrlTab } from '@/components/shelf/add-product/url-tab';

beforeEach(() => {
  mockMutate.mockReset();
});

describe('UrlTab', () => {
  it('blocks invalid URLs before resolving', async () => {
    const user = userEvent.setup();
    renderWithProviders(<UrlTab onResolved={jest.fn()} />);

    await user.type(
      screen.getByRole('textbox', {
        name: /paste the product url from the brand's website/i,
      }),
      'notaurl',
    );
    await user.click(screen.getByRole('button', { name: /use this link/i }));

    expect(mockMutate).not.toHaveBeenCalled();
    expect(screen.getByText(/starts with http/i)).toBeInTheDocument();
  });

  it('passes the resolved product back to the caller', async () => {
    const user = userEvent.setup();
    const onResolved = jest.fn();
    mockMutate.mockImplementation((_url, options) => {
      options?.onSuccess?.({
        identity: { brand: 'CeraVe', name: 'Retinol Serum' },
        manufacturer: { productUrl: 'https://example.com/product' },
      });
    });

    renderWithProviders(<UrlTab onResolved={onResolved} />);

    await user.type(
      screen.getByRole('textbox', {
        name: /paste the product url from the brand's website/i,
      }),
      'https://example.com/product',
    );
    await user.click(screen.getByRole('button', { name: /use this link/i }));

    await waitFor(() => {
      expect(onResolved).toHaveBeenCalledWith(
        expect.objectContaining({
          identity: expect.objectContaining({ brand: 'CeraVe' }),
        }),
      );
    });
  });
});
