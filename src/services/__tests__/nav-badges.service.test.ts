jest.mock('@/lib/api', () => ({
  getRequest: jest.fn(),
}));

import { getRequest } from '@/lib/api';
import { getAppNavBadges } from '@/services/nav-badges.service';

afterEach(() => jest.clearAllMocks());

describe('nav-badges.service', () => {
  it('reads notification unread and journal warning counts from one lightweight endpoint', async () => {
    (getRequest as jest.Mock).mockResolvedValue({
      notifications_unread_count: 4,
      skin_journal_warning_count: 1,
    });

    const result = await getAppNavBadges();

    expect(getRequest).toHaveBeenCalledWith('/app/nav-badges');
    expect(result).toEqual({
      notifications_unread_count: 4,
      skin_journal_warning_count: 1,
    });
  });
});
