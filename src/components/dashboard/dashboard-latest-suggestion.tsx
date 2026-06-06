"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { AppRoute } from "@/constants/app-routes";
import { SuggestionSlotCard } from "@/components/today-suggestion/slot-card";
import { Button } from "@/components/ui/button";
import type { TodaysSuggestionSlot } from "@/types/suggestions";

type Props = {
  slot: TodaysSuggestionSlot;
  timeZone?: string;
  nowMs: number;
};

export function DashboardLatestSuggestion({ slot, timeZone, nowMs }: Props) {
  const t = useTranslations("dashboard.latestSuggestion");
  const tSlot = useTranslations("todaysSuggestion.slot");
  const suggestion = slot.suggestion;

  if (!suggestion) return null;

  const routineLabel = tSlot(daypartRoutineLabelKey(suggestion.daypart));

  return (
    <section aria-label={t("ariaLabel", { routine: routineLabel })}>
      <SuggestionSlotCard
        slot={slot}
        actionControls={
          <Button asChild size="sm" variant="secondary" className="flex-1">
            <Link href={AppRoute.TodaysSuggestion}>{t("recordCta")}</Link>
          </Button>
        }
        timeZone={timeZone}
        nowMs={nowMs}
      />
    </section>
  );
}

function daypartRoutineLabelKey(
  daypart: TodaysSuggestionSlot["daypart"],
): "morningLabel" | "noonLabel" | "eveningLabel" {
  if (daypart === "noon") return "noonLabel";
  if (daypart === "evening") return "eveningLabel";
  return "morningLabel";
}
