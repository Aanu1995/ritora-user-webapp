"use client";

import { Clock, MapPin } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Fragment } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type HeaderContextSubtitleProps = {
  generatedAt: string | null;
  timeZone: string;
  city: string | null;
  className?: string;
  locationLoading?: boolean;
  headline?: string;
};

export function HeaderContextSubtitle({
  generatedAt,
  timeZone,
  city,
  className,
  locationLoading = false,
  headline,
}: HeaderContextSubtitleProps) {
  const t = useTranslations("currentContext");
  const locale = useLocale();
  const localTime = formatContextTime(generatedAt, timeZone, locale);
  const cityLabel = city?.trim() ?? "";

  const items: ContextItem[] = [];

  if (headline) {
    items.push({
      key: "headline",
      icon: null,
      ariaLabel: null,
      value: headline,
    });
  }

  if (localTime) {
    items.push({
      key: "local-time",
      icon: <Clock className="h-3 w-3" aria-hidden />,
      ariaLabel: t("localTime"),
      value: localTime,
    });
  }

  if (locationLoading || cityLabel) {
    items.push({
      key: "city",
      icon: <MapPin className="h-3 w-3" aria-hidden />,
      ariaLabel: t("city"),
      value: locationLoading ? t("loading") : cityLabel,
    });
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-1 gap-y-0.5",
        className,
      )}
    >
      {items.map((item, index) => (
        <Fragment key={item.key}>
          {index > 0 ? (
            <span aria-hidden className="text-muted/60">
              ·
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            {item.icon ? (
              <span className="inline-flex shrink-0 text-muted/80">
                {item.icon}
              </span>
            ) : null}
            {item.ariaLabel ? (
              <span className="sr-only">{item.ariaLabel}: </span>
            ) : null}
            <span className="text-foreground/80">{item.value}</span>
          </span>
        </Fragment>
      ))}
    </div>
  );
}

type ContextItem = {
  key: string;
  icon: ReactNode;
  ariaLabel: string | null;
  value: string;
};

function formatContextTime(
  generatedAt: string | null,
  timeZone: string,
  locale: string,
): string | null {
  if (!generatedAt) return null;
  const date = new Date(generatedAt);
  if (Number.isNaN(date.getTime())) return null;
  try {
    return new Intl.DateTimeFormat(locale, {
      hour: "numeric",
      minute: "2-digit",
      timeZone,
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat(locale, {
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }
}
