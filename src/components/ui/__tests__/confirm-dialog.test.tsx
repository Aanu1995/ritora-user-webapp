import svMessages from '../../../../messages/sv.json';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { useState } from 'react';
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

  it('passes content sizing overrides to the dialog surface', () => {
    renderWithSwedish(
      <ConfirmDialog
        open
        onOpenChange={jest.fn()}
        title="Osparade ändringar?"
        confirmLabel="Kasta ändringar"
        onConfirm={jest.fn()}
        contentClassName="w-[calc(100%-1.5rem)] sm:w-full"
      />,
    );

    expect(screen.getByRole('alertdialog')).toHaveClass(
      'w-[calc(100%-1.5rem)]',
      'sm:w-full',
    );
  });

  it('closes when the cancel action is pressed', async () => {
    const user = userEvent.setup();

    function TestDialog() {
      const [open, setOpen] = useState(true);

      return (
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          title="Osparade ändringar?"
          description="Vill du fortsätta redigera?"
          confirmLabel="Kasta ändringar"
          cancelLabel="Fortsätt redigera"
          onConfirm={jest.fn()}
        />
      );
    }

    renderWithSwedish(<TestDialog />);

    await user.click(
      screen.getByRole('button', { name: /fortsätt redigera/i }),
    );

    expect(
      screen.queryByRole('button', { name: /fortsätt redigera/i }),
    ).not.toBeInTheDocument();
  });
});
