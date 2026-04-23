import { fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import enMessages from '../../../../messages/en.json';
import { useUnsavedChangesStore } from '@/stores/unsaved-changes-store';
import { DayOfWeek, SlotMode, type ScheduleSlot } from '@/types/schedule';
import { SlotEditorSheet } from '../slot-editor-sheet';

jest.mock('@/components/ui/sheet', () => ({
  Sheet: ({
    children,
    onOpenChange,
    open,
  }: {
    children: React.ReactNode;
    onOpenChange: (open: boolean) => void;
    open: boolean;
  }) =>
    open ? (
      <div>
        <button type="button" onClick={() => onOpenChange(false)}>
          dismiss-sheet
        </button>
        {children}
      </div>
    ) : null,
  SheetContent: ({
    children,
    showCloseButton = true,
  }: {
    children: React.ReactNode;
    showCloseButton?: boolean;
  }) => (
    <div
      data-testid="sheet-content"
      data-show-close-button={showCloseButton ? 'true' : 'false'}
    >
      {children}
    </div>
  ),
  SheetTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetDescription: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock('../slot-editor-content', () => ({
  SlotEditorContent: () => <div>slot-editor-content</div>,
}));

function createSlot(): ScheduleSlot {
  return {
    id: 'slot-1',
    dayOfWeek: DayOfWeek.Mon,
    slotTime: '08:00',
    mode: SlotMode.Manual,
    slotNotes: null,
    steps: [],
    createdAt: '2026-04-17T00:00:00.000Z',
    updatedAt: '2026-04-17T00:00:00.000Z',
  };
}

function renderSheet(
  props: Partial<React.ComponentProps<typeof SlotEditorSheet>> = {},
) {
  return render(
    <NextIntlClientProvider locale="en" messages={enMessages}>
      <SlotEditorSheet
        slot={createSlot()}
        open
        onOpenChange={jest.fn()}
        {...props}
      />
    </NextIntlClientProvider>,
  );
}

describe('SlotEditorSheet', () => {
  beforeEach(() => {
    useUnsavedChangesStore.setState({
      hasUnsavedChanges: false,
      isDialogOpen: false,
      pendingProceed: null,
      suppressRequestLeaveUntil: 0,
    });
  });

  it('suppresses sheet dismissal while the product picker is stacked above it', () => {
    const onOpenChange = jest.fn();

    renderSheet({ onOpenChange, suppressAutoClose: true });

    expect(screen.getByTestId('sheet-content')).toHaveAttribute(
      'data-show-close-button',
      'false',
    );

    fireEvent.click(screen.getByRole('button', { name: /dismiss-sheet/i }));

    expect(onOpenChange).not.toHaveBeenCalled();
    expect(useUnsavedChangesStore.getState().isDialogOpen).toBe(false);
  });
});
