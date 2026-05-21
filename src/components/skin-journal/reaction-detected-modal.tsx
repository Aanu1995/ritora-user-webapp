"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Chip } from "./chip";
import { safeDynamicTranslation } from "./safe-translation";
import type { ReactionSeverity } from "@/types/skin-journal";

interface ReactionDetectedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  severity: ReactionSeverity;
  indicators: string[];
  date: string;
  simplifyDisabled?: boolean;
  onSimplify: () => void;
  onKeep: () => void;
}

export function ReactionDetectedModal({
  open,
  onOpenChange,
  severity,
  indicators,
  date,
  simplifyDisabled = false,
  onSimplify,
  onKeep,
}: ReactionDetectedModalProps) {
  const t = useTranslations("journal.reaction");
  const tIndicators = useTranslations("journal.indicators");
  const isSevere = severity === "severe";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-start gap-3">
            <span
              className={
                isSevere
                  ? "grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[color:var(--danger-soft)] text-danger"
                  : "grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-warning-soft text-[color:var(--warning)]"
              }
            >
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <AlertDialogTitle className="text-lg font-bold">
                {isSevere ? t("severeTitle") : t("modalTitle")}
              </AlertDialogTitle>
              <AlertDialogDescription className="mt-1.5 text-sm leading-relaxed text-muted">
                {isSevere
                  ? t("severeLede")
                  : t("modalLede", {
                      date,
                      comparedNote: t("comparedWorse"),
                    })}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="mt-3 rounded-xl border border-[color:var(--border-strong)] bg-accent-soft/30 px-3.5 py-3">
          <p className="mb-1.5 text-xs text-muted">{t("indicatorsTitle")}</p>
          <div className="flex flex-wrap gap-1.5">
            {indicators.map((ind) => (
              <Chip
                key={ind}
                variant={isSevere ? "danger" : "warning"}
                selected
              >
                {safeDynamicTranslation(tIndicators, ind, ind)}
              </Chip>
            ))}
          </div>
          {isSevere ? (
            <p className="mt-2 text-xs font-bold">{t("severeWarning")}</p>
          ) : null}
        </div>

        {!isSevere ? (
          <p className="mt-2 text-[11px] leading-relaxed text-muted">
            <strong className="text-foreground">{t("disclaimer")}</strong>
          </p>
        ) : null}

        <AlertDialogFooter className="mt-4 flex-col gap-2 sm:flex-col">
          <AlertDialogAction
            className="w-full bg-accent-strong text-white hover:bg-accent"
            disabled={simplifyDisabled}
            onClick={onSimplify}
          >
            {isSevere ? t("severePrimary") : t("primaryCta")}
          </AlertDialogAction>
          <AlertDialogCancel
            className="w-full"
            onClick={onKeep}
          >
            {isSevere ? t("severeSecondary") : t("secondaryCta")}
          </AlertDialogCancel>
        </AlertDialogFooter>
        <p className="mt-2 text-center text-xs">
          <button
            type="button"
            className="font-semibold text-accent-strong hover:underline"
          >
            {t("howWeDecide")}
          </button>
        </p>
      </AlertDialogContent>
    </AlertDialog>
  );
}
