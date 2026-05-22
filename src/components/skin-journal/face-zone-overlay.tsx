"use client";

import { cn } from "@/lib/utils";

interface DetectedConcern {
  concern: string;
  severity: "mild" | "moderate" | "severe";
  locations: string[];
}

interface FaceZoneOverlayProps {
  concerns?: DetectedConcern[];
  className?: string;
}

const ZONE_POSITIONS: Record<
  string,
  { top: string; left: string; width: string; height: string }
> = {
  forehead: { top: "16%", left: "30%", width: "40%", height: "12%" },
  left_cheek: { top: "44%", left: "20%", width: "20%", height: "16%" },
  right_cheek: { top: "44%", left: "60%", width: "20%", height: "16%" },
  chin: { top: "70%", left: "38%", width: "24%", height: "12%" },
  nose: { top: "40%", left: "44%", width: "12%", height: "20%" },
  under_eyes: { top: "36%", left: "30%", width: "40%", height: "8%" },
  jawline: { top: "78%", left: "20%", width: "60%", height: "8%" },
  upper_lip: { top: "62%", left: "40%", width: "20%", height: "6%" },
  temples: { top: "26%", left: "16%", width: "12%", height: "10%" },
  neck: { top: "88%", left: "30%", width: "40%", height: "8%" },
};

const SEVERITY_TONES: Record<DetectedConcern["severity"], string> = {
  mild: "rgba(184, 84, 10, 0.55)",
  moderate: "rgba(179, 38, 30, 0.55)",
  severe: "rgba(179, 38, 30, 0.75)",
};

export function FaceZoneOverlay({ concerns, className }: FaceZoneOverlayProps) {
  return (
    <div
      className={cn(
        "relative aspect-[1/1.1] overflow-hidden rounded-2xl",
        className,
      )}
      style={{
        background:
          "linear-gradient(135deg, #d6c2a3 0%, #c2a886 50%, #a78c66 100%)",
      }}
    >
      <div
        className="absolute"
        style={{
          inset: "12% 22% 6% 22%",
          borderRadius: "50% / 60%",
          border: "1.5px solid rgba(255,255,255,0.4)",
        }}
      />
      {(concerns ?? []).flatMap((c) =>
        c.locations.map((loc) => {
          const pos = ZONE_POSITIONS[loc];
          if (!pos) return null;
          return (
            <span
              key={`${c.concern}-${loc}`}
              className="absolute rounded-full border-2 border-white/85"
              style={{
                top: pos.top,
                left: pos.left,
                width: pos.width,
                height: pos.height,
                background: SEVERITY_TONES[c.severity],
              }}
              aria-label={`${c.concern} on ${loc}`}
            />
          );
        }),
      )}
    </div>
  );
}
