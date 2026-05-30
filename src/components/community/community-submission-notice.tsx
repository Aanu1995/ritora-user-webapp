"use client";

import type { ReactNode } from "react";

export function SubmissionNotice({
  body,
  footnote,
  icon,
  tag,
  title,
}: {
  body: string;
  footnote?: string;
  icon: ReactNode;
  tag?: string;
  title: string;
}) {
  return (
    <div className="mt-3 flex gap-3 rounded-xl border border-warning/30 bg-warning-soft/40 px-3 py-3">
      <span
        aria-hidden
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-warning text-surface"
      >
        {icon}
      </span>
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          {tag ? (
            <span className="inline-flex items-center rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] font-medium text-muted">
              {tag}
            </span>
          ) : null}
        </div>
        <p className="text-sm leading-5 text-foreground">{body}</p>
        {footnote ? (
          <p className="text-xs leading-5 text-muted">{footnote}</p>
        ) : null}
      </div>
    </div>
  );
}
