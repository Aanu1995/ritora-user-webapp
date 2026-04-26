import { waitFor } from '@testing-library/react';
import { AppRoute } from '@/constants/app-routes';
import { resolvePostLoginRoute } from '@/lib/post-login-route';
import { renderWithProviders } from '@/test/utils';

const mockReplace = jest.fn();

jest.mock('@/lib/post-login-route', () => ({
  resolvePostLoginRoute: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

import PostLoginPage from '@/app/(app)/post-login/page';

describe('PostLoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (resolvePostLoginRoute as jest.Mock).mockResolvedValue(AppRoute.Dashboard);
  });

  it('shows a loading state while resolving the next route', () => {
    const { container } = renderWithProviders(<PostLoginPage />);

    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });

  it('redirects to the resolved authenticated route', async () => {
    renderWithProviders(<PostLoginPage />);

    await waitFor(() => {
      expect(resolvePostLoginRoute).toHaveBeenCalledTimes(1);
      expect(mockReplace).toHaveBeenCalledWith(AppRoute.Dashboard);
    });
  });

  it('does not navigate after unmount while resolution is still pending', async () => {
    let resolveRoute: ((route: AppRoute) => void) | undefined;
    (resolvePostLoginRoute as jest.Mock).mockReturnValue(
      new Promise<AppRoute>((resolve) => {
        resolveRoute = resolve;
      }),
    );

    const renderedPage = renderWithProviders(<PostLoginPage />);
    renderedPage.unmount();

    resolveRoute?.(AppRoute.Dashboard);

    await waitFor(() => {
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });
});
