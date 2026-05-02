"use client";

import {
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type WheelEvent,
} from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ScissorsLineDashed } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import {
  calculateSquareCropPreviewStyle,
  calculateSquareCropRegion,
  cropImageFileToSquare,
  type CropSettings,
} from "@/components/skin-journal/crop-image-file";

interface PhotoCropDialogProps {
  open: boolean;
  photo: File;
  previewUrl: string;
  onOpenChange: (open: boolean) => void;
  onApply: (photo: File) => void;
}

const DEFAULT_CROP: CropSettings = {
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
};
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const WHEEL_ZOOM_STEP = 0.1;

function clampCropOffset(value: number): number {
  return Math.min(Math.max(value, -100), 100);
}

function clampZoom(value: number): number {
  return Math.min(Math.max(Number(value.toFixed(2)), MIN_ZOOM), MAX_ZOOM);
}

export function PhotoCropDialog({
  open,
  photo,
  previewUrl,
  onOpenChange,
  onApply,
}: PhotoCropDialogProps) {
  const t = useTranslations("journal.upload.cropDialog");
  const [crop, setCrop] = useState<CropSettings>(DEFAULT_CROP);
  const [isCropping, setIsCropping] = useState(false);
  const [hasCropError, setHasCropError] = useState(false);
  const [imageSize, setImageSize] = useState<{
    src: string;
    width: number;
    height: number;
  } | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startOffsetX: number;
    startOffsetY: number;
  } | null>(null);

  const updateCrop = (key: keyof CropSettings, value: string) => {
    const nextValue = Number(value);
    setCrop((current) => ({
      ...current,
      [key]: key === "zoom" ? clampZoom(nextValue) : nextValue,
    }));
    setHasCropError(false);
  };

  const handleApply = () => {
    setIsCropping(true);
    setHasCropError(false);
    cropImageFileToSquare(photo, previewUrl, crop)
      .then((croppedPhoto) => {
        onApply(croppedPhoto);
        onOpenChange(false);
      })
      .catch(() => {
        setHasCropError(true);
      })
      .finally(() => {
        setIsCropping(false);
      });
  };

  const handleReset = () => {
    setCrop(DEFAULT_CROP);
    setHasCropError(false);
  };

  const handleDragStart = (event: PointerEvent<HTMLDivElement>) => {
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startOffsetX: crop.offsetX,
      startOffsetY: crop.offsetY,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handleDragMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    const nextOffsetX = clampCropOffset(
      Math.round(drag.startOffsetX + (event.clientX - drag.startX) / 2),
    );
    const nextOffsetY = clampCropOffset(
      Math.round(drag.startOffsetY + (event.clientY - drag.startY) / 2),
    );

    setCrop((current) => ({
      ...current,
      offsetX: nextOffsetX,
      offsetY: nextOffsetY,
    }));
    setHasCropError(false);
  };

  const handleDragEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
    }
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  };

  const handleWheelZoom = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const direction = event.deltaY < 0 ? 1 : -1;

    setCrop((current) => ({
      ...current,
      zoom: clampZoom(current.zoom + direction * WHEEL_ZOOM_STEP),
    }));
    setHasCropError(false);
  };

  const activeImageSize = imageSize?.src === previewUrl ? imageSize : null;
  const cropRegion = activeImageSize
    ? calculateSquareCropRegion(activeImageSize.width, activeImageSize.height, crop)
    : null;
  const cropPreviewStyle =
    activeImageSize && cropRegion
      ? calculateSquareCropPreviewStyle(
          activeImageSize.width,
          activeImageSize.height,
          cropRegion,
        )
      : null;
  const imageStyle: CSSProperties = cropPreviewStyle
    ? {
        ...cropPreviewStyle,
        position: "absolute",
        bottom: "auto",
        maxWidth: "none",
        objectFit: "fill",
        right: "auto",
      }
    : {
        height: "100%",
        inset: 0,
        objectFit: "cover",
        position: "absolute",
        width: "100%",
      };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div
            aria-hidden
            className="grid h-11 w-11 place-items-center rounded-xl bg-accent-soft text-accent-strong"
          >
            <ScissorsLineDashed className="h-5 w-5" />
          </div>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("body")}</DialogDescription>
        </DialogHeader>

        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div
            aria-label={t("dragLabel")}
            tabIndex={0}
            onPointerDown={handleDragStart}
            onPointerMove={handleDragMove}
            onPointerUp={handleDragEnd}
            onPointerCancel={handleDragEnd}
            onWheel={handleWheelZoom}
            className="relative aspect-square cursor-grab touch-none select-none overflow-hidden rounded-2xl border border-border bg-surface-muted active:cursor-grabbing"
          >
            <Image
              src={previewUrl}
              alt={t("previewAlt")}
              width={activeImageSize?.width ?? 1}
              height={activeImageSize?.height ?? 1}
              unoptimized
              draggable={false}
              className="select-none"
              onLoad={(event) => {
                const image = event.currentTarget;
                if (image.naturalWidth && image.naturalHeight) {
                  setImageSize({
                    src: previewUrl,
                    width: image.naturalWidth,
                    height: image.naturalHeight,
                  });
                }
              }}
              style={imageStyle}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 border-[12px] border-background/45"
            />
          </div>

          <div className="space-y-4">
            <SliderControl
              label={t("zoom")}
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={0.1}
              value={crop.zoom}
              onChange={(value) => updateCrop("zoom", value)}
            />
            <SliderControl
              label={t("moveX")}
              min={-100}
              max={100}
              step={1}
              value={crop.offsetX}
              onChange={(value) => updateCrop("offsetX", value)}
            />
            <SliderControl
              label={t("moveY")}
              min={-100}
              max={100}
              step={1}
              value={crop.offsetY}
              onChange={(value) => updateCrop("offsetY", value)}
            />

            {hasCropError ? (
              <p className="rounded-xl border border-danger/25 bg-danger/5 p-3 text-xs font-semibold text-danger">
                {t("error")}
              </p>
            ) : null}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={handleReset}
            disabled={isCropping}
          >
            {t("reset")}
          </Button>
          <Button type="button" onClick={handleApply} disabled={isCropping}>
            {isCropping ? (
              <LoadingIndicator label={t("applying")} size="sm" />
            ) : (
              t("apply")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SliderControl({
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-semibold">
      <span>{label}</span>
      <input
        aria-label={label}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full accent-[color:var(--accent-strong)]"
      />
    </label>
  );
}
