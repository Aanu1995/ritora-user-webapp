"use client";

import { useTranslations } from "next-intl";
import { Layers, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SmartPicksMode } from "@/types/smart-picks";

interface ModeSwitchProps {
  value: SmartPicksMode;
  onChange: (value: SmartPicksMode) => void;
}

const MODES: { value: SmartPicksMode; icon: typeof Layers }[] = [
  { value: "refine", icon: Layers },
  { value: "starter", icon: Package },
];

export function ModeSwitch({ value, onChange }: ModeSwitchProps) {
  const t = useTranslations("smartPicks.page");

  return (
    <div
      className="inline-flex gap-0.5 rounded-full border border-border bg-surface-muted p-1"
      role="group"
      aria-label={t("mode.label")}
    >
      {MODES.map(({ value: modeValue, icon: Icon }) => {
        const active = value === modeValue;
        return (
          <button
            key={modeValue}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(modeValue)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition",
              active
                ? "bg-surface text-foreground shadow-soft"
                : "text-muted hover:text-foreground",
            )}
          >
            <Icon className="h-[13px] w-[13px]" aria-hidden="true" />
            {t(`mode.${modeValue}`)}
          </button>
        );
      })}
    </div>
  );
}
