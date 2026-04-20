"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { useBarcodeScanner } from "@/hooks/use-barcode-scanner";
import { getApiErrorStatus } from "@/lib/api-error";
import { useResolveBarcodeMutation } from "@/hooks/use-shelf";
import { BarcodeScannerStatus, type ResolvedLookup } from "@/types/shelf";

type Props = {
  onResolved: (resolved: ResolvedLookup) => void;
  onSwitchToManual: () => void;
};

export function ScanTab({ onResolved, onSwitchToManual }: Props) {
  const t = useTranslations("shelf.dialog.scan");
  const {
    detectedBarcode,
    start,
    retry: retryScanner,
    status: scannerStatus,
    videoRef,
  } = useBarcodeScanner();
  const {
    mutate: resolveBarcode,
    isPending: isResolvingBarcode,
    reset: resetBarcodeLookup,
  } = useResolveBarcodeMutation();
  const [lookupState, setLookupState] = useState<
    "idle" | "success" | "not-found" | "error" | "service-unavailable"
  >("idle");
  const requestedBarcodeRef = useRef<string | null>(null);

  useEffect(() => {
    if (
      !detectedBarcode ||
      isResolvingBarcode ||
      requestedBarcodeRef.current === detectedBarcode
    ) {
      return;
    }

    requestedBarcodeRef.current = detectedBarcode;
    resolveBarcode(detectedBarcode, {
      onSuccess: (result) => {
        if (!result) {
          setLookupState("not-found");
          return;
        }

        onResolved(result);
        setLookupState("success");
      },
      onError: (error) => {
        const status = getApiErrorStatus(error);
        setLookupState(
          status === undefined || status === 0
            ? "service-unavailable"
            : "error",
        );
      },
    });
  }, [detectedBarcode, isResolvingBarcode, onResolved, resolveBarcode]);

  const handleRetry = () => {
    requestedBarcodeRef.current = null;
    resetBarcodeLookup();
    setLookupState("idle");
    retryScanner();
  };

  const handleStart = () => {
    requestedBarcodeRef.current = null;
    resetBarcodeLookup();
    setLookupState("idle");
    start();
  };

  const showRetryButton =
    lookupState === "success" ||
    lookupState === "not-found" ||
    lookupState === "service-unavailable" ||
    lookupState === "error" ||
    scannerStatus === BarcodeScannerStatus.PermissionDenied ||
    scannerStatus === BarcodeScannerStatus.PolicyBlocked ||
    scannerStatus === BarcodeScannerStatus.SystemBlocked ||
    scannerStatus === BarcodeScannerStatus.InsecureContext ||
    scannerStatus === BarcodeScannerStatus.Unavailable ||
    scannerStatus === BarcodeScannerStatus.Error ||
    scannerStatus === BarcodeScannerStatus.Unsupported;

  const showStartButton = scannerStatus === BarcodeScannerStatus.Inactive;

  const statusMessage = (() => {
    if (isResolvingBarcode) {
      return t("resolving", { barcode: detectedBarcode ?? "" });
    }

    if (lookupState === "success") {
      return t("success");
    }

    if (lookupState === "not-found") {
      return t("notFound");
    }

    if (lookupState === "service-unavailable") {
      return t("lookupUnavailable");
    }

    if (lookupState === "error") {
      return t("lookupError");
    }

    switch (scannerStatus) {
      case BarcodeScannerStatus.Inactive:
        return t("inactive");
      case BarcodeScannerStatus.Starting:
        return t("starting");
      case BarcodeScannerStatus.Scanning:
        return t("scanning");
      case BarcodeScannerStatus.InsecureContext:
        return t("insecureContext");
      case BarcodeScannerStatus.PolicyBlocked:
        return t("policyBlocked");
      case BarcodeScannerStatus.PermissionDenied:
        return t("permissionDenied");
      case BarcodeScannerStatus.SystemBlocked:
        return t("systemBlocked");
      case BarcodeScannerStatus.Unavailable:
        return t("unavailable");
      case BarcodeScannerStatus.Unsupported:
        return t("unsupported");
      case BarcodeScannerStatus.Error:
        return t("cameraError");
      case BarcodeScannerStatus.Detected:
        return t("detected", { barcode: detectedBarcode ?? "" });
      default:
        return t("scanning");
    }
  })();

  return (
    <div className="flex flex-col gap-4">
      <div className="relative mx-auto aspect-[3/2] w-full max-w-lg overflow-hidden rounded-2xl bg-foreground/95 text-background">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/35" />
        <div className="pointer-events-none absolute left-3 top-3 h-9 w-9 rounded-tl-md border-l-2 border-t-2 border-accent-strong" />
        <div className="pointer-events-none absolute right-3 top-3 h-9 w-9 rounded-tr-md border-r-2 border-t-2 border-accent-strong" />
        <div className="pointer-events-none absolute bottom-3 left-3 h-9 w-9 rounded-bl-md border-b-2 border-l-2 border-accent-strong" />
        <div className="pointer-events-none absolute bottom-3 right-3 h-9 w-9 rounded-br-md border-b-2 border-r-2 border-accent-strong" />
        <div className="absolute inset-x-0 bottom-0 flex justify-center px-6 pb-5">
          <div className="w-full max-w-xs rounded-full bg-black/60 px-4 py-2 text-center text-sm backdrop-blur">
            {isResolvingBarcode ? (
              <LoadingIndicator
                label={statusMessage}
                size="sm"
                className="inline-flex items-center gap-2"
              />
            ) : (
              <p aria-live="polite">{statusMessage}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {showStartButton ? (
          <Button type="button" onClick={handleStart}>
            {t("start")}
          </Button>
        ) : null}
        {showRetryButton ? (
          <Button type="button" variant="secondary" onClick={handleRetry}>
            {lookupState === "success" ? t("scanAnother") : t("retry")}
          </Button>
        ) : null}
        <Button type="button" variant="outline" onClick={onSwitchToManual}>
          {t("fallback")}
        </Button>
      </div>
    </div>
  );
}
