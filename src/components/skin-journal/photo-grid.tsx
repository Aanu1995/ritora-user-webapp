"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { buildBackendUrl } from "@/lib/media-url";
import { useAutoLoadMore } from "@/hooks/use-auto-load-more";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { SmoothImage } from "@/components/ui/smooth-image";
import { formatJournalShortDate } from "@/components/skin-journal/journal-date";
import type { JournalEntry } from "@/types/skin-journal";

interface PhotoGridProps {
  entries: JournalEntry[];
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
}

export function PhotoGrid({
  entries,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
}: PhotoGridProps) {
  const t = useTranslations("journal.photos");
  const locale = useLocale();
  const router = useRouter();
  const sentinelRef = useAutoLoadMore({
    enabled: !!onLoadMore,
    hasNextPage,
    isFetchingNextPage,
    onLoadMore: onLoadMore ?? (() => undefined),
  });

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[color:var(--border-strong)] bg-accent-soft/30 p-8 text-center text-sm text-muted">
        {t("empty")}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {entries.map((entry) => {
          const url = buildBackendUrl(entry.photo_url);
          return (
            <button
              type="button"
              key={entry.id}
              onClick={() => router.push(`/journal/days/${entry.entry_date}`)}
              className={cn(
                "group relative aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-[linear-gradient(135deg,#d6c2a3,#c2a886)] text-left transition hover:-translate-y-0.5",
                entry.has_reaction && "ring-2 ring-danger ring-offset-0",
              )}
            >
              {url ? (
                <SmoothImage
                  src={url}
                  alt={entry.entry_date}
                  className="h-full w-full"
                  sizes="(max-width: 640px) 50vw, 240px"
                />
              ) : null}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/70 to-transparent px-2.5 py-2 text-white">
                <p className="text-sm font-semibold">
                  {formatJournalShortDate(entry.entry_date, locale)}
                  {entry.has_reaction ? ` · ${t("reactionTag")}` : ""}
                </p>
              </div>
            </button>
          );
        })}
      </div>
      {hasNextPage ? (
        <div ref={sentinelRef} className="flex justify-center py-2">
          {isFetchingNextPage ? (
            <LoadingIndicator label={t("loadingMore")} size="sm" />
          ) : (
            <button
              type="button"
              className="text-xs font-semibold text-muted underline-offset-4 hover:text-foreground hover:underline"
              onClick={onLoadMore}
            >
              {t("loadMore")}
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
