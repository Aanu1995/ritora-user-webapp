"use client";

import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  action?: ReactNode;
  leading?: ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  action,
  leading,
}: PageHeaderProps) {
  return (
    <div
      data-slot="page-header"
      className="sticky top-0 z-10 -mx-4 bg-background px-4 pb-2 pt-3 sm:-mx-6 sm:px-6 sm:pb-4 sm:pt-6 lg:-mx-8 lg:px-8"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          {leading ? <div className="shrink-0">{leading}</div> : null}
          <div className="min-w-0">
            <h1 className="text-lg font-bold tracking-tight text-foreground sm:text-2xl">
              {title}
            </h1>
            <p className="mt-0.5 text-xs text-muted sm:mt-1 sm:text-sm">
              {subtitle}
            </p>
          </div>
        </div>
        {action ? <div className="mt-0.5 shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}
