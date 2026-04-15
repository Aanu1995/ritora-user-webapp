import { render, screen } from '@testing-library/react';
import { AppRoute } from '@/constants/app-routes';
import { useAuthStore } from '@/stores/auth-store';

const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

import { AuthGuard } from '@/components/auth/auth-guard';
import { GuestGuard } from '@/components/auth/guest-guard';

afterEach(() => {
  jest.clearAllMocks();
  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });
});

describe('AuthGuard', () => {
  it('shows spinner while loading', () => {
    useAuthStore.setState({ isLoading: true });

    const { container } = render(
      <AuthGuard>
        <div>Protected</div>
      </AuthGuard>,
    );

    expect(screen.queryByText('Protected')).not.toBeInTheDocument();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('redirects to login when unauthenticated', () => {
    useAuthStore.setState({ isAuthenticated: false, isLoading: false });

    render(
      <AuthGuard>
        <div>Protected</div>
      </AuthGuard>,
    );

    expect(mockReplace).toHaveBeenCalledWith(AppRoute.Login);
    expect(screen.queryByText('Protected')).not.toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    useAuthStore.setState({ isAuthenticated: true, isLoading: false });

    render(
      <AuthGuard>
        <div>Protected</div>
      </AuthGuard>,
    );

    expect(screen.getByText('Protected')).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});

describe('GuestGuard', () => {
  it('shows spinner while loading', () => {
    useAuthStore.setState({ isLoading: true });

    const { container } = render(
      <GuestGuard>
        <div>Guest Content</div>
      </GuestGuard>,
    );

    expect(screen.queryByText('Guest Content')).not.toBeInTheDocument();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('redirects to dashboard when authenticated', () => {
    useAuthStore.setState({ isAuthenticated: true, isLoading: false });

    render(
      <GuestGuard>
        <div>Guest Content</div>
      </GuestGuard>,
    );

    expect(mockReplace).toHaveBeenCalledWith(AppRoute.Dashboard);
    expect(screen.queryByText('Guest Content')).not.toBeInTheDocument();
  });

  it('renders children when unauthenticated', () => {
    useAuthStore.setState({ isAuthenticated: false, isLoading: false });

    render(
      <GuestGuard>
        <div>Guest Content</div>
      </GuestGuard>,
    );

    expect(screen.getByText('Guest Content')).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
