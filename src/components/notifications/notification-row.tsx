"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMarkNotificationRead } from "@/hooks/use-notifications";
import type { InAppNotification } from "@/types/notifications";

interface NotificationRowProps {
  notification: InAppNotification;
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
  // Today's Suggestion notification kinds. Match the icons used in the
  // Today's Suggestion mockups: ✨ for AI suggestion ready, ▶ for slot
  // start, 📝 for the recording reminder.
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
};

function formatRelative(date: string, locale: string): string {
  const diffSeconds = Math.round(
    (new Date(date).getTime() - Date.now()) / 1000,
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

export function NotificationRow({ notification }: NotificationRowProps) {
  const locale = useLocale();
  const t = useTranslations("notificationsPage");
  const tKind = useTranslations(`notificationsPage.kinds.${notification.kind}`);
  const router = useRouter();
  const markRead = useMarkNotificationRead();
  const styles = KIND_STYLES[notification.kind];
  const deepLink = normalizeDeepLink(notification.deep_link);

  const isUnread = !notification.read_at;

  const handleClick = () => {
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
          {tKind("title")}
        </p>
        <p className="mt-1 text-sm leading-[1.55] text-muted">
          {tKind("body")}
        </p>
        <p className="mt-1.5 text-xs text-muted">
          {formatRelative(notification.created_at, locale)} ·{" "}
          {t("sourceSkinJournal")}
        </p>
      </div>
      {deepLink ? (
        <Button
          variant="outline"
          size="sm"
          disabled={markRead.isPending}
          onClick={handleClick}
          className="shrink-0"
        >
          {notification.kind === "wrapped_ready" ? t("play") : t("view")}
        </Button>
      ) : null}
    </div>
  );
}
