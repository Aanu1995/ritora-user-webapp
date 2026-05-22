import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';
import { DermatologistExportModal } from '../dermatologist-export-modal';

const mutate = jest.fn();

jest.mock('@/hooks/use-skin-journal', () => ({
  useCreateJournalExport: () => ({
    mutate,
    isPending: false,
    data: null,
    error: null,
    reset: jest.fn(),
  }),
}));

describe('DermatologistExportModal', () => {
  beforeEach(() => {
    mutate.mockReset();
  });

  it('submits the selected date range through the export mutation', async () => {
    renderWithProviders(
      <DermatologistExportModal open onOpenChange={jest.fn()} />,
    );

    fireEvent.click(
      screen.getByRole('button', { name: /generate export/i }),
    );

    await waitFor(() => {
      expect(mutate).toHaveBeenCalled();
    });

    const [payload, options] = mutate.mock.calls[0] as [
      { from: string; to: string },
      { onSuccess?: unknown },
    ];
    expect(payload.from).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(payload.to).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(typeof options.onSuccess).toBe('function');
  });
});
