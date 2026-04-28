"use client";

import type { ReactNode } from "react";

export function FieldRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="py-5">
      <p className="text-sm font-semibold text-foreground">{label}</p>
      {hint ? <p className="mt-0.5 text-xs text-muted">{hint}</p> : null}
      <div className="mt-3">{children}</div>
    </div>
  );
}
