import svMessages from '../../../../messages/sv.json';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactElement } from 'react';
import { CountrySelect } from '@/components/ui/country-select';
import { DatePicker } from '@/components/ui/date-picker';

function renderWithSwedish(ui: ReactElement) {
  return render(
    <NextIntlClientProvider locale="sv" messages={svMessages}>
      {ui}
    </NextIntlClientProvider>,
  );
}

describe('localized shared inputs', () => {
  it('renders date picker strings from translations', async () => {
    const onChange = jest.fn();
    renderWithSwedish(<DatePicker value="2026-04-17" onChange={onChange} />);

    expect(screen.getByLabelText(/rensa datum/i)).toBeInTheDocument();
  });

  it('renders country select strings from translations', async () => {
    const user = userEvent.setup();
    renderWithSwedish(<CountrySelect value={null} onChange={jest.fn()} />);

    await user.click(screen.getByRole('button', { name: /välj land/i }));
    await user.type(screen.getByPlaceholderText(/sök land/i), 'zzz');

    expect(
      screen.getByText(/inga länder matchar/i),
    ).toBeInTheDocument();
  });
});
