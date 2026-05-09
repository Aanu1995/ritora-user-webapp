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
  acknowledgeEvent,
  acknowledgeSimplification,
  deleteEntry,
  dismissInsight,
  getActiveSimplification,
  getJournalExport,
  getCalendar,
  getDay,
  getJournalStats,
  getSimplification,
  getTodayEntry,
  getWrapped,
  listPhotoFilters,
  listPhotoDates,
  listPhotos,
  listEvents,
  listInsights,
  listMonthEntries,
  listWrapped,
  markInsightSeen,
  retryAnalysis,
  startSimplification,
  updateEntry,
  upsertToday,
} from '@/services/skin-journal.service';

afterEach(() => jest.clearAllMocks());

describe('skin-journal.service', () => {
  it('uploads entries as multipart with consent and skip-check-in fields', async () => {
    const photo = new File(['face'], 'face.jpg', { type: 'image/jpeg' });
    const onUploadProgress = jest.fn();
    (postMultipartRequest as jest.Mock).mockResolvedValue({ id: 'entry-1' });

    await upsertToday(
      {
        is_pre_routine: true,
        skip_check_in: true,
        photo_processing_consent: true,
      },
      photo,
      { onUploadProgress },
    );

    expect(postMultipartRequest).toHaveBeenCalledWith(
      '/skin-journal/today',
      expect.any(FormData),
      { onUploadProgress },
    );
    const body = (postMultipartRequest as jest.Mock).mock.calls[0]?.[1] as FormData;
    expect(body.get('photo')).toBe(photo);
    expect(body.has('angle')).toBe(false);
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

  it('loads the lightweight photo-date index without media URLs', async () => {
    (getRequest as jest.Mock).mockResolvedValue({
      dates: [
        {
          date: '2026-04-10',
          entry_id: 'entry-1',
          analysis_status: 'completed',
          has_reaction: false,
        },
      ],
      months: [{ month: '2026-04', photo_count: 1 }],
    });

    const result = await listPhotoDates({
      from: '2025-01-01',
      to: '2026-04-30',
    });

    expect(getRequest).toHaveBeenCalledWith(
      '/skin-journal/photo-dates?from=2025-01-01&to=2026-04-30',
    );
    expect(result.dates[0]).not.toHaveProperty('photo_url');
  });

  it('loads backend-generated photo filter facets without media URLs', async () => {
    (getRequest as jest.Mock).mockResolvedValue({
      filters: [
        { id: 'all', kind: 'all', value: null, count: 4 },
        { id: 'concern:acne', kind: 'concern', value: 'acne', count: 2 },
      ],
    });

    const result = await listPhotoFilters();

    expect(getRequest).toHaveBeenCalledWith('/skin-journal/photo-filters');
    expect(result.filters[0]).not.toHaveProperty('photo_url');
  });

  it('passes the selected photo filter to the backend photos endpoint', async () => {
    (getRequest as jest.Mock).mockResolvedValue({
      items: [],
      nextCursor: null,
    });

    await listPhotos({ filter: 'concern:acne' });

    expect(getRequest).toHaveBeenCalledWith(
      '/skin-journal/photos?filter=concern%3Aacne',
    );
  });

  it('passes photo pagination cursor and limit to the backend photos endpoint', async () => {
    (getRequest as jest.Mock).mockResolvedValue({
      items: [],
      nextCursor: null,
    });

    await listPhotos({ limit: 24, cursor: 'cursor-1' });

    expect(getRequest).toHaveBeenCalledWith(
      '/skin-journal/photos?limit=24&cursor=cursor-1',
    );
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

  it('loads structured insight envelopes with window and locale query params', async () => {
    (getRequest as jest.Mock).mockResolvedValue({
      insights: [],
      meta: {
        total_entries: 14,
        entries_until_next_insight: 16,
        last_generated_at: '2026-05-01T09:00:00.000Z',
      },
    });

    await listInsights({ window: 'month', locale: 'sv' });

    expect(getRequest).toHaveBeenCalledWith(
      '/skin-journal/insights?window=month&locale=sv',
    );
  });

  it('deletes entries through the current entry collection endpoint', async () => {
    (deleteRequest as jest.Mock).mockResolvedValue(undefined);

    await deleteEntry('entry-1');

    expect(deleteRequest).toHaveBeenCalledWith('/skin-journal/entries/entry-1');
  });

  it('covers read endpoints that return journal details and status', async () => {
    (getRequest as jest.Mock).mockResolvedValue({});

    await getTodayEntry();
    await getDay('2026-05-02');
    await listMonthEntries('2026-05');
    await listWrapped();
    await getWrapped('wrapped-1');
    await getActiveSimplification();
    await getSimplification('simplification-1');
    await getJournalStats();

    expect(getRequest).toHaveBeenCalledWith('/skin-journal/today');
    expect(getRequest).toHaveBeenCalledWith('/skin-journal/days/2026-05-02');
    expect(getRequest).toHaveBeenCalledWith(
      '/skin-journal/entries?month=2026-05',
    );
    expect(getRequest).toHaveBeenCalledWith('/skin-journal/wrapped');
    expect(getRequest).toHaveBeenCalledWith('/skin-journal/wrapped/wrapped-1');
    expect(getRequest).toHaveBeenCalledWith(
      '/skin-journal/simplification/active',
    );
    expect(getRequest).toHaveBeenCalledWith(
      '/skin-journal/simplification/simplification-1',
    );
    expect(getRequest).toHaveBeenCalledWith('/skin-journal/stats');
  });

  it('covers event, insight, analysis, and simplification command endpoints', async () => {
    (postRequest as jest.Mock).mockResolvedValue({});

    await retryAnalysis('entry-1');
    await acknowledgeEvent('event-1');
    await dismissInsight('insight-1');
    await markInsightSeen('insight-1');
    await startSimplification({
      triggered_by_event_id: 'event-1',
      reason: 'possible irritation',
    });
    await acknowledgeSimplification('simplification-1');

    expect(postRequest).toHaveBeenCalledWith(
      '/skin-journal/entries/entry-1/analyze/retry',
      {},
    );
    expect(postRequest).toHaveBeenCalledWith(
      '/skin-journal/events/event-1/acknowledge',
      {},
    );
    expect(postRequest).toHaveBeenCalledWith(
      '/skin-journal/insights/insight-1/dismiss',
      {},
    );
    expect(postRequest).toHaveBeenCalledWith(
      '/skin-journal/insights/insight-1/seen',
      {},
    );
    expect(postRequest).toHaveBeenCalledWith(
      '/skin-journal/simplification/start',
      {
        triggered_by_event_id: 'event-1',
        reason: 'possible irritation',
      },
    );
    expect(postRequest).toHaveBeenCalledWith(
      '/skin-journal/simplification/simplification-1/acknowledge',
      {},
    );
  });
});
