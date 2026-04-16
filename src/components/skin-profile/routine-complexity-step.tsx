"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface RoutineComplexityStepProps {
  options: string[];
  selectedValue: string;
  errorText?: string;
  onChange: (value: string) => void;
}

export function RoutineComplexityStep({
  options,
  selectedValue,
  errorText,
  onChange,
}: RoutineComplexityStepProps) {
  const t = useTranslations("skinProfile");

  return (
    <div>
      <div className="divide-y divide-border">
        {options.map((option) => {
          const isSelected = selectedValue === option;

          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={cn(
                "flex w-full cursor-pointer items-start gap-4 py-4 text-left transition-colors first:pt-0 last:pb-0",
                isSelected ? "text-foreground" : "text-muted hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  isSelected
                    ? "border-accent-strong bg-accent-strong"
                    : "border-border",
                )}
              >
                {isSelected ? (
                  <span className="h-2 w-2 rounded-full bg-background" />
                ) : null}
              </span>
              <span>
                <span className="block text-sm font-medium">
                  {t(`options.${option}`)}
                </span>
                <span className="mt-0.5 block text-sm text-muted">
                  {t(`routineDescriptions.${option}`)}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {errorText ? (
        <p className="mt-4 text-sm text-danger" role="alert">
          {errorText}
        </p>
      ) : null}
    </div>
  );
}
