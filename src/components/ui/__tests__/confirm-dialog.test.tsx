import svMessages from '../../../../messages/sv.json';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

function renderWithSwedish(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="sv" messages={svMessages}>
      {ui}
    </NextIntlClientProvider>,
  );
}

describe('ConfirmDialog', () => {
  it('uses translated fallback labels when explicit labels are omitted', () => {
    renderWithSwedish(
      <ConfirmDialog
        open
        onOpenChange={jest.fn()}
        title="Ta bort produkt?"
        confirmLabel="Ta bort"
        onConfirm={jest.fn()}
      />,
    );

    expect(
      screen.getByRole('button', { name: /avbryt/i }),
    ).toBeInTheDocument();
  });

  it('uses translated pending text', () => {
    renderWithSwedish(
      <ConfirmDialog
        open
        onOpenChange={jest.fn()}
        title="Ta bort produkt?"
        confirmLabel="Ta bort"
        onConfirm={jest.fn()}
        isPending
      />,
    );

    expect(
      screen.getByRole('button', { name: /bearbetar/i }),
    ).toBeInTheDocument();
  });
});
