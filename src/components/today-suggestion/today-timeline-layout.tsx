"use client";

import Link from "next/link";
import { Bell, Moon, MoonStar, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { NOTIFICATION_SETTINGS_ROUTE } from "@/constants/app-routes";
import type { SuggestionDaypart } from "@/types/suggestions";

export function LockedDayBanners() {
  const t = useTranslations("todaysSuggestion.lockedDay");
  return (
    <div className="mb-3 mt-3 flex flex-col gap-2">
      <div className="flex items-start gap-3 rounded-[18px] border border-[color:var(--note-cool-border)] bg-[color:var(--note-cool-bg)] px-4 py-3.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-[rgba(99,102,241,0.16)] text-[color:var(--note-cool-fg)]">
          <MoonStar className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="mb-0.5 text-sm font-semibold text-[color:var(--note-cool-fg)]">
            {t("leadTitle")}
          </p>
          <p className="text-[12.5px] leading-[1.45] text-muted">
            {t("leadBody")}
          </p>
        </div>
      </div>
      <div className="flex items-start gap-3 rounded-[18px] border border-[color:var(--ai-border)] bg-[color:var(--ai-soft)] px-4 py-3.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-[color:var(--ai-bg)] text-[color:var(--ai-strong)]">
          <Bell className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="mb-0.5 text-sm font-semibold text-[color:var(--ai-fg)]">
            {t("notifyTitle")}
          </p>
          <p className="text-[12.5px] leading-[1.45] text-muted">
            {t.rich("notifyBody", {
              link: (chunks) => (
                <Link
                  href={NOTIFICATION_SETTINGS_ROUTE}
                  className="font-semibold text-[color:var(--ai-fg)]"
                >
                  {chunks}
                </Link>
              ),
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

export function SectionGroup({
  daypart,
  children,
}: {
  daypart: SuggestionDaypart;
  children: React.ReactNode;
}) {
  const t = useTranslations("todaysSuggestion.section");
  const Icon = daypart === "evening" ? Moon : Sun;
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
