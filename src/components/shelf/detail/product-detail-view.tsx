'use client';

import {
  ArrowLeft,
  Calendar,
  Clock,
  Droplet,
  Package,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { DetailKvCell } from './detail-kv-cell';
import { DetailAboutTab } from './detail-about-tab';
import { DetailHowToUseTab } from './detail-how-to-use-tab';
import { DetailIngredientsTab } from './detail-ingredients-tab';
import { DetailManufacturerTab } from './detail-manufacturer-tab';
import { ProductDetailActions } from './product-detail-actions';
import { ProductIntroductionPanel } from '../product-introduction-status';
import { ProductPageHeader } from '../product-page-header';
import { CommunityProductEvidencePanel } from '@/components/community/community-product-evidence-panel';
import {
  isProductDetailTab,
  readProductDetailTab,
  saveProductDetailTab,
} from './product-detail-view-state';
import { ProductImageCarousel } from './product-image-carousel';
import {
  ConfirmDialog,
  ConfirmDialogTone,
} from '@/components/ui/confirm-dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { AppRoute } from '@/constants/app-routes';
import {
  useArchiveProduct,
  useDeleteProduct,
  useMarkProductFinished,
  useRestoreProduct,
  useUpdateProductIntroduction,
} from '@/hooks/use-shelf';
import { useShelfDateContext } from '@/hooks/use-shelf-time-zone';
import {
  requestAppScrollRestore,
  saveCurrentAppScrollPosition,
} from '@/lib/app-scroll-restoration';
import { getApiErrorMessage } from '@/lib/api-error';
import { formatLocalizedDate } from '@/lib/dayjs';
import { cn } from '@/lib/utils';
import {
  computeExpiresAt,
  deriveShelfLife,
  formatOpenedToken,
} from '@/lib/shelf-life';
import {
  ShelfLifeState,
  type ShelfProduct,
  ShelfStatus,
  type UpdateProductIntroductionPayload,
} from '@/types/shelf';

type Props = {
  product: ShelfProduct;
  onAfterMutation?: () => void;
};

const SHELF_LIFE_BAR_COLOR: Record<ShelfLifeState, string> = {
  [ShelfLifeState.Fresh]: 'bg-success',
  [ShelfLifeState.Aging]: 'bg-warning',
  [ShelfLifeState.Expired]: 'bg-danger',
  [ShelfLifeState.Unopened]: 'bg-muted/40',
  [ShelfLifeState.Finished]: 'bg-muted/40',
  [ShelfLifeState.Archived]: 'bg-muted/40',
};

export function ProductDetailView({ product, onAfterMutation }: Props) {
  const t = useTranslations('shelf.detail');
  const tCat = useTranslations('shelf.category');
  const tMethod = useTranslations('shelf.method');
  const tQty = useTranslations('shelf.quantity');
  const tCard = useTranslations('shelf.card');
  const tIntroduction = useTranslations('shelf.introduction');
  const locale = useLocale();
  const router = useRouter();
  const { timeZone } = useShelfDateContext();
  const archive = useArchiveProduct();
  const restore = useRestoreProduct();
  const finish = useMarkProductFinished();
  const remove = useDeleteProduct();
  const updateIntroduction = useUpdateProductIntroduction();
  const [activeTab, setActiveTab] = useState(() =>
    readProductDetailTab(product.id),
  );
  const [deleteOpen, setDeleteOpen] = useState(false);
  const productDetailPath = `${AppRoute.Shelf}/${product.id}`;

  const life = deriveShelfLife(product, { timeZone });
  const expires = computeExpiresAt(product);
  const openedToken = formatOpenedToken(product, { timeZone });
  const expiresLabel = formatLocalizedDate(expires, locale);
  const fillPercent =
    life.remainingFraction !== null
      ? Math.max(4, Math.round(life.remainingFraction * 100))
      : 100;

  const remainingLabel =
    life.remainingDays !== null
      ? life.remainingDays >= 60
        ? Math.round(life.remainingDays / 30) === 1
          ? t('shelfLife.remainingMonth', { count: 1 })
          : t('shelfLife.remainingMonths', {
              count: Math.round(life.remainingDays / 30),
            })
        : life.remainingDays === 1
          ? t('shelfLife.remainingDay', { count: 1 })
          : t('shelfLife.remainingDays', { count: life.remainingDays })
      : life.state === ShelfLifeState.Unopened
        ? t('shelfLife.unopened')
        : life.state === ShelfLifeState.Expired
          ? t('shelfLife.expired')
          : t('shelfLife.noData');

  const isArchived = product.status === ShelfStatus.Archived;
  const isMutating =
    archive.isPending ||
    restore.isPending ||
    finish.isPending ||
    remove.isPending ||
    updateIntroduction.isPending;

  const navigateToShelfWithRestore = () => {
    requestAppScrollRestore(AppRoute.Shelf);
    router.push(AppRoute.Shelf);
  };

  const handleEditClick = () => {
    saveCurrentAppScrollPosition(productDetailPath);
  };

  const handleTabChange = (value: string) => {
    if (!isProductDetailTab(value)) {
      return;
    }

    setActiveTab(value);
    saveProductDetailTab(product.id, value);
  };

  const handleFinish = () => {
    finish.mutate(product.id, {
      onSuccess: () => {
        toast.success(t('actions.markFinished'));
        onAfterMutation?.();
        navigateToShelfWithRestore();
      },
    });
  };
  const handleDeleteConfirm = () => {
    remove.mutate(product.id, {
      onSuccess: () => {
        toast.success(t('actions.delete'));
        setDeleteOpen(false);
        onAfterMutation?.();
        navigateToShelfWithRestore();
      },
    });
  };

  const handleArchiveToggle = () => {
    const mutate = isArchived ? restore.mutate : archive.mutate;
    const successMessage = isArchived
      ? t('actions.unarchive')
      : t('actions.archive');

    mutate(product.id, {
      onSuccess: () => {
        toast.success(successMessage);
        onAfterMutation?.();
        navigateToShelfWithRestore();
      },
    });
  };

  const handleIntroductionChange = (
    payload: UpdateProductIntroductionPayload,
  ) => {
    updateIntroduction.mutate(
      { id: product.id, payload },
      {
        onSuccess: () => {
          toast.success(tIntroduction('updated'));
          onAfterMutation?.();
        },
        onError: (error) => {
          const message =
            getApiErrorMessage(error) ?? tIntroduction('errors.updateFailed');
          toast.error(message);
        },
      },
    );
  };

  return (
    <div className="relative">
      <ProductPageHeader
        leading={
          <Link
            href={AppRoute.Shelf}
            aria-label={t('backLink')}
            onClick={(event) => {
              if (
                event.button === 0 &&
                !event.metaKey &&
                !event.ctrlKey &&
                !event.shiftKey &&
                !event.altKey
              ) {
                requestAppScrollRestore(AppRoute.Shelf);
              }
            }}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border-strong bg-surface text-foreground hover:bg-accent-soft"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
        }
        actionClassName="flex flex-wrap items-center justify-end gap-2"
        actions={
          <ProductDetailActions
            product={product}
            productDetailPath={productDetailPath}
            isArchived={isArchived}
            isMutating={isMutating}
            onArchiveToggle={handleArchiveToggle}
            onDeleteOpen={() => setDeleteOpen(true)}
            onEditClick={handleEditClick}
            onFinish={handleFinish}
          />
        }
      />

      <div className="mx-auto mt-4 grid max-w-5xl gap-6 md:grid-cols-[minmax(220px,260px)_1fr] md:gap-8">
        <div className="mx-auto w-full max-w-[200px] sm:max-w-[240px] md:mx-0 md:max-w-none">
          <ProductImageCarousel
            imageUrls={product.identity.imageUrls}
            brand={product.identity.brand}
            productName={product.identity.name}
            category={product.identity.category}
          />
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent-strong">
            {tCat(product.identity.category)}
          </p>
          <p className="-mt-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-muted">
            {product.identity.brand}
          </p>
          <h2 className="font-display text-xl font-bold leading-tight -tracking-[0.01em] sm:text-2xl">
            {product.identity.name}
          </h2>

          <dl className="grid gap-2 sm:grid-cols-2">
            <DetailKvCell
              icon={<Calendar className="h-4 w-4" />}
              label={t('meta.opened')}
              value={openedToken ?? t('meta.unopened')}
            />
            {expiresLabel ? (
              <DetailKvCell
                icon={<Clock className="h-4 w-4" />}
                label={t('meta.expires')}
                value={expiresLabel}
              />
            ) : null}
            {product.identity.sizeMl ? (
              <DetailKvCell
                icon={<Droplet className="h-4 w-4" />}
                label={t('meta.size')}
                value={`${product.identity.sizeMl} ${tCard('sizeSuffix')}`}
              />
            ) : null}
            {product.userFields.periodAfterOpeningMonths ? (
              <DetailKvCell
                icon={<Package className="h-4 w-4" />}
                label={t('meta.pao')}
                value={t('meta.paoValue', {
                  count: product.userFields.periodAfterOpeningMonths,
                })}
              />
            ) : null}
          </dl>

          {expires ? (
            <div className="rounded-2xl bg-surface-muted p-4">
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                  {t('shelfLife.label')}
                </span>
                <span className="text-sm font-semibold">{remainingLabel}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-foreground/10">
                <div
                  className={cn('h-full', SHELF_LIFE_BAR_COLOR[life.state])}
                  style={{ width: `${fillPercent}%` }}
                />
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-1.5">
            {product.guidance.applicationMethod ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent-strong">
                {tMethod(product.guidance.applicationMethod)}
              </span>
            ) : null}
            {product.guidance.quantity ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent-strong">
                {tQty(product.guidance.quantity)}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="mx-auto mt-8 max-w-5xl overflow-hidden rounded-3xl border border-border bg-surface"
      >
        <TabsList className="w-full justify-start overflow-x-auto rounded-none border-b border-border bg-surface-muted">
          <TabsTrigger value="about">{t('tabs.about')}</TabsTrigger>
          <TabsTrigger value="introduction">{t('tabs.introduction')}</TabsTrigger>
          <TabsTrigger value="ingredients">{t('tabs.ingredients')}</TabsTrigger>
          <TabsTrigger value="how-to-use">{t('tabs.howToUse')}</TabsTrigger>
          <TabsTrigger value="manufacturer">{t('tabs.manufacturer')}</TabsTrigger>
        </TabsList>
        <TabsContent value="about" className="mt-0 px-6 py-6">
          <DetailAboutTab identity={product.identity} />
        </TabsContent>
        <TabsContent value="introduction" className="mt-0 px-6 py-6">
          <ProductIntroductionPanel
            introduction={product.introduction}
            isPending={updateIntroduction.isPending}
            onChange={handleIntroductionChange}
          />
        </TabsContent>
        <TabsContent value="ingredients" className="mt-0 px-6 py-6">
          <DetailIngredientsTab
            productId={product.id}
            ingredients={product.identity.inciIngredients}
            lastConfirmedAt={product.identity.inciLastConfirmedAt}
          />
        </TabsContent>
        <TabsContent value="how-to-use" className="mt-0 px-6 py-6">
          <DetailHowToUseTab
            guidance={product.guidance}
            preferredTimeOfDay={product.userFields.preferredTimeOfDay}
          />
        </TabsContent>
        <TabsContent value="manufacturer" className="mt-0 px-6 py-6">
          <DetailManufacturerTab
            manufacturer={product.manufacturer}
            provenance={product.provenance}
            confirmedAt={product.identity.inciLastConfirmedAt ?? product.updatedAt}
          />
        </TabsContent>
      </Tabs>

      <CommunityProductEvidencePanel productId={product.id} />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t('actions.deleteConfirmTitle', {
          name: product.identity.name,
        })}
        description={t('actions.deleteConfirmBody')}
        confirmLabel={t('actions.delete')}
        cancelLabel={t('actions.deleteConfirmCancel')}
        onConfirm={handleDeleteConfirm}
        tone={ConfirmDialogTone.Danger}
        isPending={isMutating}
      />
    </div>
  );
}
