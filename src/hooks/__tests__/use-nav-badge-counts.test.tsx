import { waitFor } from '@testing-library/react';
import { AppRoute } from '@/constants/app-routes';
import {
  mapAppNavBadgesToNavRoutes,
  useNavBadgeCounts,
} from '@/hooks/use-nav-badge-counts';
import { getAppNavBadges } from '@/services/nav-badges.service';
import { useAuthStore } from '@/stores/auth-store';
import { renderHookWithProviders } from '@/test/utils';

jest.mock('@/services/nav-badges.service', () => ({
  getAppNavBadges: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });
});

describe('useNavBadgeCounts', () => {
  it('maps aggregate counts to their sidebar routes', () => {
    expect(
      mapAppNavBadgesToNavRoutes({
        notifications_unread_count: 2,
        skin_journal_warning_count: 1,
      }),
    ).toEqual({
      [AppRoute.Notifications]: 2,
      [AppRoute.Journal]: 1,
    });
  });

  it('stays empty until the user is authenticated', () => {
    const { result } = renderHookWithProviders(() => useNavBadgeCounts());

    expect(result.current).toEqual({});
    expect(getAppNavBadges).not.toHaveBeenCalled();
  });

  it('maps the lightweight aggregate badge payload to nav routes', async () => {
    useAuthStore.setState({ isAuthenticated: true });
    (getAppNavBadges as jest.Mock).mockResolvedValue({
      notifications_unread_count: 5,
      skin_journal_warning_count: 1,
    });

    const { result } = renderHookWithProviders(() => useNavBadgeCounts());

    await waitFor(() => {
      expect(result.current[AppRoute.Notifications]).toBe(5);
      expect(result.current[AppRoute.Journal]).toBe(1);
    });
    expect(getAppNavBadges).toHaveBeenCalledTimes(1);
  });
});
