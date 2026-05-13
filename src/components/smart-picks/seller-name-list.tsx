"use client";

import { useTranslations } from "next-intl";
import { Store } from "lucide-react";

interface SellerNameListProps {
  names: string[];
  className?: string;
}

export function SellerNameList({
  names,
  className = "mt-4",
}: SellerNameListProps) {
  const t = useTranslations("smartPicks.page");

  if (names.length === 0) return null;

  return (
    <div className={className}>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted">
        <Store className="h-3.5 w-3.5" aria-hidden="true" />
        {t("sellers.whereToCheck")}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {names.map((name) => (
          <span
            key={name}
            className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-foreground"
          >
            {name}
          </span>
        ))}
      </div>
      <p className="mt-2 text-xs leading-5 text-muted">
        {t("sellers.compare")}
      </p>
    </div>
  );
}
