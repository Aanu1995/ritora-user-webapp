'use client';

import { ChevronRight, ClipboardCheck, ImagePlus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { SmoothImage } from '@/components/ui/smooth-image';
import { useRefreshUserCapabilitiesOnRestriction } from '@/hooks/use-refresh-user-capabilities';
import { useExtractProductFromImages } from '@/hooks/use-shelf';
import { getApiErrorStatus } from '@/lib/api-error';
import {
  buildPhotoProductCheckInput,
  isProductCheckInputComplete,
} from '@/lib/product-check';
import type { ProductCheckProductInput } from '@/types/ingredients';

const MAX_LABEL_PHOTOS = 5;

type PhotoItem = {
  id: string;
  file: File;
  previewUrl: string;
};

let photoSequence = 0;

function createPhotoId(): string {
  photoSequence += 1;
  return `check-photo-${photoSequence}`;
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
  if (!files) return [];
  return Array.from(files).filter((file): file is File => file instanceof File);
}

type Props = {
  canRunCheck?: boolean;
  disabled?: boolean;
  isPending: boolean;
  onCheck: (input: ProductCheckProductInput) => void;
  onCheckBlocked?: () => void;
};

export function ProductPhotoCheckPanel({
  canRunCheck = true,
  disabled = false,
  isPending,
  onCheck,
  onCheckBlocked,
}: Props) {
  const t = useTranslations('checkProduct.photos');
  const tErrors = useTranslations('checkProduct.errors');
  const tShared = useTranslations('shelf.dialog.photos');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [labelPhotos, setLabelPhotos] = useState<PhotoItem[]>([]);
  const labelPhotosRef = useRef<PhotoItem[]>([]);
  const isMountedRef = useRef(true);
  const extractProductFromImages = useExtractProductFromImages();
  const refreshCapabilitiesOnRestriction =
    useRefreshUserCapabilitiesOnRestriction();

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      labelPhotosRef.current.forEach(revokePhotoPreview);
    };
  }, []);

  const canAddLabelPhoto = labelPhotos.length < MAX_LABEL_PHOTOS && !disabled;
  const hasLabelPhotos = labelPhotos.length >= 1;
  const isExtracting = extractProductFromImages.isPending;
  const busy = isExtracting || isPending;
  const canCheck = hasLabelPhotos && !busy && !disabled;

  const handleAddLabelPhotos = (files: FileList | readonly File[] | null) => {
    if (!canAddLabelPhoto || disabled) return;
    const nextFiles = toUploadFiles(files);
    if (nextFiles.length === 0) return;

    const current = labelPhotosRef.current;
    const remainingSlots = MAX_LABEL_PHOTOS - current.length;
    const accepted = nextFiles.slice(0, remainingSlots);
    if (accepted.length === 0) return;

    const next = [...current, ...accepted.map(createPhoto)];
    labelPhotosRef.current = next;
    setLabelPhotos(next);
  };

  const handleRemoveLabelPhoto = (photoId: string) => {
    const removed = labelPhotosRef.current.find((p) => p.id === photoId);
    revokePhotoPreview(removed);
    const next = labelPhotosRef.current.filter((p) => p.id !== photoId);
    labelPhotosRef.current = next;
    setLabelPhotos(next);
  };

  const handleCheck = () => {
    if (disabled || labelPhotos.length === 0) return;

    if (!canRunCheck) {
      onCheckBlocked?.();
      return;
    }

    extractProductFromImages.mutate(
      {
        images: labelPhotos.map((p) => p.file),
        heroImageIndex: 0,
      },
      {
        onSuccess: (resolved) => {
          if (!isMountedRef.current) return;
          if (!resolved) {
            toast.error(tShared('errorTitle'), {
              description: tShared('error'),
            });
            return;
          }

          const input = buildPhotoProductCheckInput(resolved);
          if (!isProductCheckInputComplete(input)) {
            toast.error(tErrors('incompletePhotoProduct'));
            return;
          }

          onCheck(input);
        },
        onError: (error) => {
          if (!isMountedRef.current) return;
          if (refreshCapabilitiesOnRestriction(error)) {
            return;
          }

          const status = getApiErrorStatus(error);
          const isServiceDown = status === undefined || status === 0;
          toast.error(
            isServiceDown
              ? tShared('serviceUnavailableTitle')
              : tShared('errorTitle'),
            {
              description: isServiceDown
                ? tShared('serviceUnavailableDescription')
                : tShared('error'),
            },
          );
        },
      },
    );
  };

  const helperKey = useMemo(() => {
    if (labelPhotos.length === 0) return 'needLabels';
    return 'ready';
  }, [labelPhotos.length]);

  const buttonLabel = isExtracting
    ? t('extractingAction')
    : isPending
      ? t('checkingAction')
      : null;

  return (
    <section className="flex flex-col gap-5">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
        {labelPhotos.map((photo) => (
          <div
            key={photo.id}
            className="relative aspect-[4/5] overflow-hidden rounded-xl border border-border bg-background"
          >
            <SmoothImage
              src={photo.previewUrl}
              alt=""
              sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw"
              className="h-full w-full"
            />
            <button
              type="button"
              onClick={() => handleRemoveLabelPhoto(photo.id)}
              aria-label={t('removeAction')}
              className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-background/90 text-danger shadow-sm transition hover:bg-danger/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {canAddLabelPhoto ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-[4/5] w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border bg-surface-muted/40 px-2 text-center text-muted transition hover:border-border-strong hover:bg-accent-soft"
          >
            <ImagePlus className="h-5 w-5" />
            <span className="text-[11px] font-medium leading-tight text-foreground">
              {t('addAction')}
            </span>
          </button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        disabled={disabled}
        aria-label={t('addAction')}
        className="sr-only"
        onChange={(event) => {
          handleAddLabelPhotos(event.target.files);
          event.currentTarget.value = '';
        }}
      />

      <details className="group rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm">
        <summary className="cursor-pointer list-none font-semibold text-foreground marker:hidden [&::-webkit-details-marker]:hidden">
          <span className="inline-flex items-center gap-2">
            <ChevronRight
              className="h-4 w-4 text-muted transition group-open:rotate-90"
              aria-hidden
            />
            {t('shapeTips.heading')}
          </span>
        </summary>
        <ul className="mt-2 list-disc space-y-1.5 pl-9 text-foreground/80 marker:text-muted">
          <li>{t('shapeTips.rectangular')}</li>
          <li>{t('shapeTips.cylindrical')}</li>
          <li>{t('shapeTips.roundJar')}</li>
          <li>{t('shapeTips.pouch')}</li>
        </ul>
      </details>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface-muted px-4 py-3">
        <p className="max-w-md text-xs text-muted sm:text-sm">
          {t(`helper.${helperKey}`)}
        </p>
        <Button
          type="button"
          size="sm"
          disabled={!canCheck}
          onClick={handleCheck}
        >
          {buttonLabel ? (
            <LoadingIndicator size="sm" label={buttonLabel} />
          ) : (
            <>
              <ClipboardCheck className="h-4 w-4" />
              {t('checkAction')}
            </>
          )}
        </Button>
      </div>
    </section>
  );
}
