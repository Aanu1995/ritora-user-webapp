"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ExtractActionBar,
  LabelPhotosSection,
  ProductPhotoSection,
  type ExtractionState,
  type PhotoItem,
  type PhotosHelperState,
} from "./photos-tab-sections";
import { useRefreshUserCapabilitiesOnRestriction } from "@/hooks/use-refresh-user-capabilities";
import { useExtractProductFromImages } from "@/hooks/use-shelf";
import { getApiErrorStatus } from "@/lib/api-error";
import { LookupWarningCode, type ResolvedLookup } from "@/types/shelf";

type Props = {
  disabled?: boolean;
  onPhotosChange?: () => void;
  onProductPhotoChange?: (file: File | null) => void;
  onResolved: (resolved: ResolvedLookup) => void;
};

const MAX_LABEL_PHOTOS = 5;

let photoSequence = 0;

function createPhotoId(): string {
  photoSequence += 1;
  return `photo-${photoSequence}`;
}

function createPhoto(file: File): PhotoItem {
  return {
    id: createPhotoId(),
    file,
    previewUrl: URL.createObjectURL(file),
  };
}

function revokePhotoPreview(photo: PhotoItem | null | undefined) {
  if (photo) {
    URL.revokeObjectURL(photo.previewUrl);
  }
}

function toUploadFiles(
  files: FileList | readonly File[] | null | undefined,
): File[] {
  if (!files) {
    return [];
  }

  return Array.from(files).filter((file): file is File => file instanceof File);
}

function getHelperState(input: {
  canAddLabelPhoto: boolean;
  canExtract: boolean;
  isExtracting: boolean;
  state: ExtractionState;
}): PhotosHelperState {
  if (input.isExtracting) {
    return "extracting";
  }

  if (!input.canExtract) {
    return "incomplete";
  }

  if (input.state === "partial") {
    return "partial";
  }

  if (input.state === "error") {
    return "error";
  }

  if (input.state === "serviceUnavailable") {
    return "serviceUnavailable";
  }

  if (!input.canAddLabelPhoto) {
    return "maxReached";
  }

  return "ready";
}

function isServiceUnavailableError(error: unknown): boolean {
  const status = getApiErrorStatus(error);
  return status === undefined || status === 0;
}

export function PhotosTab({
  disabled = false,
  onPhotosChange,
  onProductPhotoChange,
  onResolved,
}: Props) {
  const t = useTranslations("shelf.dialog.photos");
  const [productPhoto, setProductPhoto] = useState<PhotoItem | null>(null);
  const [labelPhotos, setLabelPhotos] = useState<PhotoItem[]>([]);
  const [state, setState] = useState<ExtractionState>("idle");
  const productPhotoRef = useRef<PhotoItem | null>(null);
  const labelPhotosRef = useRef<PhotoItem[]>([]);
  const isMountedRef = useRef(true);
  const extractProductFromImages = useExtractProductFromImages();
  const refreshCapabilitiesOnRestriction =
    useRefreshUserCapabilitiesOnRestriction();

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      revokePhotoPreview(productPhotoRef.current);
      labelPhotosRef.current.forEach((photo) => {
        revokePhotoPreview(photo);
      });
    };
  }, []);

  const canAddLabelPhoto = labelPhotos.length < MAX_LABEL_PHOTOS && !disabled;
  const canExtract = productPhoto !== null && labelPhotos.length >= 1 && !disabled;

  const helperKey = useMemo(
    () =>
      getHelperState({
        canAddLabelPhoto,
        canExtract,
        isExtracting: extractProductFromImages.isPending,
        state,
      }),
    [canAddLabelPhoto, canExtract, extractProductFromImages.isPending, state],
  );

  const handleSetProductPhoto = (file: File | null) => {
    if (disabled || !file) {
      return;
    }

    const nextPhoto = createPhoto(file);
    revokePhotoPreview(productPhotoRef.current);
    productPhotoRef.current = nextPhoto;
    setProductPhoto(nextPhoto);
    onPhotosChange?.();
    onProductPhotoChange?.(file);
    setState("idle");
  };

  const handleRemoveProductPhoto = () => {
    revokePhotoPreview(productPhotoRef.current);
    productPhotoRef.current = null;
    setProductPhoto(null);
    onPhotosChange?.();
    onProductPhotoChange?.(null);
    setState("idle");
  };

  const handleAddLabelPhotos = (files: FileList | readonly File[] | null) => {
    if (!canAddLabelPhoto || disabled) {
      return;
    }

    const nextFiles = toUploadFiles(files);
    if (nextFiles.length === 0) {
      return;
    }

    const currentPhotos = labelPhotosRef.current;
    const remainingSlots = MAX_LABEL_PHOTOS - currentPhotos.length;
    const acceptedFiles = nextFiles.slice(0, remainingSlots);

    if (acceptedFiles.length === 0) {
      return;
    }

    const nextPhotos = [
      ...currentPhotos,
      ...acceptedFiles.map((file) => createPhoto(file)),
    ];
    labelPhotosRef.current = nextPhotos;
    setLabelPhotos(nextPhotos);
    onPhotosChange?.();
    setState("idle");
  };

  const handleRemoveLabelPhoto = (photoId: string) => {
    const removed = labelPhotosRef.current.find(
      (photo) => photo.id === photoId,
    );
    const nextPhotos = labelPhotosRef.current.filter(
      (photo) => photo.id !== photoId,
    );

    revokePhotoPreview(removed);
    labelPhotosRef.current = nextPhotos;
    setLabelPhotos(nextPhotos);
    onPhotosChange?.();
    setState("idle");
  };

  const handleExtract = () => {
    if (!canExtract || disabled || !productPhoto) {
      return;
    }

    setState("idle");
    extractProductFromImages.mutate(
      {
        images: [productPhoto.file, ...labelPhotos.map((photo) => photo.file)],
        heroImageIndex: 0,
      },
      {
        onSuccess: (resolved) => {
          if (!isMountedRef.current) {
            return;
          }
          if (!resolved) {
            setState("error");
            toast.error(t("errorTitle"), {
              description: t("error"),
            });
            return;
          }

          const shouldReview =
            resolved.reviewRequired ||
            resolved.warnings.includes(LookupWarningCode.PartialData);
          setState(shouldReview ? "partial" : "ready");
          onResolved(resolved);
        },
        onError: (error) => {
          if (!isMountedRef.current) {
            return;
          }
          if (refreshCapabilitiesOnRestriction(error)) {
            setState("error");
            return;
          }

          const isServiceDown = isServiceUnavailableError(error);
          setState(isServiceDown ? "serviceUnavailable" : "error");
          toast.error(
            isServiceDown ? t("serviceUnavailableTitle") : t("errorTitle"),
            {
              description: isServiceDown
                ? t("serviceUnavailableDescription")
                : t("error"),
            },
          );
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,22rem)_1fr]">
        <ProductPhotoSection
          disabled={disabled}
          photo={productPhoto}
          onPhotoSelected={handleSetProductPhoto}
          onRemove={handleRemoveProductPhoto}
        />
        <LabelPhotosSection
          photos={labelPhotos}
          canAddPhoto={canAddLabelPhoto}
          disabled={disabled}
          onFilesSelected={handleAddLabelPhotos}
          onRemovePhoto={handleRemoveLabelPhoto}
        />
      </div>

      <ExtractActionBar
        canExtract={canExtract}
        helperKey={helperKey}
        isExtracting={extractProductFromImages.isPending}
        onExtract={handleExtract}
      />
    </div>
  );
}
