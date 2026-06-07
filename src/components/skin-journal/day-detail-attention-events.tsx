"use client";

import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { useAcknowledgeEvent } from "@/hooks/use-skin-journal";
import {
  CONCERN_KEYS,
  type ConcernKey,
  type JournalEvent,
} from "@/types/skin-journal";

interface DayDetailAttentionEventsProps {
  events: JournalEvent[];
}

const ATTENTION_EVENT_SEVERITIES = new Set<JournalEvent["severity"]>([
  "warning",
  "critical",
]);

function isUnacknowledgedAttentionEvent(event: JournalEvent): boolean {
  return (
    event.acknowledged_at === null &&
    ATTENTION_EVENT_SEVERITIES.has(event.severity)
  );
}

function stringPayloadValue(
  payload: Record<string, unknown> | null,
  key: string,
): string | null {
  const value = payload?.[key];
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function numberPayloadValue(
  payload: Record<string, unknown> | null,
  key: string,
): number | null {
  const value = payload?.[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function stringArrayPayloadValue(
  payload: Record<string, unknown> | null,
  key: string,
): string[] {
  const value = payload?.[key];
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is string => typeof item === "string" && item.length > 0,
  );
}

function humanizeToken(value: string): string {
  return value.replaceAll("_", " ");
}

export function DayDetailAttentionEvents({
  events,
}: DayDetailAttentionEventsProps) {
  const t = useTranslations("journal.dayDetail");
  const tConcerns = useTranslations("journal.concerns");
  const tEvents = useTranslations("journal.events.kinds");
  const tSeverity = useTranslations("journal.severity");
  const acknowledgeEvent = useAcknowledgeEvent();
  const attentionEvents = events.filter(isUnacknowledgedAttentionEvent);

  const describeAttentionEvent = (event: JournalEvent): string => {
    const headline = stringPayloadValue(event.payload, "headline");
    if (headline) return headline;

    if (event.kind === "worsening") {
      const concern = stringPayloadValue(event.payload, "concern");
      const previous = numberPayloadValue(event.payload, "previous");
      const current = numberPayloadValue(event.payload, "current");
      const concernLabel =
        concern && CONCERN_KEYS.includes(concern as ConcernKey)
          ? tConcerns(concern as ConcernKey)
          : concern;

      if (concernLabel && previous !== null && current !== null) {
        return t("eventWorseningBody", {
          concern: concernLabel,
          previous,
          current,
        });
      }
      return t("eventWorseningFallbackBody");
    }

    if (event.kind === "reaction_detected") {
      const indicators = stringArrayPayloadValue(event.payload, "indicators")
        .map(humanizeToken)
        .join(", ");
      return indicators
        ? t("eventReactionBody", { indicators })
        : t("eventReactionFallbackBody");
    }

    if (event.kind === "dermatologist_referral") {
      const threshold = stringPayloadValue(event.payload, "threshold");
      return threshold
        ? t("eventReferralBody", { threshold })
        : t("eventReferralFallbackBody");
    }

    return t("eventGenericBody");
  };

  if (attentionEvents.length === 0) {
    return null;
  }

  return (
    <section
      aria-label={t("attentionTitle")}
      className="rounded-2xl border border-[color:var(--warning-border)] bg-warning-soft p-4"
    >
      <div className="flex items-start gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[color:var(--warning)] text-white">
          <AlertTriangle className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{t("attentionTitle")}</p>
          <div className="mt-3 space-y-2">
            {attentionEvents.map((event) => {
              const isMarkingRead =
                acknowledgeEvent.isPending &&
                acknowledgeEvent.variables === event.id;
              return (
                <div
                  key={event.id}
                  className="flex flex-col gap-3 rounded-xl border border-[color:var(--warning-border)] bg-surface/85 p-3 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">
                      {tEvents(event.kind)} · {tSeverity(event.severity)}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {describeAttentionEvent(event)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                    disabled={acknowledgeEvent.isPending}
                    onClick={() => acknowledgeEvent.mutate(event.id)}
                  >
                    {isMarkingRead ? (
                      <LoadingIndicator
                        size="sm"
                        label={t("eventMarkingRead")}
                      />
                    ) : (
                      t("eventMarkRead")
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
