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

  it('can disable non-photo days for photo-only pickers', () => {
    const onSelectDate = jest.fn();

    renderWithProviders(
      <JournalCalendar
        payload={APRIL_PAYLOAD}
        selectedDate="2026-04-10"
        todayLocalDate="2026-04-29"
        onSelectDate={onSelectDate}
        onChangeMonth={jest.fn()}
        monthLabel="April 2026"
        selectableDates={new Set(['2026-04-10'])}
        disableUnavailableDates
      />,
    );

    const nonPhotoDay = screen.getByRole('button', { name: '2026-04-11' });
    expect(nonPhotoDay).toBeDisabled();

    fireEvent.click(nonPhotoDay);
    expect(onSelectDate).not.toHaveBeenCalledWith('2026-04-11');
  });

  it('disables future dates while keeping past dates and today selectable', () => {
    const onSelectDate = jest.fn();

    renderWithProviders(
      <JournalCalendar
        payload={APRIL_PAYLOAD}
        selectedDate="2026-04-10"
        todayLocalDate="2026-04-10"
        onSelectDate={onSelectDate}
        onChangeMonth={jest.fn()}
        monthLabel="April 2026"
      />,
    );

    const pastDay = screen.getByRole('button', { name: '2026-04-09' });
    const today = screen.getByRole('button', { name: '2026-04-10' });
    const futureDay = screen.getByRole('button', { name: '2026-04-11' });

    expect(pastDay).not.toBeDisabled();
    expect(today).not.toBeDisabled();
    expect(futureDay).toBeDisabled();

    fireEvent.click(pastDay);
    fireEvent.click(today);
    fireEvent.click(futureDay);

    expect(onSelectDate).toHaveBeenCalledWith('2026-04-09');
    expect(onSelectDate).toHaveBeenCalledWith('2026-04-10');
    expect(onSelectDate).not.toHaveBeenCalledWith('2026-04-11');
  });

  it('disables next-month navigation when the visible month is the current month', () => {
    const onChangeMonth = jest.fn();

    renderWithProviders(
      <JournalCalendar
        payload={APRIL_PAYLOAD}
        selectedDate="2026-04-10"
        todayLocalDate="2026-04-10"
        onSelectDate={jest.fn()}
        onChangeMonth={onChangeMonth}
        monthLabel="April 2026"
      />,
    );

    const nextMonth = screen.getByRole('button', { name: /next month/i });

    expect(nextMonth).toBeDisabled();

    fireEvent.click(nextMonth);

    expect(onChangeMonth).not.toHaveBeenCalled();
  });
});
