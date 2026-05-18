import { existsSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';
import CheckProductLoading from '@/app/(app)/check-product/loading';
import NewProductLoading from '@/app/(app)/shelf/new/loading';

const APP_ROOT = join(process.cwd(), 'src/app/(app)');
const ALLOWED_ROUTE_LOADING_FILES = [
  'src/app/(app)/check-product/loading.tsx',
  'src/app/(app)/shelf/new/loading.tsx',
];

function collectRouteLoadingFiles(path: string): string[] {
  if (!existsSync(path)) {
    return [];
  }

  const stat = statSync(path);
  if (stat.isFile()) {
    return path.endsWith('/loading.tsx')
      ? [relative(process.cwd(), path)]
      : [];
  }

  return readdirSync(path).flatMap((entry) =>
    collectRouteLoadingFiles(join(path, entry)),
  );
}

describe('app route loading skeletons', () => {
  it('keeps route-level loading skeletons only for genuine route chunk loading', () => {
    expect(collectRouteLoadingFiles(APP_ROOT).sort()).toEqual(
      ALLOWED_ROUTE_LOADING_FILES,
    );
  });

  it('keeps the new product route loading skeleton because create has no initial query loading state', () => {
    const { container } = renderWithProviders(<NewProductLoading />);

    expect(screen.getByTestId('product-form-skeleton')).toHaveAttribute(
      'data-skeleton-mode',
      'create',
    );
    expect(screen.getByTestId('product-form-skeleton-lookup')).toBeInTheDocument();
    expect(screen.getByTestId('product-form-skeleton-identity')).toBeInTheDocument();
    expect(container.querySelector('.sticky.top-0')).toBeInTheDocument();
  });

  it('keeps the check product route loading skeleton for the split route shell', () => {
    const { container } = renderWithProviders(<CheckProductLoading />);

    expect(container.querySelector('.h-\\[36rem\\]')).toBeInTheDocument();
    expect(container.querySelector('.h-56')).toBeInTheDocument();
  });
});
