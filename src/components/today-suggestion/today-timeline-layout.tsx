"use client";

import Link from "next/link";
import { Bell, Clock4, Moon, MoonStar, Sun, Sunrise } from "lucide-react";
import { useTranslations } from "next-intl";
import { NOTIFICATION_SETTINGS_ROUTE } from "@/constants/app-routes";
import type { SuggestionDaypart } from "@/types/suggestions";

export function LockedDayBanners({
  leadTimeMinutes,
}: {
  leadTimeMinutes: number;
}) {
  const t = useTranslations("todaysSuggestion.lockedDay");
  const leadTime = formatLeadTime(leadTimeMinutes, t);
  return (
    <section className="mb-3 mt-3 rounded-[18px] border border-[color:var(--note-cool-border)] bg-[color:var(--note-cool-bg)] px-4 py-3.5">
      <span
        aria-hidden
        className="grid h-8 w-8 place-items-center rounded-[10px] bg-[rgba(99,102,241,0.16)] text-[color:var(--note-cool-fg)]"
      >
        <MoonStar className="h-4 w-4" />
      </span>
      <p className="mt-2 text-sm font-semibold text-[color:var(--note-cool-fg)]">
        {t("title")}
      </p>
      <p className="mt-0.5 text-[12.5px] leading-[1.45] text-muted">
        {t("body")}
      </p>
      <ul className="mt-2.5 flex flex-col gap-1.5">
        <li className="flex items-start gap-2 text-[12.5px] leading-[1.45] text-foreground">
          <Clock4 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--note-cool-fg)]" />
          <span>{t("leadFact", { leadTime })}</span>
        </li>
        <li className="flex items-start gap-2 text-[12.5px] leading-[1.45] text-foreground">
          <Bell className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--note-cool-fg)]" />
          <span>
            {t.rich("notifyFact", {
              link: (chunks) => (
                <Link
                  href={NOTIFICATION_SETTINGS_ROUTE}
                  className="font-semibold text-[color:var(--note-cool-fg)] hover:underline"
                >
                  {chunks}
                </Link>
              ),
            })}
          </span>
        </li>
      </ul>
    </section>
  );
}

function formatLeadTime(
  minutes: number,
  t: ReturnType<typeof useTranslations>,
): string {
  const safeMinutes = Number.isFinite(minutes)
    ? Math.max(1, Math.round(minutes))
    : 120;
  const hours = Math.floor(safeMinutes / 60);
  const remainingMinutes = safeMinutes % 60;

  if (hours === 0) {
    return t(safeMinutes === 1 ? "leadTimeMinute" : "leadTimeMinutes", {
      count: safeMinutes,
    });
  }
  if (remainingMinutes === 0) {
    return t(hours === 1 ? "leadTimeHour" : "leadTimeHours", {
      count: hours,
    });
  }
  return [
    t(hours === 1 ? "leadTimeHour" : "leadTimeHours", { count: hours }),
    t(remainingMinutes === 1 ? "leadTimeMinute" : "leadTimeMinutes", {
      count: remainingMinutes,
    }),
  ].join(" ");
}

export function SectionGroup({
  daypart,
  children,
}: {
  daypart: SuggestionDaypart;
  children: React.ReactNode;
}) {
  const t = useTranslations("todaysSuggestion.section");
  const Icon =
    daypart === "evening" ? Moon : daypart === "morning" ? Sunrise : Sun;
  return (
    <section className="mt-6">
      <p className="mb-2 ml-1 inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.1em] text-muted">
        <Icon className="h-3 w-3" />
        {t(daypart)}
      </p>
      {children}
    </section>
  );
}
