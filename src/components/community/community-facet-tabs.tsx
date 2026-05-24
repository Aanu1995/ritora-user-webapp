"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  AlertTriangle,
  ChevronDown,
  GitBranch,
  Lock,
  Sparkles,
  Star,
  UserCheck,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CommunityHome } from "@/types/community";
import type { CommunityTab } from "./community-shared";

export function FacetStrip({ data }: { data: CommunityHome }) {
  const t = useTranslations("community.facets");
  const [open, setOpen] = useState(false);
  const facets = data.profileFacets;
  const pills = [
    facets.skinType,
    facets.sensitivityLevel,
    facets.skinToneRange,
    facets.climateBucket,
    facets.routinePace,
    ...facets.concernTags.slice(0, 3),
  ].filter(Boolean);

  if (pills.length === 0) {
    return (
      <div className="mt-2 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning-soft px-3 py-2 text-xs text-warning">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span className="text-foreground">{t("emptyProfile")}</span>
      </div>
    );
  }

  return (
    <div className="mt-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
        <span className="inline-flex items-center gap-1.5 font-medium text-muted">
          <UserCheck className="h-3.5 w-3.5 text-accent" aria-hidden />
          {t("matching")}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {pills.map((pill) => (
            <span
              key={pill}
              className="inline-flex items-center rounded-md bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-foreground"
            >
              {pill}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          className="ml-auto inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-muted transition hover:text-foreground"
        >
          <Lock className="h-3 w-3" aria-hidden />
          {t("privacy")}
          <ChevronDown
            className={cn(
              "h-3 w-3 transition-transform",
              open && "rotate-180",
            )}
            aria-hidden
          />
        </button>
      </div>
      {open ? (
        <p className="mt-2 max-w-3xl rounded-md bg-surface-muted/60 px-3 py-2 text-[11px] leading-5 text-muted">
          {t("privacyBody")}
        </p>
      ) : null}
    </div>
  );
}

export function CommunityTabs({
  active,
  onChange,
}: {
  active: CommunityTab;
  onChange: (tab: CommunityTab) => void;
}) {
  const t = useTranslations("community.tabs");
  const tabs: Array<[CommunityTab, string, ReactNode]> = [
    ["for-you", t("forYou"), <Sparkles key="i" className="h-4 w-4" />],
    ["people", t("peopleLikeMe"), <Users key="i" className="h-4 w-4" />],
    ["routines", t("playbooks"), <GitBranch key="i" className="h-4 w-4" />],
    ["reviews", t("reviews"), <Star key="i" className="h-4 w-4" />],
    ["submissions", t("submissions"), <UserCheck key="i" className="h-4 w-4" />],
    ["trust", t("warnings"), <AlertTriangle key="i" className="h-4 w-4" />],
  ];

  return (
    <div className="sticky top-14 z-[9] mt-3 -mb-1 bg-background/95 pb-2 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:top-[88px]">
      <nav
        role="tablist"
        aria-label={t("sectionsLabel")}
        className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-surface p-1 shadow-soft"
      >
        {tabs.map(([key, label, icon]) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => onChange(key)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition outline-none focus-visible:ring-2 focus-visible:ring-accent/30 sm:text-sm",
                isActive
                  ? "bg-accent-soft text-accent-strong"
                  : "text-muted hover:bg-surface-muted hover:text-foreground",
              )}
            >
              {icon}
              {label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export const FacetPills = FacetStrip;
