"use client";

import { SmoothImage } from "@/components/ui/smooth-image";
import { cn } from "@/lib/utils";
import { buildBackendUrl } from "@/lib/media-url";

interface PhotoFrameProps {
  url: string | null;
  alt: string;
  tag?: string;
  fallbackTone?: "warm" | "cool" | "deep" | "default";
  className?: string;
  aspect?: "square" | "portrait" | "wide";
}

const TONES: Record<NonNullable<PhotoFrameProps["fallbackTone"]>, string> = {
  default: "linear-gradient(135deg, #d6c2a3 0%, #c2a886 50%, #a78c66 100%)",
  warm: "linear-gradient(135deg, #e0b8a0, #c89678)",
  cool: "linear-gradient(135deg, #c2b18f, #a8987a)",
  deep: "linear-gradient(135deg, #8a6f4d, #6c5538)",
};

export function PhotoFrame({
  url,
  alt,
  tag,
  fallbackTone = "default",
  className,
  aspect = "portrait",
}: PhotoFrameProps) {
  const aspectClass =
    aspect === "square"
      ? "aspect-square"
      : aspect === "wide"
        ? "aspect-[5/4]"
        : "aspect-[5/6]";
  const absoluteUrl = url ? buildBackendUrl(url) : null;
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl",
        aspectClass,
        className,
      )}
      style={{ background: TONES[fallbackTone] }}
    >
      {absoluteUrl ? (
        <SmoothImage
          src={absoluteUrl}
          alt={alt}
          className="h-full w-full"
          sizes="(max-width: 640px) 100vw, 480px"
        />
      ) : (
        <div
          className="absolute"
          style={{
            inset: "12% 22% 6% 22%",
            borderRadius: "50% / 60%",
            border: "1.5px dashed rgba(255,255,255,0.5)",
          }}
        />
      )}
      {tag ? (
        <span className="absolute left-2.5 top-2.5 rounded-full bg-foreground/80 px-2 py-1 text-[10px] font-semibold text-background">
          {tag}
        </span>
      ) : null}
    </div>
  );
}
