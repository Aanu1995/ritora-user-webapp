import { existsSync } from 'fs';
import { join } from 'path';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';
import NewProductLoading from '@/app/(app)/shelf/new/loading';

describe('Shelf route loading states', () => {
  it('does not keep duplicate route loading skeletons for shelf pages with query-level skeletons', () => {
    expect(
      existsSync(join(process.cwd(), 'src/app/(app)/shelf/loading.tsx')),
    ).toBe(false);
    expect(
      existsSync(join(process.cwd(), 'src/app/(app)/shelf/[productId]/loading.tsx')),
    ).toBe(false);
    expect(
      existsSync(
        join(process.cwd(), 'src/app/(app)/shelf/[productId]/edit/loading.tsx'),
      ),
    ).toBe(false);
  });

  it('keeps the new product form route loading skeleton', () => {
    const { container } = renderWithProviders(<NewProductLoading />);

    expect(screen.getByTestId('product-form-skeleton')).toHaveAttribute(
      'data-skeleton-mode',
      'create',
    );
    expect(screen.getByTestId('product-form-skeleton-lookup')).toBeInTheDocument();
    expect(screen.getByTestId('product-form-skeleton-identity')).toBeInTheDocument();
    expect(container.querySelector('.sticky.top-0')).toBeInTheDocument();
  });
});
