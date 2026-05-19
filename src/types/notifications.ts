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
  | "recording_reminder"
  | "product_nearing_expiry"
  | "product_expired"
  | "smart_pick_ready";

export const SUGGESTION_LEAD_TIME_MIN_MINUTES = 30;
export const SUGGESTION_LEAD_TIME_MAX_MINUTES = 720;
export const SUGGESTION_LEAD_TIME_DEFAULT_MINUTES = 120;
export const PRODUCT_EXPIRY_NOTICE_DAYS_MIN = 1;
export const PRODUCT_EXPIRY_NOTICE_DAYS_MAX = 90;
export const PRODUCT_EXPIRY_NOTICE_DAYS_DEFAULT = 14;
export const InsightCadenceValue = {
  Weekly: "weekly",
  Fewer: "fewer",
} as const;
export type InsightCadence =
  (typeof InsightCadenceValue)[keyof typeof InsightCadenceValue];
export const INSIGHT_CADENCE_VALUES = [
  InsightCadenceValue.Weekly,
  InsightCadenceValue.Fewer,
] as const;
export const INSIGHT_CADENCE_DEFAULT = InsightCadenceValue.Weekly;
export const INSIGHT_DIGEST_DAY_DEFAULT = 1;
export const INSIGHT_DIGEST_LOCAL_TIME_DEFAULT = "09:00";

export type NotificationSeverity = "info" | "warning" | "critical";

export const NotificationChannelValue = {
  Email: "email",
  InApp: "in_app",
  Push: "push",
} as const;

export type NotificationChannel =
  (typeof NotificationChannelValue)[keyof typeof NotificationChannelValue];

export const NOTIFICATION_CHANNEL_VALUES = [
  NotificationChannelValue.Email,
  NotificationChannelValue.InApp,
  NotificationChannelValue.Push,
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
  reaction_alert_channels: NotificationChannel[];
  reaction_alerts_enabled: boolean;
  simplification_alert_channels: NotificationChannel[];
  simplification_alerts_enabled: boolean;
  insight_alert_channels: NotificationChannel[];
  insight_alerts_enabled: boolean;
  insight_cadence: InsightCadence;
  insight_digest_day: number;
  insight_digest_local_time: string;
  wrapped_alert_channels: NotificationChannel[];
  wrapped_alerts_enabled: boolean;
  photo_tutorial_completed: boolean;
  suggestion_ready_channels: NotificationChannel[];
  suggestion_ready_enabled: boolean;
  smart_pick_ready_channels: NotificationChannel[];
  smart_pick_ready_enabled: boolean;
  slot_start_channels: NotificationChannel[];
  slot_start_enabled: boolean;
  recording_reminder_channels: NotificationChannel[];
  recording_reminder_enabled: boolean;
  product_expiry_alert_channels: NotificationChannel[];
  product_expiry_alerts_enabled: boolean;
  product_expiry_notice_days: number;
  suggestion_lead_time_minutes: number;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
}

export interface UpdatePreferencesPayload {
  photo_reminder_local_time?: string;
  photo_reminder_enabled?: boolean;
  channels?: NotificationChannel[];
  reaction_alert_channels?: NotificationChannel[];
  reaction_alerts_enabled?: boolean;
  simplification_alert_channels?: NotificationChannel[];
  simplification_alerts_enabled?: boolean;
  insight_alert_channels?: NotificationChannel[];
  insight_alerts_enabled?: boolean;
  insight_cadence?: InsightCadence;
  insight_digest_day?: number;
  insight_digest_local_time?: string;
  wrapped_alert_channels?: NotificationChannel[];
  wrapped_alerts_enabled?: boolean;
  photo_tutorial_completed?: boolean;
  suggestion_ready_channels?: NotificationChannel[];
  suggestion_ready_enabled?: boolean;
  smart_pick_ready_channels?: NotificationChannel[];
  smart_pick_ready_enabled?: boolean;
  slot_start_channels?: NotificationChannel[];
  slot_start_enabled?: boolean;
  recording_reminder_channels?: NotificationChannel[];
  recording_reminder_enabled?: boolean;
  product_expiry_alert_channels?: NotificationChannel[];
  product_expiry_alerts_enabled?: boolean;
  product_expiry_notice_days?: number;
  suggestion_lead_time_minutes?: number;
  quiet_hours_enabled?: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
}

export const PushProviderValue = {
  WebPush: "web_push",
  Fcm: "fcm",
  Apns: "apns",
} as const;

export type PushProvider =
  (typeof PushProviderValue)[keyof typeof PushProviderValue];

export const PushPlatformValue = {
  Web: "web",
  Ios: "ios",
  Android: "android",
} as const;

export type PushPlatform =
  (typeof PushPlatformValue)[keyof typeof PushPlatformValue];

export interface WebPushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface PushSubscriptionRegistration {
  provider: PushProvider;
  platform: PushPlatform;
  endpoint?: string;
  keys?: WebPushSubscriptionKeys;
  token?: string;
  device_name?: string;
}

export interface PushSubscriptionSummary {
  id: string;
  provider: PushProvider;
  platform: PushPlatform;
  endpoint_hash?: string;
  device_name?: string;
  last_seen_at: string | null;
  created_at: string;
  failure_count: number;
  last_failure_at: string | null;
  last_failure_reason?: string;
}

export interface PushDeliveryStatusCounts {
  sending: number;
  sent: number;
  failed: number;
  skipped: number;
}

export interface PushStatusSummary {
  active_subscriptions: number;
  web_push_subscriptions: number;
  mobile_subscriptions: number;
  failing_subscriptions: number;
  recent_delivery_statuses: PushDeliveryStatusCounts;
  pending_retries: number;
  exhausted_failures: number;
  stale_sending: number;
}
