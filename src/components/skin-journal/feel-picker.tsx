"use client";

import { useTranslations } from "next-intl";
import { OVERALL_FEELS, type OverallFeel } from "@/types/skin-journal";
import { Chip } from "./chip";

interface FeelPickerProps {
  value?: OverallFeel | null;
  onChange?: (value: OverallFeel) => void;
}

export function FeelPicker({ value, onChange }: FeelPickerProps) {
  const t = useTranslations("journal.feels");
  return (
    <div className="flex flex-wrap gap-1.5">
      {OVERALL_FEELS.map((feel) => (
        <Chip
          key={feel}
          asButton
          selected={value === feel}
          onClick={() => onChange?.(feel)}
        >
          {t(feel)}
        </Chip>
      ))}
    </div>
  );
}
