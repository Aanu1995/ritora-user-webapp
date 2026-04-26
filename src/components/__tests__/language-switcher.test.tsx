import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageSwitcher } from '@/components/language-switcher';
import { renderWithProviders } from '@/test/utils';

const mockRefresh = jest.fn();
const mockPersistLocalePreference = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

jest.mock('@/i18n/config', () => ({
  locales: ['en', 'sv'],
  persistLocalePreference: (...args: unknown[]) =>
    mockPersistLocalePreference(...args),
}));

describe('LanguageSwitcher', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('persists locally when handling the locale change itself', async () => {
    const { getByRole } = renderWithProviders(<LanguageSwitcher />);

    await user.click(getByRole('button', { name: /svenska/i }));

    await waitFor(() => {
      expect(mockPersistLocalePreference).toHaveBeenCalledWith('sv');
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });
  });

  it('skips the extra local persistence when an external handler owns it', async () => {
    const onLocaleChange = jest.fn().mockResolvedValue(true);
    const { getByRole } = renderWithProviders(
      <LanguageSwitcher
        persistLocallyAfterExternalChange={false}
        onLocaleChange={onLocaleChange}
      />,
    );

    await user.click(getByRole('button', { name: /svenska/i }));

    await waitFor(() => {
      expect(onLocaleChange).toHaveBeenCalledWith('sv');
      expect(mockPersistLocalePreference).not.toHaveBeenCalled();
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });
  });
});
