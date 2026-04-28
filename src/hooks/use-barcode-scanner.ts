'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react';
import type { IScannerControls } from '@zxing/browser';
import { useTranslations } from 'next-intl';
import { BarcodeScannerStatus } from '@/types/shelf';

type ScannerError = {
  status: BarcodeScannerStatus;
  message: string;
};

type CameraEnvironment = {
  permissionState: PermissionState | null;
  policyAllowsCamera: boolean | null;
};

type ScannerMessages = {
  insecureContext: string;
  unsupported: string;
  policyBlocked: string;
  permissionDenied: string;
  systemBlocked: string;
  unavailable: string;
  previewStartFailed: string;
  unknownError: string;
};

type UseBarcodeScannerResult = {
  detectedBarcode: string | null;
  error: ScannerError | null;
  isSupported: boolean;
  start: () => void;
  retry: () => void;
  status: BarcodeScannerStatus;
  videoRef: RefObject<HTMLVideoElement | null>;
};

const PRIMARY_CONSTRAINTS: MediaStreamConstraints = {
  audio: false,
  video: {
    facingMode: { ideal: 'environment' },
    width: { ideal: 1280 },
    height: { ideal: 720 },
  },
};

const FALLBACK_CONSTRAINTS: MediaStreamConstraints = {
  audio: false,
  video: true,
};

async function readCameraEnvironment(): Promise<CameraEnvironment> {
  let permissionState: PermissionState | null = null;

  try {
    if (navigator.permissions?.query) {
      const status = await navigator.permissions.query({
        name: 'camera' as PermissionName,
      });
      permissionState = status.state;
    }
  } catch {
    permissionState = null;
  }

  let policyAllowsCamera: boolean | null = null;

  try {
    const documentWithPermissionsPolicy = document as Document & {
      permissionsPolicy?: { allowsFeature?: (feature: string) => boolean };
      featurePolicy?: { allowsFeature?: (feature: string) => boolean };
    };

    const policy =
      documentWithPermissionsPolicy.permissionsPolicy ??
      documentWithPermissionsPolicy.featurePolicy;

    if (policy?.allowsFeature) {
      policyAllowsCamera = policy.allowsFeature('camera');
    }
  } catch {
    policyAllowsCamera = null;
  }

  return {
    permissionState,
    policyAllowsCamera,
  };
}

async function waitForVideoPlayback(
  videoElement: HTMLVideoElement,
  messages: ScannerMessages,
): Promise<void> {
  if (videoElement.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
    await videoElement.play();
    return;
  }

  await new Promise<void>((resolve, reject) => {
    let resolved = false;

    const cleanup = () => {
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('error', handleError);
    };

    const handleLoadedMetadata = () => {
      if (resolved) {
        return;
      }

      resolved = true;
      cleanup();
      resolve();
    };

    const handleError = () => {
      if (resolved) {
        return;
      }

      resolved = true;
      cleanup();
      reject(new Error(messages.previewStartFailed));
    };

    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('error', handleError);
  });

  await videoElement.play();
}

function classifyScannerError(
  error: unknown,
  environment: CameraEnvironment,
  messages: ScannerMessages,
): ScannerError {
  if (
    error instanceof DOMException &&
    (error.name === 'NotAllowedError' || error.name === 'SecurityError')
  ) {
    if (environment.policyAllowsCamera === false) {
      return {
        status: BarcodeScannerStatus.PolicyBlocked,
        message: messages.policyBlocked,
      };
    }

    return environment.permissionState === 'denied'
      ? {
          status: BarcodeScannerStatus.PermissionDenied,
          message: messages.permissionDenied,
        }
      : {
          status: BarcodeScannerStatus.SystemBlocked,
          message: messages.systemBlocked,
        };
  }

  if (
    error instanceof DOMException &&
    (error.name === 'NotFoundError' ||
      error.name === 'DevicesNotFoundError' ||
      error.name === 'OverconstrainedError' ||
      error.name === 'NotReadableError')
  ) {
    return {
      status: BarcodeScannerStatus.Unavailable,
      message: messages.unavailable,
    };
  }

  return {
    status: BarcodeScannerStatus.Error,
    message: error instanceof Error ? error.message : messages.unknownError,
  };
}

export function useBarcodeScanner(): UseBarcodeScannerResult {
  const t = useTranslations('shelf.dialog.photos.scanner');
  const scannerMessages = useMemo<ScannerMessages>(
    () => ({
      insecureContext: t('insecureContext'),
      unsupported: t('unsupported'),
      policyBlocked: t('policyBlocked'),
      permissionDenied: t('permissionDenied'),
      systemBlocked: t('systemBlocked'),
      unavailable: t('unavailable'),
      previewStartFailed: t('previewStartFailed'),
      unknownError: t('unknownError'),
    }),
    [t],
  );
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectedBarcodeRef = useRef<string | null>(null);
  const [activationCount, setActivationCount] = useState(0);
  const [status, setStatus] = useState<BarcodeScannerStatus>(
    BarcodeScannerStatus.Inactive,
  );
  const [detectedBarcode, setDetectedBarcode] = useState<string | null>(null);
  const [error, setError] = useState<ScannerError | null>(null);

  const stopScanner = useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;

    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }

    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.pause();
      videoElement.srcObject = null;
      videoElement.removeAttribute('src');
      videoElement.load();
    }
  }, []);

  const activateScanner = useCallback(() => {
    detectedBarcodeRef.current = null;
    setDetectedBarcode(null);
    setError(null);
    setStatus(BarcodeScannerStatus.Starting);
    stopScanner();
    setActivationCount((count) => count + 1);
  }, [stopScanner]);

  const start = useCallback(() => {
    activateScanner();
  }, [activateScanner]);

  const retry = useCallback(() => {
    activateScanner();
  }, [activateScanner]);

  useEffect(() => {
    if (activationCount === 0) {
      return;
    }

    let isActive = true;

    async function startScanner() {
      if (typeof window === 'undefined' || typeof navigator === 'undefined') {
        return;
      }

      if (!window.isSecureContext) {
        if (!isActive) {
          return;
        }

        setStatus(BarcodeScannerStatus.InsecureContext);
        setError({
          status: BarcodeScannerStatus.InsecureContext,
          message: scannerMessages.insecureContext,
        });
        return;
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        if (!isActive) {
          return;
        }

        setStatus(BarcodeScannerStatus.Unsupported);
        setError({
          status: BarcodeScannerStatus.Unsupported,
          message: scannerMessages.unsupported,
        });
        return;
      }

      const environment = await readCameraEnvironment();

      if (!isActive) {
        return;
      }

      if (environment.policyAllowsCamera === false) {
        setStatus(BarcodeScannerStatus.PolicyBlocked);
        setError({
          status: BarcodeScannerStatus.PolicyBlocked,
          message: scannerMessages.policyBlocked,
        });
        return;
      }

      if (environment.permissionState === 'denied') {
        setStatus(BarcodeScannerStatus.PermissionDenied);
        setError({
          status: BarcodeScannerStatus.PermissionDenied,
          message: scannerMessages.permissionDenied,
        });
        return;
      }

      const videoElement = videoRef.current;
      if (!videoElement) {
        return;
      }

      const [{ BrowserMultiFormatReader }, { BarcodeFormat, DecodeHintType }] =
        await Promise.all([import('@zxing/browser'), import('@zxing/library')]);

      if (!isActive) {
        return;
      }

      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
        BarcodeFormat.CODE_128,
      ]);

      const reader = new BrowserMultiFormatReader(hints, {
        delayBetweenScanAttempts: 300,
        delayBetweenScanSuccess: 750,
      });

      const handleScanResult = (
        result: { getText: () => string } | undefined,
        _scanError: unknown,
        controls: IScannerControls,
      ) => {
        if (!isActive || detectedBarcodeRef.current) {
          return;
        }

        controlsRef.current = controls;

        if (!result) {
          if (!detectedBarcodeRef.current) {
            setStatus(BarcodeScannerStatus.Scanning);
          }
          return;
        }

        const nextBarcode = result.getText().trim();
        if (!nextBarcode) {
          return;
        }

        detectedBarcodeRef.current = nextBarcode;
        setDetectedBarcode(nextBarcode);
        setStatus(BarcodeScannerStatus.Detected);
        controls.stop();
        controlsRef.current = null;
      };

      const getStream = async (
        constraints: MediaStreamConstraints,
      ): Promise<MediaStream> => navigator.mediaDevices.getUserMedia(constraints);

      try {
        try {
          streamRef.current = await getStream(PRIMARY_CONSTRAINTS);
        } catch {
          streamRef.current = await getStream(FALLBACK_CONSTRAINTS);
        }

        if (!streamRef.current || !isActive) {
          return;
        }

        videoElement.srcObject = streamRef.current;
        await waitForVideoPlayback(videoElement, scannerMessages);

        controlsRef.current = reader.scan(videoElement, handleScanResult, () => {
          controlsRef.current = null;
        });

        if (isActive && !detectedBarcodeRef.current) {
          setStatus(BarcodeScannerStatus.Scanning);
        }
      } catch (error) {
        if (!isActive) {
          return;
        }

        const latestEnvironment = await readCameraEnvironment();
        const nextError = classifyScannerError(
          error,
          latestEnvironment,
          scannerMessages,
        );
        setError(nextError);
        setStatus(nextError.status);
      }
    }

    void startScanner();

    return () => {
      isActive = false;
      stopScanner();
    };
  }, [activationCount, scannerMessages, stopScanner]);

  return {
    detectedBarcode,
    error,
    isSupported:
      status !== BarcodeScannerStatus.Unsupported &&
      status !== BarcodeScannerStatus.InsecureContext,
    start,
    retry,
    status,
    videoRef,
  };
}
