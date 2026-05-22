"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatJournalShortDate } from "@/components/skin-journal/journal-date";
import { useActiveSimplification } from "@/hooks/use-skin-journal";

/**
 * Compact alert indicator that lives in the Skin Journal page header action row.
 *
 * Replaces the previous floating warning banner. When an active simplification
 * exists the button renders with a pulsing dot. Clicking it navigates straight
 * to /journal/simplification/[id]. When nothing is active the button renders
 * nothing — no header chrome reserved.
 */
export function JournalAlertButton() {
  const t = useTranslations("journal.simplification");
  const locale = useLocale();
  const router = useRouter();
  const { data } = useActiveSimplification();

  if (!data) return null;

  const startedDate = data.started_at
    ? formatJournalShortDate(data.started_at.slice(0, 10), locale)
    : "";
  const tooltipBody = t("bannerBody", { date: startedDate });

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => router.push(`/journal/simplification/${data.id}`)}
            aria-label={`${t("bannerTitle")} — ${tooltipBody}`}
            className={cn(
              "relative grid h-9 w-9 cursor-pointer place-items-center rounded-full",
              "border border-[color:var(--warning-border)] bg-warning-soft text-[color:var(--warning)]",
              "transition hover:bg-[color:var(--warning)] hover:text-white",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--warning)]/40",
            )}
          >
            <AlertTriangle className="h-4 w-4" />
            <span
              aria-hidden
              className="absolute -right-0.5 -top-0.5 grid h-3 w-3 place-items-center rounded-full bg-danger"
            >
              <span className="absolute inset-0 animate-ping rounded-full bg-danger/60" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-white" />
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="end" className="max-w-xs">
          <p className="text-sm font-semibold">{t("bannerTitle")}</p>
          <p className="mt-0.5 text-xs text-muted">{tooltipBody}</p>
          <p className="mt-1 text-[11px] text-accent-strong">
            {t("viewDetails")}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
