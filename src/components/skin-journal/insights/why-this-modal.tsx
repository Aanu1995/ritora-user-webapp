"use client";

import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { JournalInsight } from "@/types/skin-journal";

interface WhyThisModalProps {
  insight: JournalInsight;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WhyThisModal({
  insight,
  open,
  onOpenChange,
}: WhyThisModalProps) {
  const t = useTranslations("journal.insightsTab");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("ai.whyThisTitle")}</DialogTitle>
          <DialogDescription>{t("ai.whyThisBody")}</DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-3 text-sm">
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2">
            <dt className="text-muted">{t("ai.trigger")}</dt>
            <dd>{insight.generation_trigger}</dd>
            <dt className="text-muted">{t("ai.model")}</dt>
            <dd>{insight.metadata.model ?? t("ai.notUsed")}</dd>
            <dt className="text-muted">{t("ai.promptVersion")}</dt>
            <dd>{insight.metadata.prompt_version ?? t("ai.notUsed")}</dd>
            <dt className="text-muted">{t("ai.cache")}</dt>
            <dd>
              {insight.metadata.cache_hit ? t("ai.cacheHit") : t("ai.cacheMiss")}
            </dd>
          </dl>
          {insight.sources.length ? (
            <div>
              <p className="font-semibold">{t("ai.sources")}</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-muted">
                {insight.sources.map((source) => (
                  <li key={source.id}>{source.organization}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
