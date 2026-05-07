"use client";

import { AlertTriangle, CircleSlash, LoaderCircle, Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  formatIsoTime12h,
  formatRelativeUntil,
  formatSlotTime12h,
} from "@/lib/suggestion-daypart";
import { SuggestionDaypartIcon } from "@/components/today-suggestion/daypart-icon";
import { SuggestionStatusPill } from "@/components/today-suggestion/mode-badge";
import type { TodaysSuggestionSlot } from "@/types/suggestions";

export function LockedSlotCard({ slot }: { slot: TodaysSuggestionSlot }) {
  const t = useTranslations("todaysSuggestion.slot");
  return (
    <article className="rounded-3xl border border-dashed border-[color:var(--border-strong)] bg-surface p-4">
      <SlotStateHeader
        slot={slot}
        label={labelForDaypart(t, slot.daypart)}
        pill={
          <SuggestionStatusPill
            variant="locked"
            icon={<Lock className="h-3 w-3" />}
          >
            {t("availableAt", {
              time: formatIsoTime12h(slot.visibleAt),
            })}
          </SuggestionStatusPill>
        }
      />
      <div className="mt-1.5 flex items-start gap-3 text-[13px] text-muted">
        <StateIcon icon={<Lock className="h-4 w-4" />} />
        <div>
          <p>{t("lockedExplainer")}</p>
          <p className="mt-1">
            {t.rich("unlocksInRich", {
              eta: formatRelativeUntil(slot.visibleAt),
              strong: (chunks) => (
                <strong className="font-semibold text-foreground">
                  {chunks}
                </strong>
              ),
            })}
          </p>
        </div>
      </div>
    </article>
  );
}

export function SlotProcessingCard({ slot }: { slot: TodaysSuggestionSlot }) {
  const t = useTranslations("todaysSuggestion.slot");
  const state = resolveProcessingState(slot.status);
  return (
    <article className="rounded-3xl border border-border bg-surface p-4 shadow-[var(--shadow-soft)]">
      <SlotStateHeader
        slot={slot}
        label={labelForDaypart(t, slot.daypart)}
        pill={
          <SuggestionStatusPill variant={state.variant} icon={state.icon}>
            {t(state.titleKey)}
          </SuggestionStatusPill>
        }
      />
      <div className="mt-1.5 flex items-start gap-3 text-[13px] text-muted">
        <StateIcon icon={state.largeIcon} />
        <p>{t(state.bodyKey)}</p>
      </div>
    </article>
  );
}

function SlotStateHeader({
  slot,
  label,
  pill,
}: {
  slot: TodaysSuggestionSlot;
  label: string;
  pill: React.ReactNode;
}) {
  return (
    <div className="py-1">
      <div className="flex items-start gap-3">
        <SuggestionDaypartIcon daypart={slot.daypart} />
        <span className="min-w-0 flex-1 font-display text-base font-bold leading-tight tracking-[-0.01em] text-foreground">
          {formatSlotTime12h(slot.slotTime)}
        </span>
        <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
          {pill}
        </div>
      </div>
      <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
        {label}
      </p>
    </div>
  );
}

function StateIcon({ icon }: { icon: React.ReactNode }) {
  return (
    <span
      aria-hidden
      className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-xl bg-surface-muted text-muted"
    >
      {icon}
    </span>
  );
}

function resolveProcessingState(status: TodaysSuggestionSlot["status"]) {
  if (status === "failed") {
    return {
      titleKey: "failed",
      bodyKey: "failedExplainer",
      variant: "skipped" as const,
      icon: <AlertTriangle className="h-3 w-3" />,
      largeIcon: <AlertTriangle className="h-4 w-4" />,
    };
  }
  if (status === "missed") {
    return {
      titleKey: "missed",
      bodyKey: "missedExplainer",
      variant: "skipped" as const,
      icon: <CircleSlash className="h-3 w-3" />,
      largeIcon: <CircleSlash className="h-4 w-4" />,
    };
  }
  return {
    titleKey: "generating",
    bodyKey: "generatingExplainer",
    variant: "awaiting" as const,
    icon: <LoaderCircle className="h-3 w-3" />,
    largeIcon: <LoaderCircle className="h-4 w-4" />,
  };
}

function labelForDaypart(
  t: (key: string) => string,
  daypart: TodaysSuggestionSlot["daypart"],
): string {
  if (daypart === "morning") return t("morningLabel");
  if (daypart === "noon") return t("noonLabel");
  return t("eveningLabel");
}
