"use client";

import type { ReactNode } from "react";

interface StreakRingProps {
  size?: number;
  active?: boolean;
  children?: ReactNode;
}

export function StreakRing({ size = 36, active, children }: StreakRingProps) {
  return (
    <div
      className="relative grid place-items-center"
      style={{ width: size, height: size }}
    >
      {active ? (
        <span
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: "0 0 0 2px var(--accent-strong)" }}
        />
      ) : null}
      <div className="relative">{children}</div>
    </div>
  );
}
