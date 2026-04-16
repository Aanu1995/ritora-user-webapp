"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface StepProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function StepProgressBar({ currentStep, totalSteps }: StepProgressBarProps) {
  const t = useTranslations("skinProfile");

  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-1 gap-1.5">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-300",
              i < currentStep ? "bg-accent-strong" : "bg-border",
            )}
          />
        ))}
      </div>
      <span className="shrink-0 text-xs text-muted">
        {t("steps.stepOf", { current: currentStep, total: totalSteps })}
      </span>
    </div>
  );
}
