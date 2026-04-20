'use client';

import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  ImagePlus,
  LoaderCircle,
  Star,
  Trash2,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useExtractProductFromImages } from '@/hooks/use-shelf';
import { LookupWarningCode, type ResolvedLookup } from '@/types/shelf';

type Props = {
  onResolved: (resolved: ResolvedLookup) => void;
};

type ExtractionState = 'idle' | 'ready' | 'partial' | 'error';

type PhotoItem = {
  id: string;
  file: File;
  previewUrl: string;
};

const MIN_PHOTO_COUNT = 2;
const MAX_PHOTO_COUNT = 6;

let photoSequence = 0;

function createPhotoId(): string {
  photoSequence += 1;
  return `photo-${photoSequence}`;
}

function movePhoto(
  photos: PhotoItem[],
  fromIndex: number,
  toIndex: number,
): PhotoItem[] {
  const next = [...photos];
  const [photo] = next.splice(fromIndex, 1);

  if (!photo) {
    return photos;
  }

  next.splice(toIndex, 0, photo);
  return next;
}

type PhotoCardProps = {
  canMoveEarlier: boolean;
  canMoveLater: boolean;
  description: string;
  fileTypeLabel: string;
  isHero: boolean;
  label: string;
  onMakeHero: () => void;
  onMoveEarlier: () => void;
  onMoveLater: () => void;
  onRemove: () => void;
  previewUrl: string;
  savedBadge: string;
  selectHeroAction: string;
  extractionOnlyBadge: string;
  moveEarlierAction: string;
  moveLaterAction: string;
  removeAction: string;
};

function PhotoCard({
  canMoveEarlier,
  canMoveLater,
  description,
  fileTypeLabel,
  isHero,
  label,
  onMakeHero,
  onMoveEarlier,
  onMoveLater,
  onRemove,
  previewUrl,
  savedBadge,
  selectHeroAction,
  extractionOnlyBadge,
  moveEarlierAction,
  moveLaterAction,
  removeAction,
}: PhotoCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-border bg-surface-muted/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-medium text-foreground">{label}</h3>
          <p className="mt-1 text-sm text-muted">{description}</p>
        </div>
        <span className="rounded-full bg-background px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
          {fileTypeLabel}
        </span>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-border bg-background">
        <img
          src={previewUrl}
          alt={label}
          className="aspect-[4/5] w-full object-cover"
        />
        <div className="absolute left-3 top-3 rounded-full bg-background/95 px-3 py-1 text-xs font-semibold text-foreground shadow-sm">
          {isHero ? savedBadge : extractionOnlyBadge}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onMakeHero}
          disabled={isHero}
          className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-surface disabled:cursor-default disabled:opacity-60"
        >
          <Star className="h-4 w-4" />
          {isHero ? savedBadge : selectHeroAction}
        </button>
        <button
          type="button"
          onClick={onMoveEarlier}
          disabled={!canMoveEarlier}
          className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-muted transition hover:text-foreground disabled:cursor-default disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4" />
          {moveEarlierAction}
        </button>
        <button
          type="button"
          onClick={onMoveLater}
          disabled={!canMoveLater}
          className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-muted transition hover:text-foreground disabled:cursor-default disabled:opacity-50"
        >
          <ArrowRight className="h-4 w-4" />
          {moveLaterAction}
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-muted transition hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          {removeAction}
        </button>
      </div>
    </div>
  );
}

type ChecklistItemProps = {
  children: string;
};

function ChecklistItem({ children }: ChecklistItemProps) {
  return (
    <li className="flex items-start gap-2 text-sm text-muted">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
      <span>{children}</span>
    </li>
  );
}

export function PhotosTab({ onResolved }: Props) {
  const t = useTranslations('shelf.dialog.photos');
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [heroPhotoId, setHeroPhotoId] = useState<string | null>(null);
  const [state, setState] = useState<ExtractionState>('idle');
  const addInputRef = useRef<HTMLInputElement | null>(null);
  const photosRef = useRef<PhotoItem[]>([]);
  const extractProductFromImages = useExtractProductFromImages();

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  useEffect(() => {
    return () => {
      photosRef.current.forEach((photo) => {
        URL.revokeObjectURL(photo.previewUrl);
      });
    };
  }, []);

  const heroImageIndex = useMemo(
    () => photos.findIndex((photo) => photo.id === heroPhotoId),
    [heroPhotoId, photos],
  );
  const canAddMore = photos.length < MAX_PHOTO_COUNT;
  const canExtract = photos.length >= MIN_PHOTO_COUNT && heroImageIndex >= 0;
  const helperKey = useMemo(() => {
    if (extractProductFromImages.isPending) {
      return 'extracting';
    }

    if (!canExtract) {
      return 'incomplete';
    }

    if (state === 'partial') {
      return 'partial';
    }

    if (state === 'error') {
      return 'error';
    }

    if (!canAddMore) {
      return 'maxReached';
    }

    return 'ready';
  }, [canAddMore, canExtract, extractProductFromImages.isPending, state]);

  const handleAddPhoto = (file: File | null) => {
    if (!file || !canAddMore) {
      return;
    }

    const nextPhoto = {
      id: createPhotoId(),
      file,
      previewUrl: URL.createObjectURL(file),
    };

    setPhotos((current) => [...current, nextPhoto]);
    setHeroPhotoId((current) => current ?? nextPhoto.id);
    setState('idle');
  };

  const handleRemovePhoto = (photoId: string) => {
    setPhotos((current) => {
      const removedPhoto = current.find((photo) => photo.id === photoId);
      if (removedPhoto) {
        URL.revokeObjectURL(removedPhoto.previewUrl);
      }

      const next = current.filter((photo) => photo.id !== photoId);
      setHeroPhotoId((currentHeroId) => {
        if (currentHeroId !== photoId) {
          return currentHeroId;
        }

        return next[0]?.id ?? null;
      });
      return next;
    });
    setState('idle');
  };

  const handleMovePhoto = (fromIndex: number, toIndex: number) => {
    setPhotos((current) => movePhoto(current, fromIndex, toIndex));
    setState('idle');
  };

  const handleExtract = () => {
    if (!canExtract) {
      return;
    }

    setState('idle');
    extractProductFromImages.mutate(
      {
        images: photos.map((photo) => photo.file),
        heroImageIndex,
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
        onError: () => {
          setState('error');
          toast.error(t('errorTitle'), {
            description: t('error'),
          });
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-3xl border border-border bg-surface-muted/60 p-4">
        <h3 className="font-medium text-foreground">{t('heading')}</h3>
        <p className="mt-1 text-sm text-muted">{t('description')}</p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          <ChecklistItem>{t('checklist.brandVisible')}</ChecklistItem>
          <ChecklistItem>{t('checklist.fullIngredients')}</ChecklistItem>
          <ChecklistItem>{t('checklist.directionsWarnings')}</ChecklistItem>
          <ChecklistItem>{t('checklist.extraCurvedSections')}</ChecklistItem>
        </ul>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-border bg-background p-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">
            {t('uploaderHeading')}
          </p>
          <p className="mt-1 text-sm text-muted">{t('uploaderDescription')}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => addInputRef.current?.click()}
          disabled={!canAddMore}
        >
          <Camera className="mr-2 h-4 w-4" />
          {canAddMore ? t('addAction') : t('maxReachedAction')}
        </Button>
        <input
          ref={addInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={(event) => {
            handleAddPhoto(event.target.files?.[0] ?? null);
            event.currentTarget.value = '';
          }}
        />
      </div>

      {photos.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {photos.map((photo, index) => {
            const isHero = photo.id === heroPhotoId;
            const labelPhotoIndex = photos
              .slice(0, index + 1)
              .filter((candidate) => candidate.id !== heroPhotoId).length;

            return (
              <PhotoCard
                key={photo.id}
                canMoveEarlier={index > 0}
                canMoveLater={index < photos.length - 1}
                description={
                  isHero ? t('productPhotoHint') : t('labelPhotoHint')
                }
                fileTypeLabel={photo.file.type.split('/')[1] ?? 'image'}
                isHero={isHero}
                label={
                  isHero
                    ? t('productPhotoLabel')
                    : t('labelPhotoLabel', { index: labelPhotoIndex })
                }
                onMakeHero={() => {
                  setHeroPhotoId(photo.id);
                  setState('idle');
                }}
                onMoveEarlier={() => handleMovePhoto(index, index - 1)}
                onMoveLater={() => handleMovePhoto(index, index + 1)}
                onRemove={() => handleRemovePhoto(photo.id)}
                previewUrl={photo.previewUrl}
                savedBadge={t('savedBadge')}
                selectHeroAction={t('selectHeroAction')}
                extractionOnlyBadge={t('extractionOnlyBadge')}
                moveEarlierAction={t('moveEarlierAction')}
                moveLaterAction={t('moveLaterAction')}
                removeAction={t('removeAction')}
              />
            );
          })}
        </div>
      ) : (
        <div className="flex aspect-[16/7] w-full flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border bg-surface-muted/40 px-5 text-center text-muted">
          <ImagePlus className="h-10 w-10" />
          <p className="max-w-lg text-sm">{t('emptyState')}</p>
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-2xl bg-surface-muted p-4">
        <p className="text-sm text-muted">{t(helperKey)}</p>
        <Button
          type="button"
          onClick={handleExtract}
          disabled={!canExtract || extractProductFromImages.isPending}
          className="self-start"
        >
          {extractProductFromImages.isPending ? (
            <>
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
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
