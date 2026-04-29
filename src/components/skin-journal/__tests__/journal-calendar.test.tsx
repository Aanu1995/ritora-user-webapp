import { fireEvent, screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';
import { JournalCalendar } from '../journal-calendar';
import type { CalendarPayload } from '@/types/skin-journal';

const APRIL_PAYLOAD: CalendarPayload = {
  month: '2026-04',
  days: [
    {
      date: '2026-04-10',
      state: 'completed',
      entry_id: 'entry-1',
      has_photo: true,
      has_reaction: false,
      has_insight: true,
      thumbnail_url: null,
      analysis_status: 'completed',
    },
  ],
};

describe('JournalCalendar', () => {
  it('renders rich day markers without recap status coupling', () => {
    const onSelectDate = jest.fn();

    renderWithProviders(
      <JournalCalendar
        payload={APRIL_PAYLOAD}
        selectedDate="2026-04-10"
        todayLocalDate="2026-04-29"
        onSelectDate={onSelectDate}
        onChangeMonth={jest.fn()}
        monthLabel="April 2026"
      />,
    );

    expect(screen.getByText('April 2026')).toBeInTheDocument();
    expect(screen.queryByText(/Monthly Wrapped/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '2026-04-10' }));

    expect(onSelectDate).toHaveBeenCalledWith('2026-04-10');
  });
});
