jest.mock('@/lib/api', () => ({
  deleteRequest: jest.fn(),
  getRequest: jest.fn(),
  patchRequest: jest.fn(),
  postMultipartRequest: jest.fn(),
  postRequest: jest.fn(),
}));

import {
  deleteRequest,
  getRequest,
  patchRequest,
  postMultipartRequest,
  postRequest,
} from '@/lib/api';
import {
  createJournalExport,
  deleteEntry,
  getJournalExport,
  getCalendar,
  listEvents,
  updateEntry,
  upsertToday,
} from '@/services/skin-journal.service';

afterEach(() => jest.clearAllMocks());

describe('skin-journal.service', () => {
  it('uploads entries as multipart with consent and skip-check-in fields', async () => {
    const photo = new File(['face'], 'face.jpg', { type: 'image/jpeg' });
    (postMultipartRequest as jest.Mock).mockResolvedValue({ id: 'entry-1' });

    await upsertToday(
      {
        angle: 'head_on',
        is_pre_routine: true,
        skip_check_in: true,
        photo_processing_consent: true,
      },
      photo,
    );

    expect(postMultipartRequest).toHaveBeenCalledWith(
      '/skin-journal/today',
      expect.any(FormData),
    );
    const body = (postMultipartRequest as jest.Mock).mock.calls[0]?.[1] as FormData;
    expect(body.get('photo')).toBe(photo);
    expect(body.get('skip_check_in')).toBe('true');
    expect(body.get('photo_processing_consent')).toBe('true');
  });

  it('uses the current entry update endpoint only', async () => {
    (patchRequest as jest.Mock).mockResolvedValue({ id: 'entry-1' });

    await updateEntry('entry-1', { complaint_note: 'tight cheeks' });

    expect(patchRequest).toHaveBeenCalledWith(
      '/skin-journal/entries/entry-1',
      { complaint_note: 'tight cheeks' },
    );
  });

  it('integrates dermatologist export endpoints', async () => {
    (postRequest as jest.Mock).mockResolvedValue({ id: 'export-1' });
    (getRequest as jest.Mock).mockResolvedValue({ id: 'export-1' });

    await createJournalExport({ from: '2026-04-01', to: '2026-04-30' });
    await getJournalExport('export-1');

    expect(postRequest).toHaveBeenCalledWith('/skin-journal/export', {
      from: '2026-04-01',
      to: '2026-04-30',
    });
    expect(getRequest).toHaveBeenCalledWith('/skin-journal/export/export-1');
  });

  it('keeps calendar response scoped to day status only', async () => {
    (getRequest as jest.Mock).mockResolvedValue({
      month: '2026-04',
      days: [],
    });

    const result = await getCalendar('2026-04');

    expect(result).toEqual({ month: '2026-04', days: [] });
  });

  it('passes event filters to the journal events endpoint', async () => {
    (getRequest as jest.Mock).mockResolvedValue([]);

    await listEvents({
      kind: 'reaction_detected',
      from: '2026-04-01',
      to: '2026-04-30',
      acknowledged: false,
    });

    expect(getRequest).toHaveBeenCalledWith(
      '/skin-journal/events?kind=reaction_detected&from=2026-04-01&to=2026-04-30&acknowledged=false',
    );
  });

  it('deletes entries through the current entry collection endpoint', async () => {
    (deleteRequest as jest.Mock).mockResolvedValue(undefined);

    await deleteEntry('entry-1');

    expect(deleteRequest).toHaveBeenCalledWith('/skin-journal/entries/entry-1');
  });
});
