'use client';

import {
  ImagePlus,
  LoaderCircle,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useExtractProductFromImages } from '@/hooks/use-shelf';
import { getApiErrorStatus } from '@/lib/api-error';
import { LookupWarningCode, type ResolvedLookup } from '@/types/shelf';

type Props = {
  onResolved: (resolved: ResolvedLookup) => void;
};

type ExtractionState =
  | 'idle'
  | 'ready'
  | 'partial'
  | 'error'
  | 'serviceUnavailable';
type HelperState = ExtractionState | 'extracting' | 'incomplete' | 'maxReached';

type PhotoItem = {
  id: string;
  file: File;
  previewUrl: string;
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

  return Array.from(files).filter(
    (file): file is File => file instanceof File,
  );
}

function getHelperState(input: {
  canAddLabelPhoto: boolean;
  canExtract: boolean;
  isExtracting: boolean;
  state: ExtractionState;
}): HelperState {
  if (input.isExtracting) {
    return 'extracting';
  }

  if (!input.canExtract) {
    return 'incomplete';
  }

  if (input.state === 'partial') {
    return 'partial';
  }

  if (input.state === 'error') {
    return 'error';
  }

  if (input.state === 'serviceUnavailable') {
    return 'serviceUnavailable';
  }

  if (!input.canAddLabelPhoto) {
    return 'maxReached';
  }

  return 'ready';
}

function isServiceUnavailableError(error: unknown): boolean {
  const status = getApiErrorStatus(error);
  return status === undefined || status === 0;
}

export function PhotosTab({ onResolved }: Props) {
  const t = useTranslations('shelf.dialog.photos');
  const [productPhoto, setProductPhoto] = useState<PhotoItem | null>(null);
  const [labelPhotos, setLabelPhotos] = useState<PhotoItem[]>([]);
  const [state, setState] = useState<ExtractionState>('idle');
  const productInputRef = useRef<HTMLInputElement | null>(null);
  const labelInputRef = useRef<HTMLInputElement | null>(null);
  const productPhotoRef = useRef<PhotoItem | null>(null);
  const labelPhotosRef = useRef<PhotoItem[]>([]);
  const extractProductFromImages = useExtractProductFromImages();

  useEffect(() => {
    productPhotoRef.current = productPhoto;
  }, [productPhoto]);

  useEffect(() => {
    labelPhotosRef.current = labelPhotos;
  }, [labelPhotos]);

  useEffect(() => {
    return () => {
      revokePhotoPreview(productPhotoRef.current);
      labelPhotosRef.current.forEach((photo) => {
        revokePhotoPreview(photo);
      });
    };
  }, []);

  const canAddLabelPhoto = labelPhotos.length < MAX_LABEL_PHOTOS;
  const canExtract = productPhoto !== null && labelPhotos.length >= 1;

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
    if (!file) {
      return;
    }

    setProductPhoto((current) => {
      revokePhotoPreview(current);
      return createPhoto(file);
    });
    setState('idle');
  };

  const handleRemoveProductPhoto = () => {
    setProductPhoto((current) => {
      revokePhotoPreview(current);
      return null;
    });
    setState('idle');
  };

  const handleAddLabelPhotos = (files: FileList | readonly File[] | null) => {
    if (!canAddLabelPhoto) {
      return;
    }

    const nextFiles = toUploadFiles(files);
    if (nextFiles.length === 0) {
      return;
    }

    setLabelPhotos((current) => {
      const remainingSlots = MAX_LABEL_PHOTOS - current.length;
      const acceptedFiles = nextFiles.slice(0, remainingSlots);

      if (acceptedFiles.length === 0) {
        return current;
      }

      return [...current, ...acceptedFiles.map((file) => createPhoto(file))];
    });
    setState('idle');
  };

  const handleRemoveLabelPhoto = (photoId: string) => {
    setLabelPhotos((current) => {
      const removed = current.find((photo) => photo.id === photoId);
      revokePhotoPreview(removed);
      return current.filter((photo) => photo.id !== photoId);
    });
    setState('idle');
  };

  const handleExtract = () => {
    if (!canExtract || !productPhoto) {
      return;
    }

    setState('idle');
    extractProductFromImages.mutate(
      {
        images: [productPhoto.file, ...labelPhotos.map((photo) => photo.file)],
        heroImageIndex: 0,
      },
      {
        onSuccess: (resolved) => {
          if (!resolved) {
            setState('error');
            toast.error(t('errorTitle'), {
              description: t('error'),
            });
            return;
          }

          const shouldReview =
            resolved.reviewRequired ||
            resolved.warnings.includes(LookupWarningCode.PartialData);
          setState(shouldReview ? 'partial' : 'ready');
          onResolved(resolved);
        },
        onError: (error) => {
          const isServiceDown = isServiceUnavailableError(error);
          setState(isServiceDown ? 'serviceUnavailable' : 'error');
          toast.error(
            isServiceDown ? t('serviceUnavailableTitle') : t('errorTitle'),
            {
              description: isServiceDown
                ? t('serviceUnavailableDescription')
                : t('error'),
            },
          );
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,22rem)_1fr]">
        <section className="flex flex-col gap-2">
          <div>
            <h4 className="text-sm font-semibold text-foreground">
              {t('productPhoto.sectionTitle')}
            </h4>
            <p className="mt-0.5 text-sm text-muted">
              {t('productPhoto.helper')}
            </p>
          </div>

          {productPhoto ? (
            <div className="flex flex-col gap-3">
              <div className="relative w-full max-w-60 overflow-hidden rounded-2xl border-2 border-accent-strong bg-background">
                <img
                  src={productPhoto.previewUrl}
                  alt={t('productPhoto.sectionTitle')}
                  className="aspect-[4/5] w-full object-cover"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => productInputRef.current?.click()}
                >
                  <RefreshCw className="h-4 w-4" />
                  {t('productPhoto.replaceAction')}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveProductPhoto}
                >
                  <Trash2 className="h-4 w-4" />
                  {t('productPhoto.removeAction')}
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => productInputRef.current?.click()}
              className="flex aspect-[4/5] w-full max-w-60 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-surface-muted/40 px-4 text-center text-muted transition hover:border-border-strong hover:bg-surface-muted/70"
            >
              <ImagePlus className="h-8 w-8" />
              <span className="text-sm font-medium text-foreground">
                {t('productPhoto.addAction')}
              </span>
            </button>
          )}

          <input
            ref={productInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            aria-label={t('productPhoto.addAction')}
            className="sr-only"
            onChange={(event) => {
              handleSetProductPhoto(event.target.files?.[0] ?? null);
              event.currentTarget.value = '';
            }}
          />
        </section>

        <section className="flex flex-col gap-2">
          <div>
            <h4 className="text-sm font-semibold text-foreground">
              {t('labelPhotos.sectionTitle')}
            </h4>
            <p className="mt-0.5 text-sm text-muted">
              {t('labelPhotos.helper')}
            </p>
          </div>

          <details className="group rounded-xl border border-border bg-surface-muted/40 px-3 py-2 text-sm">
            <summary className="cursor-pointer list-none font-medium text-foreground marker:hidden [&::-webkit-details-marker]:hidden">
              <span className="inline-flex items-center gap-2">
                <span className="transition group-open:rotate-90" aria-hidden>
                  ▸
                </span>
                {t('shapeTips.heading')}
              </span>
            </summary>
            <ul className="mt-2 flex flex-col gap-1.5 text-muted">
              <li>{t('shapeTips.rectangular')}</li>
              <li>{t('shapeTips.cylindrical')}</li>
              <li>{t('shapeTips.roundJar')}</li>
              <li>{t('shapeTips.pouch')}</li>
            </ul>
          </details>

          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
            {labelPhotos.map((photo) => (
              <div
                key={photo.id}
                className="relative overflow-hidden rounded-xl border border-border bg-background"
              >
                <img
                  src={photo.previewUrl}
                  alt=""
                  className="aspect-[4/5] w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveLabelPhoto(photo.id)}
                  aria-label={t('labelPhotos.removeAction')}
                  className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-background/90 text-muted shadow-sm transition hover:bg-background hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}

            {canAddLabelPhoto ? (
              <button
                type="button"
                onClick={() => labelInputRef.current?.click()}
                className="flex aspect-[4/5] w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border bg-surface-muted/40 px-2 text-center text-muted transition hover:border-border-strong hover:bg-surface-muted/70"
              >
                <ImagePlus className="h-5 w-5" />
                <span className="text-[11px] font-medium leading-tight text-foreground">
                  {t('labelPhotos.addAction')}
                </span>
              </button>
            ) : null}
          </div>

          <input
            ref={labelInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            aria-label={t('labelPhotos.addAction')}
            className="sr-only"
            onChange={(event) => {
              handleAddLabelPhotos(event.target.files);
              event.currentTarget.value = '';
            }}
          />
        </section>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-surface-muted px-4 py-3">
        <p
          className={
            helperKey === 'error' || helperKey === 'serviceUnavailable'
              ? 'text-sm text-danger'
              : 'text-sm text-muted'
          }
        >
          {t(helperKey)}
        </p>
        <Button
          type="button"
          size="sm"
          onClick={handleExtract}
          disabled={!canExtract || extractProductFromImages.isPending}
        >
          {extractProductFromImages.isPending ? (
            <>
              <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
              {t('extractingAction')}
            </>
          ) : (
            t('extractAction')
          )}
        </Button>
      </div>
    </div>
  );
}
