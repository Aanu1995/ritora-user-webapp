"use client";

import Link from "next/link";
import {
  CalendarClock,
  CalendarPlus,
  Camera,
  MoonStar,
  Package,
  Play,
  Plus,
  UserCircle,
  Zap,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

/**
 * Three blocking states for the Today's Suggestion page. The page renders
 * the highest-priority blocker only:
 *  1. No skin profile -> can't suggest anything
 *  2. No shelf products -> nothing to suggest from
 *  3. No schedule slots -> nothing to anchor a suggestion to
 *
 * Button labels are taken verbatim from the live shelf, schedule, and
 * skin-profile entry points so they match the real flows the user can
 * complete from this page.
 */

export function NoSkinProfileEmptyState() {
  const t = useTranslations("todaysSuggestion.empty.skinProfile");
  return (
    <div className={emptyShellClass}>
      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-accent-soft text-accent-strong">
        <UserCircle className="h-5 w-5" />
      </div>
      <h2 className="text-base font-bold">{t("title")}</h2>
      <p className="mx-auto mt-1.5 max-w-[340px] text-[13px] leading-relaxed text-muted">
        {t("body")}
      </p>
      <Link
        href="/skin-profile"
        className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-strong)]"
      >
        <Play className="h-3.5 w-3.5" />
        {t("cta")}
      </Link>
      <p className="mt-2.5 text-[11px] text-muted">{t("privacy")}</p>
    </div>
  );
}

export function NoShelfEmptyState() {
  const t = useTranslations("todaysSuggestion.empty.shelf");
  return (
    <div className={emptyShellClass}>
      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-[color:var(--secondary-soft)] text-[color:var(--secondary)]">
        <Package className="h-5 w-5" />
      </div>
      <h2 className="text-base font-bold">{t("title")}</h2>
      <p className="mx-auto mt-1.5 max-w-[340px] text-[13px] leading-relaxed text-muted">
        {t("body")}
      </p>
      <Link
        href="/shelf/new"
        className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-strong)]"
      >
        <Plus className="h-3.5 w-3.5" />
        {t("cta")}
      </Link>
      <p className="mt-2.5 text-[11px] leading-snug text-muted">{t("note")}</p>
    </div>
  );
}

export function NoScheduleEmptyState() {
  const t = useTranslations("todaysSuggestion.empty.schedule");
  return (
    <div className={emptyShellClass}>
      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-[color:var(--note-cool-bg)] text-[color:var(--note-cool-fg)]">
        <CalendarClock className="h-5 w-5" />
      </div>
      <h2 className="text-base font-bold">{t("title")}</h2>
      <p className="mx-auto mt-1.5 max-w-[340px] text-[13px] leading-relaxed text-muted">
        {t("body")}
      </p>
      <div className="mt-3 flex flex-col items-stretch gap-1.5">
        <Link
          href="/schedule?preset=every_day"
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-strong)]"
        >
          <Zap className="h-3.5 w-3.5" />
          {t("ctaEveryDay")}
        </Link>
        <Link
          href="/schedule"
          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition hover:bg-surface-muted"
        >
          <CalendarPlus className="h-3.5 w-3.5" />
          {t("ctaScratch")}
        </Link>
      </div>
      <p className="mt-2.5 text-[11px] text-muted">{t("note")}</p>
    </div>
  );
}

/**
 * Recoverable empty: today happens to have no slot for the current daypart
 * yet. The suggestion engine has nothing to render right now, but tomorrow
 * is fine. Encourages the user to log today's photo while they wait.
 */
export function NoCurrentSlotEmptyState({
  nextSlotLabel,
}: {
  nextSlotLabel: string;
}) {
  const t = useTranslations("todaysSuggestion.empty.recoverable");
  return (
    <div className="rounded-3xl border border-dashed border-border bg-surface-muted px-5 py-8 text-center">
      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-accent-soft text-accent-strong">
        <MoonStar className="h-5 w-5" />
      </div>
      <h2 className="text-base font-bold">{t("title")}</h2>
      <p className="mx-auto mt-1.5 max-w-[380px] text-[13px] leading-relaxed text-muted">
        {t("body", { nextSlotLabel })}
      </p>
      <div className="mt-3 flex flex-wrap justify-center gap-1.5">
        <Link
          href="/journal/upload"
          className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--accent)] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[color:var(--accent-strong)]"
        >
          <Camera className="h-3.5 w-3.5" />
          {t("ctaPhoto")}
        </Link>
        <Link
          href="/schedule"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-foreground transition hover:bg-surface-muted"
        >
          <CalendarPlus className="h-3.5 w-3.5" />
          {t("ctaAddSlot")}
        </Link>
      </div>
    </div>
  );
}

const emptyShellClass = cn(
  "rounded-3xl border border-dashed border-[color:var(--border-strong)] bg-surface px-5 py-9 text-center",
);
