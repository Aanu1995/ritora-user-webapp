import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import { useAuthStore } from '@/stores/auth-store';
import { TimeZoneMismatchNotice } from '@/components/app/time-zone-mismatch-notice';

const mockMutate = jest.fn();
const mockAcknowledge = jest.fn();
const mockClearAcknowledged = jest.fn();
const mockHasAcknowledged = jest.fn(() => false);

jest.mock('@/hooks/use-auth', () => ({
  useUpdateTimeZone: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
}));

jest.mock('@/lib/time-zone', () => {
  const actual = jest.requireActual('@/lib/time-zone');
  return {
    ...actual,
    getBrowserTimeZone: jest.fn(() => 'America/New_York'),
    hasAcknowledgedTimeZoneMismatch: (...args: [string, string]) =>
      mockHasAcknowledged(...args),
    acknowledgeTimeZoneMismatch: (...args: [string, string]) =>
      mockAcknowledge(...args),
    clearAcknowledgedTimeZoneMismatches: () => mockClearAcknowledged(),
  };
});

describe('TimeZoneMismatchNotice', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      user: {
        id: 'user-1',
        email: 'ada@example.com',
        firstName: 'Ada',
        lastName: 'Lovelace',
        emailVerified: true,
        preferredLanguage: 'en',
        timeZone: 'Europe/Stockholm',
        createdAt: '2026-04-15T10:00:00.000Z',
      },
      isAuthenticated: true,
      isLoading: false,
    });
  });

  it('renders the mismatch notice when the device timezone changes', () => {
    renderWithProviders(<TimeZoneMismatchNotice />);

    expect(
      screen.getByText(/timezone change detected/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: /keep current schedule timezone/i,
      }),
    ).toBeInTheDocument();
  });

  it('acknowledges the mismatch when the user keeps the current timezone', async () => {
    renderWithProviders(<TimeZoneMismatchNotice />);

    await user.click(
      screen.getByRole('button', {
        name: /keep current schedule timezone/i,
      }),
    );

    expect(mockAcknowledge).toHaveBeenCalledWith(
      'Europe/Stockholm',
      'America/New_York',
    );
  });

  it('switches the saved timezone to the current device timezone', async () => {
    mockMutate.mockImplementation(
      (
        values: { timeZone: string },
        options?: { onSuccess?: () => void },
      ) => {
        options?.onSuccess?.();
      },
    );

    renderWithProviders(<TimeZoneMismatchNotice />);

    await user.click(
      screen.getByRole('button', {
        name: /switch schedule timezone to america\/new york/i,
      }),
    );

    expect(mockMutate).toHaveBeenCalledWith(
      { timeZone: 'America/New_York' },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    );
    expect(mockClearAcknowledged).toHaveBeenCalled();
  });
});
