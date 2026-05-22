"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useJournalUiStore } from "@/stores/journal-ui-store";

const TIPS = [
  { key: "naturalLight", emoji: "☀️" },
  { key: "noMirror", emoji: "🚫" },
  { key: "neutralFace", emoji: "😐" },
  { key: "sameTime", emoji: "⏰" },
  { key: "distance", emoji: "📏" },
];

type Layout = "horizontal" | "vertical";

export function UploadGuidanceCard({
  layout = "horizontal",
}: {
  layout?: Layout;
}) {
  const t = useTranslations("journal.upload");
  const tTips = useTranslations("journal.upload.tips");
  const collapsed = useJournalUiStore((s) => s.guidanceCollapsed);
  const setCollapsed = useJournalUiStore((s) => s.setGuidanceCollapsed);

  const isVertical = layout === "vertical";
  const tipsBase = isVertical
    ? "mt-2 flex-1 flex-col gap-1.5"
    : "mt-2 grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-5";
  const tipsDisplay = isVertical
    ? collapsed
      ? "hidden lg:flex"
      : "flex"
    : collapsed
      ? "hidden lg:grid"
      : "grid";
  const tipsGridClass = `${tipsDisplay} ${tipsBase}`;
  const subtitleClass = collapsed
    ? "mt-0.5 hidden text-xs text-muted lg:block"
    : "mt-0.5 text-xs text-muted";
  const containerClass = isVertical
    ? "flex h-full flex-col rounded-2xl border border-[color:var(--border-strong)] bg-accent-soft/30 p-3"
    : "rounded-2xl border border-[color:var(--border-strong)] bg-accent-soft/30 p-3";

  return (
    <div className={containerClass}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">{t("guidanceTitle")}</p>
        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="text-xs underline underline-offset-4 lg:hidden"
        >
          {collapsed ? t("showTips") : t("hideTips")}
        </Button>
      </div>
      <p className={subtitleClass}>{t("guidanceSubtitle")}</p>
      <div className={tipsGridClass}>
        {TIPS.map(({ key, emoji }) => (
          <div
            key={key}
            className={`flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2 ${
              isVertical ? "flex-1" : ""
            }`}
          >
            <div
              aria-hidden
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent-soft text-[18px] leading-none"
            >
              {emoji}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold leading-tight">
                {tTips(`${key}.title`)}
              </p>
              <p className="mt-0.5 text-[13px] leading-[1.5] text-muted">
                {tTips(`${key}.body`)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
