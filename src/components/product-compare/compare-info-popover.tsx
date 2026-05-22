"use client";

import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Variant = "quickCheck" | "shelf";

export function CompareInfoPopover({ variant }: { variant: Variant }) {
  const t = useTranslations(`productCompare.${variant}.sheet.info`);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={t("trigger")}
          className="inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted transition hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
        >
          <Info className="h-3.5 w-3.5" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 max-w-[calc(100vw-2rem)]">
        <p className="font-display text-sm font-bold text-foreground">
          {t("title")}
        </p>
        <p className="mt-1 text-xs leading-snug text-muted">{t("body")}</p>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-xs leading-snug text-foreground/85 marker:text-muted sm:text-[13px]">
          <li>{t("bullet1")}</li>
          <li>{t("bullet2")}</li>
          <li>{t("bullet3")}</li>
          <li>{t("bullet4")}</li>
        </ul>
      </PopoverContent>
    </Popover>
  );
}
