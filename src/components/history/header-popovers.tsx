"use client";

import { useEffect, useRef, useState } from "react";
import { CircleHelp, Info, Layers, Lightbulb, Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export function HistoryHeaderPopovers() {
  const t = useTranslations("history.popovers");
  const [openPopover, setOpenPopover] = useState<"overview" | "qa" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openPopover) return;
    const handleClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpenPopover(null);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenPopover(null);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [openPopover]);

  return (
    <div ref={containerRef} className="relative flex shrink-0 gap-1.5">
      <PopoverButton
        active={openPopover === "overview"}
        ariaLabel={t("overview.aria")}
        onClick={() =>
          setOpenPopover(openPopover === "overview" ? null : "overview")
        }
      >
        <Info className="h-4 w-4" />
      </PopoverButton>
      <PopoverButton
        active={openPopover === "qa"}
        ariaLabel={t("qa.aria")}
        onClick={() => setOpenPopover(openPopover === "qa" ? null : "qa")}
      >
        <CircleHelp className="h-4 w-4" />
      </PopoverButton>

      {openPopover === "overview" ? <OverviewPopover /> : null}
      {openPopover === "qa" ? <QuestionsPopover /> : null}
    </div>
  );
}

function PopoverButton({
  active,
  ariaLabel,
  onClick,
  children,
}: {
  active: boolean;
  ariaLabel: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={active}
      aria-label={ariaLabel}
      className={cn(
        "grid h-7 w-7 place-items-center rounded-full border border-[color:var(--border-strong)] bg-surface text-foreground transition hover:bg-accent-soft hover:text-accent-strong sm:h-9 sm:w-9",
        active &&
          "border-[color:var(--accent)] bg-accent-soft text-accent-strong hover:bg-accent-soft",
      )}
    >
      {children}
    </button>
  );
}

function OverviewPopover() {
  const t = useTranslations("history.popovers.overview");
  return (
    <div
      role="dialog"
      className="absolute right-0 top-[calc(100%+8px)] z-30 w-[320px] max-w-[calc(100vw-32px)] rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-hero)]"
    >
      <Caret />
      <h3 className="mb-2 font-display text-sm font-bold text-foreground">
        {t("title")}
      </h3>
      <PopoverRow
        icon={<Layers className="h-3.5 w-3.5" />}
        tone="accent"
        title={t("rows.compare.title")}
        body={t("rows.compare.body")}
      />
      <PopoverRow
        icon={<Pencil className="h-3.5 w-3.5" />}
        tone="warm"
        title={t("rows.editAnytime.title")}
        body={t("rows.editAnytime.body")}
      />
      <PopoverRow
        icon={<Lightbulb className="h-3.5 w-3.5" />}
        tone="ai"
        title={t("rows.insights.title")}
        body={t("rows.insights.body")}
      />
    </div>
  );
}

function QuestionsPopover() {
  const t = useTranslations("history.popovers.qa");
  const items = ["losingData", "whenItShows", "export"] as const;
  return (
    <div
      role="dialog"
      className="absolute right-0 top-[calc(100%+8px)] z-30 w-[320px] max-w-[calc(100vw-32px)] rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-hero)]"
    >
      <Caret />
      <h3 className="mb-2 font-display text-sm font-bold text-foreground">
        {t("title")}
      </h3>
      <ul className="flex flex-col">
        {items.map((key, index) => (
          <li
            key={key}
            className={cn(
              "py-2.5",
              index > 0 && "border-t border-border",
            )}
          >
            <p className="text-[13px] font-semibold text-foreground">
              {t(`${key}.q`)}
            </p>
            <p className="mt-0.5 text-[12.5px] leading-snug text-muted">
              {t(`${key}.a`)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Caret() {
  return (
    <span
      aria-hidden
      className="absolute right-3.5 top-[-7px] h-3 w-3 rotate-45 border-l border-t border-border bg-surface"
    />
  );
}

function PopoverRow({
  icon,
  tone,
  title,
  body,
}: {
  icon: React.ReactNode;
  tone: "accent" | "warm" | "ai";
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-2.5 border-t border-border py-2 first:border-t-0 first:pt-0">
      <span
        className={cn(
          "mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg",
          tone === "accent" && "bg-accent-soft text-accent-strong",
          tone === "warm" &&
            "bg-[color:var(--note-warm-bg)] text-[color:var(--note-warm-fg)]",
          tone === "ai" &&
            "bg-[color:var(--ai-bg)] text-[color:var(--ai-fg)]",
        )}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 text-[12.5px] leading-snug text-muted">{body}</p>
      </div>
    </div>
  );
}
