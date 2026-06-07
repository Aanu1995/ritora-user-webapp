"use client";

import {
  useCallback,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import { useTranslations } from "next-intl";
import { X, ZoomIn, ZoomOut } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { buildBackendUrl } from "@/lib/media-url";
import { cn } from "@/lib/utils";

interface PhotoLightboxProps {
  url: string | null;
  alt: string;
  title?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const STEP_SCALE = 2;

export function PhotoLightbox({
  url,
  alt,
  title,
  open,
  onOpenChange,
}: PhotoLightboxProps) {
  const t = useTranslations("journal.dayDetail");
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragStateRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  }>({
    active: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    moved: false,
  });
  const [isDragging, setIsDragging] = useState(false);

  const isZoomed = scale > MIN_SCALE;

  const resetTransform = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    dragStateRef.current.active = false;
    dragStateRef.current.moved = false;
    setIsDragging(false);
  }, []);

  const toggleZoom = useCallback(() => {
    if (isZoomed) {
      resetTransform();
    } else {
      setScale(STEP_SCALE);
    }
  }, [isZoomed, resetTransform]);

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const delta = -event.deltaY * 0.005;
    const nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale + delta));
    setScale(nextScale);
    if (nextScale === MIN_SCALE) {
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) resetTransform();
      onOpenChange(nextOpen);
    },
    [onOpenChange, resetTransform],
  );

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStateRef.current = {
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      originX: position.x,
      originY: position.y,
      moved: false,
    };
    setIsDragging(true);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragStateRef.current.active) return;
    const dx = event.clientX - dragStateRef.current.startX;
    const dy = event.clientY - dragStateRef.current.startY;
    if (!dragStateRef.current.moved && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
      dragStateRef.current.moved = true;
    }
    setPosition({
      x: dragStateRef.current.originX + dx,
      y: dragStateRef.current.originY + dy,
    });
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragStateRef.current.active) return;
    dragStateRef.current.active = false;
    setIsDragging(false);
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // pointer already released
    }
  };

  if (!url) return null;
  const src = buildBackendUrl(url);
  if (!src) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="grid h-[95vh] max-h-[95vh] w-[95vw] max-w-[95vw] grid-rows-[auto_1fr] gap-0 overflow-hidden border-0 bg-foreground/95 p-0 backdrop-blur sm:rounded-2xl"
        showClose={false}
      >
        <DialogTitle className="sr-only">{title ?? alt}</DialogTitle>
        <DialogDescription className="sr-only">
          {t("photoLightboxDescription")}
        </DialogDescription>
        <div className="flex items-center justify-between gap-2 bg-gradient-to-b from-black/60 to-transparent px-4 py-3 text-white">
          <p className="truncate text-sm font-semibold">
            {title ?? alt}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={toggleZoom}
              className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
              aria-label={isZoomed ? t("zoomOut") : t("zoomIn")}
            >
              {isZoomed ? (
                <ZoomOut className="h-4 w-4" />
              ) : (
                <ZoomIn className="h-4 w-4" />
              )}
            </button>
            <DialogClose asChild>
              <button
                type="button"
                className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
                aria-label={t("closePhoto")}
              >
                <X className="h-4 w-4" />
              </button>
            </DialogClose>
          </div>
        </div>

        <div
          className="relative flex h-full w-full items-center justify-center overflow-hidden touch-none"
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            draggable={false}
            onClick={() => {
              // Suppress the click that follows a drag (browser fires click
              // after pointerup even if the user actually dragged).
              if (dragStateRef.current.moved) {
                dragStateRef.current.moved = false;
                return;
              }
              toggleZoom();
            }}
            onDoubleClick={resetTransform}
            className={cn(
              "max-h-full max-w-full select-none object-contain",
              isZoomed
                ? isDragging
                  ? "cursor-grabbing"
                  : "cursor-grab"
                : "cursor-zoom-in",
            )}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transition: isDragging ? "none" : "transform 0.15s ease-out",
              transformOrigin: "center center",
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
