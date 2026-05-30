"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatLocalizedDate } from "@/lib/dayjs";
import { cn } from "@/lib/utils";
import { useMarkNotificationRead } from "@/hooks/use-notifications";
import type { InAppNotification, NotificationKind } from "@/types/notifications";

interface NotificationRowProps {
  actionsDisabled?: boolean;
  notification: InAppNotification;
  nowMs: number | null;
}

const KIND_STYLES: Record<
  InAppNotification["kind"],
  { emoji: string; bg: string; fg: string }
> = {
  photo_reminder: {
    emoji: "📷",
    bg: "bg-accent-soft",
    fg: "text-accent-strong",
  },
  reaction_detected: {
    emoji: "!",
    bg: "bg-danger-soft",
    fg: "text-danger",
  },
  simplification_started: {
    emoji: "⚠️",
    bg: "bg-warning-soft",
    fg: "text-[color:var(--warning)]",
  },
  doctor_referral: {
    emoji: "🩺",
    bg: "bg-warning-soft",
    fg: "text-[color:var(--warning)]",
  },
  insight_ready: {
    emoji: "✨",
    bg: "bg-[color:var(--ai-bg)]",
    fg: "text-[color:var(--ai-fg)]",
  },
  wrapped_ready: {
    emoji: "🎞️",
    bg: "bg-[color:var(--secondary-soft)]",
    fg: "text-[color:var(--secondary)]",
  },
  analysis_failed: {
    emoji: "⚠️",
    bg: "bg-warning-soft",
    fg: "text-[color:var(--warning)]",
  },
  export_ready: {
    emoji: "⤓",
    bg: "bg-accent-soft",
    fg: "text-accent-strong",
  },
  suggestion_ready: {
    emoji: "✨",
    bg: "bg-[color:var(--ai-bg)]",
    fg: "text-[color:var(--ai-fg)]",
  },
  slot_start: {
    emoji: "▶",
    bg: "bg-accent-soft",
    fg: "text-accent-strong",
  },
  recording_reminder: {
    emoji: "📝",
    bg: "bg-[color:var(--note-cool-bg)]",
    fg: "text-[color:var(--note-cool-fg)]",
  },
  product_nearing_expiry: {
    emoji: "!",
    bg: "bg-warning-soft",
    fg: "text-[color:var(--warning)]",
  },
  product_expired: {
    emoji: "!",
    bg: "bg-danger-soft",
    fg: "text-danger",
  },
  smart_pick_ready: {
    emoji: "SP",
    bg: "bg-accent-soft",
    fg: "text-accent-strong",
  },
  community_moderation: {
    emoji: "CM",
    bg: "bg-[color:var(--secondary-soft)]",
    fg: "text-[color:var(--secondary)]",
  },
};

const DEFAULT_KIND_STYLES = {
  emoji: "!",
  bg: "bg-surface-muted",
  fg: "text-muted",
} as const;

enum NotificationSourceMessageKey {
  SkinJournal = "sourceSkinJournal",
  TodaysSuggestion = "sourceTodaysSuggestion",
  SmartPicks = "sourceSmartPicks",
  Shelf = "sourceShelf",
  Community = "sourceCommunity",
}

const TODAY_SUGGESTION_NOTIFICATION_KINDS = new Set<NotificationKind>([
  "suggestion_ready",
  "slot_start",
  "recording_reminder",
]);
const SMART_PICK_NOTIFICATION_KINDS = new Set<NotificationKind>([
  "smart_pick_ready",
]);
const SHELF_NOTIFICATION_KINDS = new Set<NotificationKind>([
  "product_nearing_expiry",
  "product_expired",
]);
const COMMUNITY_NOTIFICATION_KINDS = new Set<NotificationKind>([
  "community_moderation",
]);

function getNotificationSourceMessageKey(
  kind: NotificationKind,
): NotificationSourceMessageKey {
  if (TODAY_SUGGESTION_NOTIFICATION_KINDS.has(kind)) {
    return NotificationSourceMessageKey.TodaysSuggestion;
  }
  if (SMART_PICK_NOTIFICATION_KINDS.has(kind)) {
    return NotificationSourceMessageKey.SmartPicks;
  }
  if (SHELF_NOTIFICATION_KINDS.has(kind)) {
    return NotificationSourceMessageKey.Shelf;
  }
  if (COMMUNITY_NOTIFICATION_KINDS.has(kind)) {
    return NotificationSourceMessageKey.Community;
  }

  return NotificationSourceMessageKey.SkinJournal;
}

function formatRelative(
  date: string,
  locale: string,
  nowMs: number | null,
): string {
  if (!nowMs || !Number.isFinite(nowMs)) {
    return formatLocalizedDate(date, locale) ?? date;
  }
  const diffSeconds = Math.round(
    (new Date(date).getTime() - nowMs) / 1000,
  );
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const absSeconds = Math.abs(diffSeconds);
  if (absSeconds < 60) {
    return formatter.format(diffSeconds, "second");
  }
  const diffMinutes = Math.round(diffSeconds / 60);
  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(diffMinutes, "minute");
  }
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return formatter.format(diffHours, "hour");
  }
  return formatter.format(Math.round(diffHours / 24), "day");
}

function normalizeDeepLink(deepLink: string | null): string | null {
  if (!deepLink || !deepLink.startsWith("/") || deepLink.startsWith("//")) {
    return null;
  }
  return deepLink;
}

function getPayloadString(
  payload: Record<string, unknown> | null,
  key: string,
): string | null {
  const value = payload?.[key];
  return typeof value === "string" && value.trim() ? value : null;
}

function getPayloadNumber(
  payload: Record<string, unknown> | null,
  key: string,
): number | null {
  const value = payload?.[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function formatDateLabel(value: string | null, locale: string): string | null {
  return formatLocalizedDate(value, locale);
}

function formatKindFallback(kind: string): string {
  return kind
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

type NotificationPageTranslate = (
  key: string,
  values?: Record<string, string | number>,
) => string;

function tryTranslate(
  translate: NotificationPageTranslate,
  key: string,
  values?: Record<string, string | number>,
): string | null {
  try {
    return translate(key, values);
  } catch {
    return null;
  }
}

export function NotificationRow({
  actionsDisabled = false,
  notification,
  nowMs,
}: NotificationRowProps) {
  const locale = useLocale();
  const t = useTranslations("notificationsPage");
  const translateMessage = t as unknown as NotificationPageTranslate;
  const router = useRouter();
  const markRead = useMarkNotificationRead();
  const styles = KIND_STYLES[notification.kind] ?? DEFAULT_KIND_STYLES;
  const deepLink = normalizeDeepLink(notification.deep_link);
  const sourceMessageKey = getNotificationSourceMessageKey(notification.kind);
  const productName =
    getPayloadString(notification.payload, "productName") ??
    getPayloadString(notification.payload, "name") ??
    t("fallbackProductName");
  const expiresDate =
    formatDateLabel(
      getPayloadString(notification.payload, "expiresAt"),
      locale,
    ) ?? t("unknownDate");
  const daysUntilExpiry = getPayloadNumber(
    notification.payload,
    "daysUntilExpiry",
  );
  const kindTitleKey = `kinds.${notification.kind}.title`;
  const kindBodyKey = `kinds.${notification.kind}.body`;

  const isUnread = !notification.read_at;
  const title =
    tryTranslate(translateMessage, kindTitleKey) ??
    formatKindFallback(notification.kind);
  const body =
    notification.kind === "product_nearing_expiry"
      ? daysUntilExpiry !== null
        ? tryTranslate(translateMessage, kindBodyKey, {
            productName,
            daysUntilExpiry,
            expiresDate,
          }) ?? t("unknownKindBody")
        : tryTranslate(translateMessage, `kinds.${notification.kind}.bodyFallback`, {
            productName,
            expiresDate,
          }) ?? t("unknownKindBody")
      : notification.kind === "product_expired"
        ? tryTranslate(translateMessage, kindBodyKey, {
            productName,
            expiresDate,
          }) ?? t("unknownKindBody")
        : tryTranslate(translateMessage, kindBodyKey) ?? t("unknownKindBody");

  const handleClick = () => {
    if (actionsDisabled) {
      return;
    }

    if (!notification.read_at) {
      markRead.mutate(notification.id);
    }
    if (deepLink) {
      router.push(deepLink);
    }
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 border-b border-border py-3.5 last:border-b-0",
        isUnread &&
          "-mx-2.5 my-1 rounded-xl border-b-0 bg-[color:var(--accent-strong)]/[0.04] px-2.5 py-3.5",
      )}
    >
      <div
        aria-hidden
        className={cn(
          "grid h-9 w-9 shrink-0 place-items-center rounded-[10px] text-base font-bold leading-none",
          styles.bg,
          styles.fg,
        )}
      >
        {styles.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">
          {title}
        </p>
        <p className="mt-1 text-sm leading-[1.55] text-muted">
          {body}
        </p>
        <p className="mt-1.5 text-xs text-muted">
          {formatRelative(notification.created_at, locale, nowMs)} ·{" "}
          {t(sourceMessageKey)}
        </p>
      </div>
      {deepLink ? (
        <Button
          variant="outline"
          size="sm"
          disabled={markRead.isPending || actionsDisabled}
          onClick={handleClick}
          className="shrink-0"
        >
          {notification.kind === "wrapped_ready" ? t("play") : t("view")}
        </Button>
      ) : null}
    </div>
  );
}
