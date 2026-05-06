"use client";

import { useTranslations } from "next-intl";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function chipClasses(selected: boolean, muted = false) {
  return [
    "rounded-full border px-3.5 py-1.5 text-xs font-medium transition cursor-pointer",
    selected
      ? "border-accent-strong bg-accent-soft text-accent-strong"
      : muted
        ? "border-border text-muted hover:border-accent/40"
        : "border-border text-foreground hover:border-accent/40",
  ].join(" ");
}

export function FieldHeader({
  question,
  why,
}: {
  question: string;
  why: string;
}) {
  const t = useTranslations("skinProfile.medicalSafety");

  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm font-semibold text-foreground">{question}</p>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="cursor-pointer rounded-full border border-dashed border-border-strong px-2.5 py-0.5 text-[11px] text-muted hover:bg-accent-soft"
          >
            ? {t("whyWeAsk")}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-72 text-xs leading-relaxed">
          {why}
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function SectionShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1 divide-y divide-border rounded-2xl border border-border bg-surface px-5">
      {children}
    </div>
  );
}
