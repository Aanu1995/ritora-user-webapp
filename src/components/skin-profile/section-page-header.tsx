"use client";

import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { GuardedLink } from "@/components/app/guarded-link";

interface SectionPageHeaderProps {
  backHref?: string;
  backLabel?: string;
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  action?: ReactNode;
}

export function SectionPageHeader({
  backHref = "/skin-profile",
  backLabel = "Back to Skin Profile",
  title,
  subtitle,
  badge,
  action,
}: SectionPageHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-background pb-2 pt-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <GuardedLink
            href={backHref}
            aria-label={backLabel}
            restoreScrollTo={backHref}
            className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border-strong bg-surface text-foreground hover:bg-accent-soft"
          >
            <ArrowLeft className="h-4 w-4" />
          </GuardedLink>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {title}
              </h1>
              {badge}
            </div>
            {subtitle ? (
              <p className="mt-1 text-sm text-muted">{subtitle}</p>
            ) : null}
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}
