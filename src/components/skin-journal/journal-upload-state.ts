import {
  createEmptyReactionReport,
  type CheckInFormValue,
} from "@/components/skin-journal/daily-check-in-validation";
import {
  FRONT_PHOTO_ANGLE,
  type JournalEntry,
  type JournalEntryPhoto,
} from "@/types/skin-journal";

export const EMPTY_CHECK_IN: CheckInFormValue = { ratings: {} };

export function todayYmd(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function entryToCheckIn(entry: JournalEntry): CheckInFormValue {
  return {
    ratings: entry.ratings ?? {},
    overall_feel: entry.overall_feel ?? undefined,
    sleep_band: entry.sleep_band ?? undefined,
    stress_today: entry.stress_today ?? undefined,
    sun_exposure_today: entry.sun_exposure_today ?? undefined,
    sweat_exercise_today: entry.sweat_exercise_today ?? undefined,
    cycle_marker: entry.cycle_marker ?? undefined,
    recent_change: entry.recent_change ?? null,
    reaction_report: entry.reaction_report ?? null,
    complaint_note: entry.complaint_note ?? null,
  };
}

export function withReactionReportDraft(
  value: CheckInFormValue,
  enabled: boolean,
): CheckInFormValue {
  const draft = {
    ...value,
    ratings: { ...value.ratings },
  };

  if (!enabled || draft.reaction_report) {
    return draft;
  }

  return {
    ...draft,
    reaction_report: createEmptyReactionReport(),
  };
}

export function entryPhotosForUpload(
  entry: JournalEntry | null,
): JournalEntryPhoto[] {
  if (!entry) {
    return [];
  }
  if (entry.photos?.length) {
    return entry.photos;
  }
  return entry.photo_url
    ? [
        {
          angle: FRONT_PHOTO_ANGLE,
          photo_url: entry.photo_url,
          width: entry.photo_width,
          height: entry.photo_height,
        },
      ]
    : [];
}
