import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import { ShelfEmptyState } from '@/components/shelf/shelf-empty-state';

describe('ShelfEmptyState', () => {
  const user = userEvent.setup();

  it('renders the heading, description, and primary CTA', () => {
    renderWithProviders(<ShelfEmptyState onAddFirst={jest.fn()} />);

    expect(
      screen.getByRole('heading', { name: /your shelf is empty/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/ritora builds a calmer routine/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /add your first product/i }),
    ).toBeInTheDocument();
  });

  it('fires onAddFirst when the CTA is clicked', async () => {
    const onAddFirst = jest.fn();
    renderWithProviders(<ShelfEmptyState onAddFirst={onAddFirst} />);

    await user.click(
      screen.getByRole('button', { name: /add your first product/i }),
    );

    expect(onAddFirst).toHaveBeenCalledTimes(1);
  });
});
