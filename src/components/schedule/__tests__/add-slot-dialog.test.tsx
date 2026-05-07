import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import svMessages from '../../../../messages/sv.json';
import { AddSlotPresetMode } from '@/types/schedule';
import { AddSlotDialog } from '../add-slot-dialog';

jest.mock('@/components/ui/sheet', () => ({
  Sheet: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetContent: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <div className={className}>{children}</div>,
  SheetTitle: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <div className={className}>{children}</div>,
  SheetDescription: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <div className={className}>{children}</div>,
}));

jest.mock('@/hooks/use-schedule', () => ({
  useCreateSlot: () => ({
    mutateAsync: jest.fn(),
    isPending: false,
  }),
  useCreateSlots: () => ({
    mutate: jest.fn(),
    isPending: false,
  }),
  useApplyPreset: () => ({
    mutate: jest.fn(),
    isPending: false,
  }),
}));

jest.mock('@/hooks/use-suggestions', () => ({
  useSuggestionAiConsent: () => ({
    data: { granted: true, grantedAt: '2026-05-07T09:00:00.000Z' },
    isLoading: false,
  }),
  useUpdateSuggestionAiConsent: () => ({
    mutate: jest.fn(),
    isPending: false,
  }),
}));

describe('AddSlotDialog', () => {
  it('renders localized sheet copy instead of hardcoded English', () => {
    render(
      <NextIntlClientProvider locale="sv" messages={svMessages}>
        <AddSlotDialog
          open
          presetMode={AddSlotPresetMode.EveryDay}
          preselectDay={null}
          onOpenChange={jest.fn()}
        />
      </NextIntlClientProvider>,
    );

    expect(
      screen.getByRole('heading', { name: 'Lägg till varje dag' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Apply to every day'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Create a scheduled time slot'),
    ).not.toBeInTheDocument();
  });
});
