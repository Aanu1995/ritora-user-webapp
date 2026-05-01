"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { buildBackendUrl } from "@/lib/media-url";
import type { Wrapped } from "@/types/skin-journal";

interface WrappedPlayerProps {
  wrapped: Wrapped;
}

export function getSafeWrappedFrameIndex(index: number, total: number): number {
  if (total <= 0) {
    return 0;
  }
  return Math.min(Math.max(index, 0), total - 1);
}

export function WrappedPlayer({ wrapped }: WrappedPlayerProps) {
  const t = useTranslations("journal.wrapped.viewer");
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const total = wrapped.manifest?.entries.length ?? 0;
  const holdMs = wrapped.manifest?.timing?.hold_ms ?? 1400;

  useEffect(() => {
    if (!playing || total === 0) return;
    const timer = setTimeout(() => {
      setIndex((i) => (i + 1) % total);
    }, holdMs);
    return () => clearTimeout(timer);
  }, [playing, index, total, holdMs]);

  if (total === 0) {
    return (
      <div className="grid place-items-center text-sm text-muted">
        {t("noFrames")}
      </div>
    );
  }

  const safeIndex = getSafeWrappedFrameIndex(index, total);
  const current = wrapped.manifest!.entries[safeIndex];
  const previous = wrapped.manifest!.entries
    .slice(0, safeIndex)
    .map((e) => e.entry_id);

  return (
    <div className="mx-auto flex max-w-[360px] flex-col items-center">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-black">
        {wrapped.manifest!.entries.map((entry, i) => (
          <div
            key={entry.entry_id}
            className="absolute inset-0 transition-opacity duration-500"
            style={{ opacity: i === safeIndex ? 1 : 0 }}
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg,#d6c2a3 0%,#c2a886 50%,#a78c66 100%)",
              }}
            />
            {entry.photo_url ? (
              <Image
                src={buildBackendUrl(entry.photo_url) ?? ""}
                alt={t("frameAlt", { date: entry.entry_date })}
                fill
                unoptimized
                sizes="360px"
                priority={i === 0}
                className="object-cover"
              />
            ) : null}
          </div>
        ))}

        <div className="absolute left-3 right-3 top-3 flex gap-1">
          {wrapped.manifest!.entries.map((entry) => (
            <span
              key={entry.entry_id}
              className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/25"
            >
              <span
                className="block h-full bg-white/85 transition-[width] duration-500"
                style={{
                  width: previous.includes(entry.entry_id)
                    ? "100%"
                    : entry.entry_id === current.entry_id
                      ? "60%"
                      : "0%",
                }}
              />
            </span>
          ))}
        </div>

        <div className="absolute bottom-14 left-0 right-0 flex justify-center gap-4">
          <button
            type="button"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            aria-label={t("previous")}
            className="grid h-9 w-9 place-items-center rounded-full bg-foreground/60 text-white"
          >
            <SkipBack className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? t("pause") : t("play")}
            className="grid h-9 w-9 place-items-center rounded-full bg-foreground/60 text-white"
          >
            {playing ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
            aria-label={t("next")}
            className="grid h-9 w-9 place-items-center rounded-full bg-foreground/60 text-white"
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>

        {current.caption ? (
          <div
            className="absolute bottom-3 left-3 right-3 text-sm font-semibold text-white"
            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}
          >
            {t("frameCaption", {
              date: current.entry_date,
              caption: current.caption,
            })}
          </div>
        ) : null}
      </div>
      <p className="mt-3 text-center text-xs text-muted">
        {t("captionsAuto", {
          count: total,
          label: wrapped.period_kind,
        })}
      </p>
    </div>
  );
}
