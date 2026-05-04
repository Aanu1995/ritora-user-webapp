"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ChevronRight,
  CircleSlash,
  Cloud,
  Coffee,
  Compass,
  Droplet,
  Flame,
  Flower2,
  Heart,
  Leaf,
  Mountain,
  Pencil,
  Smile,
  Snowflake,
  Sprout,
  ThermometerSun,
  Trees,
  Waves,
  Wind,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  SuggestionModeBadge,
  SuggestionStatusPill,
} from "@/components/today-suggestion/mode-badge";
import { SuggestionDaypartIcon } from "@/components/today-suggestion/daypart-icon";
import { formatSlotTime12h } from "@/lib/suggestion-daypart";
import type {
  SuggestionHistoryDay,
  SuggestionHistorySlotSummary,
} from "@/types/suggestions";

/**
 * One day card on the History list page (mockup 15). Renders the day
 * header (date, mood, hydration trend, weather, reaction signal) plus a
 * stack of slot rows. Each row links to the day-detail view at /history/[date].
 */
export function HistoryDayCard({ day }: { day: SuggestionHistoryDay }) {
  const t = useTranslations("history.dayCard");
  return (
    <article className="mb-6">
      <header className="mb-2.5 flex items-center gap-3">
        <DayPhotoTile day={day} />
        <div className="min-w-0">
          <h3 className="font-display text-[17px] font-bold leading-tight text-foreground">
            {formatHeaderDate(day.date)}
          </h3>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted">
            {day.moodScore !== null ? (
              <span className="inline-flex items-center gap-1">
                <Smile className="h-3 w-3" />
                {t("mood", { score: day.moodScore })}
              </span>
            ) : null}
            {day.hydrationTrend !== null ? (
              <span className="inline-flex items-center gap-1">
                <Droplet className="h-3 w-3" />
                {t(`hydration.${day.hydrationTrend}`)}
              </span>
            ) : null}
            {day.reactionFlagged ? (
              <span className="inline-flex items-center gap-1 text-[color:var(--warning)]">
                <AlertTriangle className="h-3 w-3" />
                {t("mildRedness")}
              </span>
            ) : null}
            {day.weatherSummary?.temperatureCelsius !== undefined &&
            day.weatherSummary?.temperatureCelsius !== null ? (
              <span className="inline-flex items-center gap-1">
                <ThermometerSun className="h-3 w-3" />
                {Math.round(day.weatherSummary.temperatureCelsius)}°C
                {day.weatherSummary.uvIndex
                  ? `, UV ${day.weatherSummary.uvIndex}`
                  : ""}
              </span>
            ) : null}
          </div>
        </div>
      </header>

      <ol className="overflow-hidden rounded-3xl border border-border bg-surface shadow-[var(--shadow-soft)]">
        {day.slots.map((slot, index) => (
          <li
            key={`${slot.daypart}-${slot.slotTime}-${index}`}
            className={index > 0 ? "border-t border-border" : undefined}
          >
            <Link
              href={`/history/${day.date}`}
              className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-accent-soft/40"
            >
              <SuggestionDaypartIcon daypart={slot.daypart} />
              <div className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-foreground">
                  {t(`daypart.${slot.daypart}`)},{" "}
                  {formatSlotTime12h(slot.slotTime)}
                </span>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted">
                  {slot.summaryLine}
                </p>
              </div>
              <SlotStatusPills slot={slot} />
              <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
            </Link>
          </li>
        ))}
      </ol>
    </article>
  );
}

function SlotStatusPills({ slot }: { slot: SuggestionHistorySlotSummary }) {
  const t = useTranslations("history.dayCard");
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-1">
      {slot.status === "applied" ? (
        <SuggestionStatusPill variant="applied">
          {t("status.applied")}
        </SuggestionStatusPill>
      ) : null}
      {slot.status === "partial" ? (
        <SuggestionStatusPill variant="skipped">
          <CircleSlash className="h-3 w-3" />
          {t("status.partial")}
        </SuggestionStatusPill>
      ) : null}
      {slot.status === "skipped" ? (
        <SuggestionStatusPill variant="skipped">
          {t("status.skipped")}
        </SuggestionStatusPill>
      ) : null}
      {slot.status === "simplified" ? (
        <SuggestionStatusPill variant="simplified">
          {t("status.simplified")}
        </SuggestionStatusPill>
      ) : null}
      {slot.status === "missed" ? (
        <SuggestionStatusPill variant="skipped">
          {t("status.missed")}
        </SuggestionStatusPill>
      ) : null}
      {slot.hasBeenEdited ? (
        <SuggestionStatusPill variant="edited">
          <Pencil className="h-3 w-3" />
          {t("status.edited")}
        </SuggestionStatusPill>
      ) : null}
      <SuggestionModeBadge mode={slot.mode} />
    </div>
  );
}

/**
 * Curated set of "vibe" tiles. Each tuple holds:
 *   [icon, gradient-from-token, gradient-to-token, foreground-token]
 *
 * The day card picks one deterministically from the date so the same
 * day always renders the same icon (avoids jitter on refetch) but each
 * day in the list visually stands apart.
 */
/**
 * Day-level vibe icons. Audited against the rest of the product so each
 * entry is exclusive to the History day tile:
 *  - Slot rows use Sun, Sunrise, Moon (excluded)
 *  - AI features use Sparkles + the `--ai-*` colour tokens (BOTH excluded
 *    here: no AI-shaped icon and no AI gradient)
 *  - Stars excluded too because it reads as the same "AI sparkle" family
 *  - Hydration trend uses Droplet (so plural Droplets is excluded)
 *  - Insights use Lightbulb, doctor referral uses Stethoscope, edits use
 *    Pencil, etc. (all excluded)
 */
const DAY_VIBES: ReadonlyArray<{
  icon: LucideIcon;
  from: string;
  to: string;
  fg: string;
}> = [
  {
    icon: Trees,
    from: "var(--accent-soft)",
    to: "var(--daypart-evening-bg)",
    fg: "var(--accent-strong)",
  },
  {
    icon: Leaf,
    from: "var(--accent-soft)",
    to: "var(--accent-glow)",
    fg: "var(--accent-strong)",
  },
  {
    icon: Sprout,
    from: "var(--accent-soft)",
    to: "var(--surface-muted)",
    fg: "var(--accent-strong)",
  },
  {
    icon: Flower2,
    from: "var(--secondary-soft)",
    to: "var(--accent-soft)",
    fg: "var(--secondary)",
  },
  {
    icon: Heart,
    from: "var(--secondary-soft)",
    to: "var(--daypart-noon-bg)",
    fg: "var(--secondary)",
  },
  {
    icon: Flame,
    from: "var(--secondary-soft)",
    to: "var(--daypart-noon-bg)",
    fg: "var(--secondary)",
  },
  {
    icon: Coffee,
    from: "var(--note-warm-bg)",
    to: "var(--surface-muted)",
    fg: "var(--note-warm-fg)",
  },
  {
    icon: Wind,
    from: "var(--note-cool-bg)",
    to: "var(--surface-muted)",
    fg: "var(--note-cool-fg)",
  },
  {
    icon: Cloud,
    from: "var(--surface-muted)",
    to: "var(--accent-soft)",
    fg: "var(--muted)",
  },
  {
    icon: Snowflake,
    from: "var(--note-cool-bg)",
    to: "var(--accent-soft)",
    fg: "var(--note-cool-fg)",
  },
  {
    icon: Mountain,
    from: "var(--surface-muted)",
    to: "var(--note-cool-bg)",
    fg: "var(--muted)",
  },
  {
    icon: Waves,
    from: "var(--note-cool-bg)",
    to: "var(--accent-glow)",
    fg: "var(--note-cool-fg)",
  },
  {
    icon: Compass,
    from: "var(--surface-muted)",
    to: "var(--note-cool-bg)",
    fg: "var(--note-cool-fg)",
  },
];

/**
 * Stable hash of a YYYY-MM-DD string. Sums character codes; using a
 * tiny djb2 variant would also work. The output is mapped into the
 * vibe palette so consecutive days do not collide as long as the
 * palette length and increment are coprime (12 here).
 */
function pickDayVibe(date: string): (typeof DAY_VIBES)[number] {
  let hash = 0;
  for (let i = 0; i < date.length; i += 1) {
    hash = (hash * 31 + date.charCodeAt(i)) >>> 0;
  }
  return DAY_VIBES[hash % DAY_VIBES.length]!;
}

function DayPhotoTile({ day }: { day: SuggestionHistoryDay }) {
  // If a reaction was flagged we override the vibe with a warning tone so
  // the user notices that day at a glance from the list view.
  if (day.reactionFlagged) {
    return (
      <span
        aria-hidden
        className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-border"
        style={{
          background:
            "linear-gradient(160deg, var(--danger-soft), var(--note-warm-bg))",
          color: "var(--danger)",
        }}
      >
        <AlertTriangle className="h-6 w-6" />
      </span>
    );
  }
  const vibe = pickDayVibe(day.date);
  const Icon = vibe.icon;
  return (
    <span
      aria-hidden
      className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-border"
      style={{
        background: `linear-gradient(160deg, ${vibe.from}, ${vibe.to})`,
        color: vibe.fg,
      }}
    >
      <Icon className="h-6 w-6" />
    </span>
  );
}

function formatHeaderDate(date: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    }).format(new Date(`${date}T00:00:00`));
  } catch {
    return date;
  }
}
