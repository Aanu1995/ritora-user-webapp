"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Download, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SmoothImage } from "@/components/ui/smooth-image";
import { buildBackendUrl } from "@/lib/media-url";
import { cn } from "@/lib/utils";
import type { Wrapped } from "@/types/skin-journal";

interface WrappedListProps {
  wrapped: Wrapped[];
  minPhotos?: number;
}

const STATUS_CLASS: Record<
  Wrapped["status"],
  string
> = {
  not_enough_photos: "text-muted",
  ready_to_generate: "text-accent-strong font-semibold",
  pending: "text-muted",
  generating: "text-[color:var(--warning)] font-semibold",
  ready: "text-[color:var(--ai-strong)] font-semibold",
  failed: "text-danger font-semibold",
};

function formatPeriod(wrapped: Wrapped): string {
  if (wrapped.period_kind === "monthly") {
    const [year, month] = wrapped.period_start.split("-");
    const m = new Date(Date.UTC(Number(year), Number(month) - 1, 1));
    return m.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
  }
  if (wrapped.period_kind === "quarterly") {
    const month = parseInt(wrapped.period_start.split("-")[1], 10);
    const q = Math.ceil(month / 3);
    const year = wrapped.period_start.split("-")[0];
    return `Q${q} ${year}`;
  }
  return wrapped.period_start.slice(0, 4);
}

export function WrappedList({ wrapped, minPhotos = 3 }: WrappedListProps) {
  const t = useTranslations("journal.wrapped");
  const tStatus = useTranslations("journal.wrapped.status");
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {wrapped.map((wrapped) => {
        const thumbs =
          wrapped.manifest?.entries.slice(0, 3).map((e) => e.photo_url) ?? [];
        const padded = thumbs.concat(["", "", ""]).slice(0, 3);
        const photos = wrapped.manifest?.entries.length ?? wrapped.photo_count ?? 0;

        return (
          <div
            key={wrapped.id}
            className="overflow-hidden rounded-2xl border border-border bg-surface"
          >
            <div className="grid aspect-[3/1] grid-cols-3 gap-0.5 bg-background">
              {padded.map((url, i) => (
                <div
                  key={i}
                  className={cn(
                    "relative",
                    !url && "opacity-40",
                  )}
                  style={{
                    background:
                      i === 0
                        ? "linear-gradient(135deg,#d6c2a3,#c2a886)"
                        : i === 1
                          ? "linear-gradient(135deg,#d2bf99,#b09971)"
                          : "linear-gradient(135deg,#c8b58a,#9d8763)",
                  }}
                >
                  {url ? (
                    <SmoothImage
                      src={buildBackendUrl(url) ?? url}
                      alt=""
                      sizes="120px"
                      className="h-full w-full"
                    />
                  ) : null}
                </div>
              ))}
            </div>
            <div className="p-3.5">
              <p className="text-sm font-bold">{formatPeriod(wrapped)}</p>
              <p className={cn("text-[11px]", STATUS_CLASS[wrapped.status])}>
                {wrapped.status === "ready"
                  ? tStatus("ready", { photos })
                  : wrapped.status === "generating"
                    ? tStatus("generating", { photos })
                    : wrapped.status === "ready_to_generate"
                      ? tStatus("ready_to_generate", { photos })
                      : wrapped.status === "not_enough_photos"
                        ? tStatus("not_enough_photos", { min: minPhotos })
                        : wrapped.status === "failed"
                          ? tStatus("failed")
                          : tStatus("pending")}
              </p>
            </div>
            <div className="flex gap-1.5 px-3.5 pb-3.5">
              {wrapped.status === "ready" ? (
                <>
                  <Button
                    size="sm"
                    onClick={() => router.push(`/journal/wrapped/${wrapped.id}`)}
                  >
                    <Play className="h-3.5 w-3.5" />
                    {t("play")}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-3.5 w-3.5" />
                    {t("save")}
                  </Button>
                </>
              ) : wrapped.status === "generating" ||
                wrapped.status === "pending" ||
                wrapped.status === "ready_to_generate" ? (
                <Button variant="ghost" size="sm" disabled>
                  {t("almostReady")}
                </Button>
              ) : (
                <Button variant="ghost" size="sm" disabled>
                  {t("notYet")}
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
