'use client';

import Image from 'next/image';
import {
  ChevronRight,
  ImagePlus,
  LoaderCircle,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

export type ExtractionState =
  | 'idle'
  | 'ready'
  | 'partial'
  | 'error'
  | 'serviceUnavailable';

export type PhotosHelperState =
  | ExtractionState
  | 'extracting'
  | 'incomplete'
  | 'maxReached';

export type PhotoItem = {
  id: string;
  file: File;
  previewUrl: string;
};

type ProductPhotoSectionProps = {
  onPhotoSelected: (file: File | null) => void;
  onRemove: () => void;
  photo: PhotoItem | null;
};

export function ProductPhotoSection({
  onPhotoSelected,
  onRemove,
  photo,
}: ProductPhotoSectionProps) {
  const t = useTranslations('shelf.dialog.photos');
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <section className="flex flex-col gap-2">
      <div>
        <h4 className="text-sm font-semibold text-foreground">
          {t('productPhoto.sectionTitle')}
        </h4>
        <p className="mt-0.5 text-sm text-muted">
          {t('productPhoto.helper')}
        </p>
      </div>

      {photo ? (
        <div className="flex flex-col gap-3">
          <div className="relative aspect-[4/5] w-full max-w-60 overflow-hidden rounded-2xl border-2 border-accent-strong bg-background">
            <Image
              src={photo.previewUrl}
              alt={t('productPhoto.sectionTitle')}
              fill
              unoptimized
              sizes="240px"
              className="object-cover"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
            >
              <RefreshCw className="h-4 w-4" />
              {t('productPhoto.replaceAction')}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-danger hover:bg-danger/10 hover:text-danger"
            >
              <Trash2 className="h-4 w-4" />
              {t('productPhoto.removeAction')}
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex aspect-[4/5] w-full max-w-60 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-surface-muted/40 px-4 text-center text-muted transition hover:border-border-strong hover:bg-accent-soft"
        >
          <ImagePlus className="h-8 w-8" />
          <span className="text-sm font-medium text-foreground">
            {t('productPhoto.addAction')}
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        aria-label={t('productPhoto.addAction')}
        className="sr-only"
        onChange={(event) => {
          onPhotoSelected(event.target.files?.[0] ?? null);
          event.currentTarget.value = '';
        }}
      />
    </section>
  );
}

type LabelPhotosSectionProps = {
  canAddPhoto: boolean;
  onFilesSelected: (files: FileList | readonly File[] | null) => void;
  onRemovePhoto: (photoId: string) => void;
  photos: PhotoItem[];
};

export function LabelPhotosSection({
  canAddPhoto,
  onFilesSelected,
  onRemovePhoto,
  photos,
}: LabelPhotosSectionProps) {
  const t = useTranslations('shelf.dialog.photos');
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <section className="flex flex-col gap-2">
      <div>
        <h4 className="text-sm font-semibold text-foreground">
          {t('labelPhotos.sectionTitle')}
        </h4>
        <p className="mt-0.5 text-sm text-muted">
          {t('labelPhotos.helper')}
        </p>
      </div>

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
        <ul className="mt-2 flex flex-col gap-1.5 pl-6 text-foreground/80">
          <li>{t('shapeTips.rectangular')}</li>
          <li>{t('shapeTips.cylindrical')}</li>
          <li>{t('shapeTips.roundJar')}</li>
          <li>{t('shapeTips.pouch')}</li>
        </ul>
      </details>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative aspect-[4/5] overflow-hidden rounded-xl border border-border bg-background"
          >
            <Image
              src={photo.previewUrl}
              alt=""
              fill
              unoptimized
              sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw"
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => onRemovePhoto(photo.id)}
              aria-label={t('labelPhotos.removeAction')}
              className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-background/90 text-danger shadow-sm transition hover:bg-danger/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {canAddPhoto ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-[4/5] w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border bg-surface-muted/40 px-2 text-center text-muted transition hover:border-border-strong hover:bg-accent-soft"
          >
            <ImagePlus className="h-5 w-5" />
            <span className="text-[11px] font-medium leading-tight text-foreground">
              {t('labelPhotos.addAction')}
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
        aria-label={t('labelPhotos.addAction')}
        className="sr-only"
        onChange={(event) => {
          onFilesSelected(event.target.files);
          event.currentTarget.value = '';
        }}
      />
    </section>
  );
}

type ExtractActionBarProps = {
  canExtract: boolean;
  helperKey: PhotosHelperState;
  isExtracting: boolean;
  onExtract: () => void;
};

export function ExtractActionBar({
  canExtract,
  helperKey,
  isExtracting,
  onExtract,
}: ExtractActionBarProps) {
  const t = useTranslations('shelf.dialog.photos');

  return (
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
        onClick={onExtract}
        disabled={!canExtract || isExtracting}
      >
        {isExtracting ? (
          <>
            <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
            {t('extractingAction')}
          </>
        ) : (
          t('extractAction')
        )}
      </Button>
    </div>
  );
}
