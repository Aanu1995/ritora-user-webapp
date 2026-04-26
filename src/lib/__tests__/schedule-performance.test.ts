import {
  MAX_SCHEDULE_PROFILE_EVENTS,
  SCHEDULE_PROFILING_STORAGE_KEY,
  clearScheduleProfileEvents,
  isScheduleProfilingEnabled,
  onScheduleProfilerRender,
} from '@/lib/schedule-performance';

describe('schedule-performance', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});

  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    window.localStorage.clear();
    delete window.__RITORA_SCHEDULE_PROFILE_EVENTS__;
    consoleInfoSpy.mockClear();
  });

  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv;
    consoleInfoSpy.mockRestore();
  });

  it('enables profiling only when the local storage flag is set', () => {
    expect(isScheduleProfilingEnabled()).toBe(false);

    window.localStorage.setItem(SCHEDULE_PROFILING_STORAGE_KEY, '1');

    expect(isScheduleProfilingEnabled()).toBe(true);
  });

  it('records and trims profiler events when profiling is enabled', () => {
    window.localStorage.setItem(SCHEDULE_PROFILING_STORAGE_KEY, '1');

    for (let index = 0; index < MAX_SCHEDULE_PROFILE_EVENTS + 5; index += 1) {
      onScheduleProfilerRender(
        `routine-step-list-${index}`,
        'update',
        9,
        12,
        index,
        index + 1,
      );
    }

    expect(window.__RITORA_SCHEDULE_PROFILE_EVENTS__).toHaveLength(
      MAX_SCHEDULE_PROFILE_EVENTS,
    );
    expect(
      window.__RITORA_SCHEDULE_PROFILE_EVENTS__?.[0]?.id,
    ).toBe('routine-step-list-5');
    expect(consoleInfoSpy).toHaveBeenCalled();
  });

  it('clears recorded events', () => {
    window.localStorage.setItem(SCHEDULE_PROFILING_STORAGE_KEY, '1');

    onScheduleProfilerRender('routine-step-list', 'mount', 10, 12, 0, 1);
    clearScheduleProfileEvents();

    expect(window.__RITORA_SCHEDULE_PROFILE_EVENTS__).toEqual([]);
  });
});
