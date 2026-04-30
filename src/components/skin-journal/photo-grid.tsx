"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { buildBackendUrl } from "@/lib/media-url";
import { formatJournalShortDate } from "@/components/skin-journal/journal-date";
import type { JournalEntry } from "@/types/skin-journal";

interface PhotoGridProps {
  entries: JournalEntry[];
}

export function PhotoGrid({ entries }: PhotoGridProps) {
  const t = useTranslations("journal.photos");
  const locale = useLocale();
  const router = useRouter();

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface-muted p-8 text-center text-sm text-muted">
        {t("empty")}
      </div>
    );
  }

  return (
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
              <Image
                src={url}
                alt={entry.entry_date}
                fill
                unoptimized
                sizes="(max-width: 640px) 50vw, 240px"
                className="object-cover"
              />
            ) : null}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/70 to-transparent px-2.5 py-2 text-white">
              <p className="text-sm font-semibold">
                {formatJournalShortDate(entry.entry_date, locale)}
                {entry.has_reaction ? ` · ${t("reactionTag")}` : ""}
              </p>
              <span className="mt-0.5 inline-block rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">
                {entry.angle.replace("_", " ")}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
