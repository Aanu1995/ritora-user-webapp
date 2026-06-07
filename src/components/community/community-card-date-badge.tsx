"use client";

import { useLocale } from "next-intl";
import { Clock } from "lucide-react";
import { parseUtcDate, utcNow } from "@/lib/dayjs";
import { Badge } from "./community-shared";

type PublishedDateBadgeProps = {
  createdAt: string;
};

export function PublishedDateBadge({ createdAt }: PublishedDateBadgeProps) {
  const locale = useLocale();
  const publishedDate = parseUtcDate(createdAt);

  if (!publishedDate) {
    return null;
  }

  const isRecent = publishedDate.isAfter(utcNow().subtract(30, "day"));
  const publishedAbsolute = publishedDate.locale(locale).format("LL");
  const publishedRelative = publishedDate.locale(locale).fromNow();

  return (
    <Badge tone={isRecent ? "accent" : "muted"}>
      <Clock className="h-3 w-3" />
      <time
        dateTime={createdAt}
        title={publishedAbsolute}
        className="whitespace-nowrap"
      >
        {publishedRelative}
      </time>
    </Badge>
  );
}
