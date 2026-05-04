export type NotificationKind =
  | "photo_reminder"
  | "reaction_detected"
  | "simplification_started"
  | "doctor_referral"
  | "insight_ready"
  | "wrapped_ready"
  | "analysis_failed"
  | "export_ready"
  | "suggestion_ready"
  | "slot_start"
  | "recording_reminder";

export const SUGGESTION_LEAD_TIME_MIN_MINUTES = 30;
export const SUGGESTION_LEAD_TIME_MAX_MINUTES = 720;
export const SUGGESTION_LEAD_TIME_DEFAULT_MINUTES = 120;

export type NotificationSeverity = "info" | "warning" | "critical";

export const NotificationChannelValue = {
  Email: "email",
  InApp: "in_app",
} as const;

export type NotificationChannel =
  (typeof NotificationChannelValue)[keyof typeof NotificationChannelValue];

export const NOTIFICATION_CHANNEL_VALUES = [
  NotificationChannelValue.Email,
  NotificationChannelValue.InApp,
] as const;

export interface InAppNotification {
  id: string;
  kind: NotificationKind;
  title_key: string;
  body_key: string;
  severity: NotificationSeverity;
  payload: Record<string, unknown> | null;
  deep_link: string | null;
  read_at: string | null;
  created_at: string;
}

export interface NotificationsList {
  items: InAppNotification[];
  nextCursor: string | null;
  unread_count: number;
}

export interface NotificationBuckets {
  unread: InAppNotification[];
  read: InAppNotification[];
  unread_count: number;
}

export interface NotificationPreferences {
  photo_reminder_local_time: string;
  photo_reminder_enabled: boolean;
  channels: NotificationChannel[];
  reaction_alerts_enabled: boolean;
  simplification_alerts_enabled: boolean;
  insight_alerts_enabled: boolean;
  ai_polished_insights_enabled: boolean;
  wrapped_alerts_enabled: boolean;
  photo_tutorial_completed: boolean;
  suggestion_ready_enabled: boolean;
  slot_start_enabled: boolean;
  recording_reminder_enabled: boolean;
  suggestion_lead_time_minutes: number;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
}

export interface UpdatePreferencesPayload {
  photo_reminder_local_time?: string;
  photo_reminder_enabled?: boolean;
  channels?: NotificationChannel[];
  reaction_alerts_enabled?: boolean;
  simplification_alerts_enabled?: boolean;
  insight_alerts_enabled?: boolean;
  ai_polished_insights_enabled?: boolean;
  wrapped_alerts_enabled?: boolean;
  photo_tutorial_completed?: boolean;
  suggestion_ready_enabled?: boolean;
  slot_start_enabled?: boolean;
  recording_reminder_enabled?: boolean;
  suggestion_lead_time_minutes?: number;
  quiet_hours_enabled?: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
}
