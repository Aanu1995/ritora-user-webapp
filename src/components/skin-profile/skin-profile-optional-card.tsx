"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Lock } from "lucide-react";
import type { MouseEvent, ReactNode } from "react";
import { AppRoute } from "@/constants/app-routes";
import { saveCurrentAppScrollPosition } from "@/lib/app-scroll-restoration";

interface OptionalCardProps {
  href?: string;
  onAction?: () => void;
  icon: ReactNode;
  iconTone?: "accent" | "warning" | "warm" | "violet";
  title: string;
  description: string;
  time: string;
  encrypted?: boolean;
  consentRequired?: boolean;
  filled?: boolean;
  filledLabel?: string;
  notApplicable?: boolean;
  notApplicableLabel?: string;
}

export function OptionalCard({
  href,
  onAction,
  icon,
  iconTone = "accent",
  title,
  description,
  time,
  encrypted,
  consentRequired,
  filled,
  filledLabel,
  notApplicable,
  notApplicableLabel,
}: OptionalCardProps) {
  const tOverview = useTranslations("skinProfile.overview");
  const toneClass =
    iconTone === "warning"
      ? "bg-warning-soft text-warning"
      : iconTone === "warm"
        ? "bg-secondary-soft text-secondary"
        : iconTone === "violet"
          ? "bg-ai-bg text-ai-fg"
          : "bg-accent-soft text-accent-strong";

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4 transition-colors">
      <div
        className={`grid h-10 w-10 flex-none place-items-center rounded-xl text-base font-semibold ${toneClass}`}
        aria-hidden
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          {encrypted ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-ai-bg px-2 py-0.5 text-[10px] font-semibold text-ai-fg">
              <Lock className="h-2.5 w-2.5" strokeWidth={2.5} />
              {tOverview("encryptedBadge")}
            </span>
          ) : null}
          {notApplicable ? (
            <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-semibold text-muted">
              {notApplicableLabel ?? tOverview("notApplicable")}
            </span>
          ) : filled && filledLabel ? (
            <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold text-accent-strong">
              {filledLabel}
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-xs text-muted">{description}</p>
        {!notApplicable ? (
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-muted">
            <span>{time}</span>
            {consentRequired ? (
              <>
                <span aria-hidden>·</span>
                <span>{tOverview("consentRequired")}</span>
              </>
            ) : null}
          </div>
        ) : null}
      </div>
      {!notApplicable ? (
        <div className="flex flex-none flex-col items-end gap-2">
          <OptionalCardAction
            href={href}
            onAction={onAction}
            filled={Boolean(filled)}
          />
        </div>
      ) : null}
    </div>
  );
}

function OptionalCardAction({
  href,
  onAction,
  filled,
}: {
  href?: string;
  onAction?: () => void;
  filled: boolean;
}) {
  const tOverview = useTranslations("skinProfile.overview");
  const className = filled
    ? "rounded-full border border-border-strong bg-surface px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-accent-soft"
    : "rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-white shadow-soft hover:bg-accent-strong";
  const label = filled ? tOverview("review") : tOverview("addNow");

  if (href) {
    return (
      <Link
        href={href}
        onClick={(event) => {
          if (isPlainLeftClick(event)) {
            saveCurrentAppScrollPosition(AppRoute.SkinProfile);
          }
        }}
        className={className}
      >
        {label}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onAction} className={className}>
      {label}
    </button>
  );
}

function isPlainLeftClick(event: MouseEvent<HTMLAnchorElement>): boolean {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}
