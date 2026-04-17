'use client';

import {
  Archive,
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  Droplet,
  Package,
  Pencil,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { DetailAboutTab } from './detail-about-tab';
import { DetailHowToUseTab } from './detail-how-to-use-tab';
import { DetailIngredientsTab } from './detail-ingredients-tab';
import { DetailManufacturerTab } from './detail-manufacturer-tab';
import { ProductImageCarousel } from './product-image-carousel';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { AppRoute } from '@/constants/app-routes';
import {
  useArchiveProducts,
  useDeleteProduct,
  useMarkFinished,
  useRestoreProducts,
} from '@/hooks/use-shelf';
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
  const tEdit = useTranslations('shelf.edit');
  const router = useRouter();
  const archive = useArchiveProducts();
  const restore = useRestoreProducts();
  const finish = useMarkFinished();
  const remove = useDeleteProduct();
  const [activeTab, setActiveTab] = useState<
    'about' | 'ingredients' | 'how-to-use' | 'manufacturer'
  >('about');
  const [deleteOpen, setDeleteOpen] = useState(false);

  const life = deriveShelfLife(product);
  const expires = computeExpiresAt(product);
  const openedToken = formatOpenedToken(product);
  const fillPercent =
    life.remainingFraction !== null
      ? Math.max(4, Math.round(life.remainingFraction * 100))
      : 100;

  const handleFinish = () => {
    finish.markFinished([product.id], {
      onSuccess: () => {
        toast.success(t('actions.markFinished'));
        onAfterMutation?.();
        router.push(AppRoute.Shelf);
      },
    });
  };
  const handleDeleteConfirm = () => {
    remove.mutate(product.id, {
      onSuccess: () => {
        toast.success(t('actions.delete'));
        setDeleteOpen(false);
        onAfterMutation?.();
        router.push(AppRoute.Shelf);
      },
    });
  };

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
    archive.isPending || restore.isPending || finish.isPending || remove.isPending;

  const handleArchiveToggle = () => {
    const mutation = isArchived ? restore.restore : archive.archive;
    const successMessage = isArchived
      ? t('actions.unarchive')
      : t('actions.archive');

    mutation([product.id], {
      onSuccess: () => {
        toast.success(successMessage);
        onAfterMutation?.();
        router.push(AppRoute.Shelf);
      },
    });
  };

  return (
    <div className="relative pb-16">
      {/* Sticky header: back arrow + compact action bar — direct child of <main> */}
      <div className="sticky top-0 z-10 -mx-4 bg-background/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="mx-auto flex max-w-5xl items-center gap-2">
          <Link
            href={AppRoute.Shelf}
            aria-label={t('backLink')}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border-strong bg-surface text-foreground hover:bg-surface-muted"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div className="flex-1" />

          <div className="flex flex-wrap items-center gap-2">
          {/* Edit — primary */}
          <Button asChild size="sm">
            <Link
              href={`${AppRoute.Shelf}/${product.id}/edit`}
              aria-label={tEdit('title')}
            >
              <Pencil className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t('actions.edit')}</span>
            </Link>
          </Button>

          {/* Archive — secondary */}
          <Button
            size="sm"
            variant="secondary"
            onClick={handleArchiveToggle}
            aria-label={
              isArchived ? t('actions.unarchive') : t('actions.archive')
            }
            disabled={isMutating}
          >
            <Archive className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">
              {isArchived ? t('actions.unarchive') : t('actions.archive')}
            </span>
          </Button>

          {/* Mark finished */}
          <Button
            size="sm"
            variant="secondary"
            onClick={handleFinish}
            aria-label={t('actions.markFinished')}
            disabled={isMutating}
          >
            <Check className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">
              {t('actions.markFinished')}
            </span>
          </Button>

          {/* Delete — danger */}
          <Button
            size="sm"
            onClick={() => setDeleteOpen(true)}
            aria-label={t('actions.delete')}
            className="bg-danger/10 text-danger shadow-none hover:bg-danger/15"
            disabled={isMutating}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('actions.delete')}</span>
          </Button>
          </div>
        </div>
      </div>

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
            <KvCell
              icon={<Calendar className="h-4 w-4" />}
              label={t('meta.opened')}
              value={openedToken ?? t('meta.unopened')}
            />
            {expires ? (
              <KvCell
                icon={<Clock className="h-4 w-4" />}
                label={t('meta.expires')}
                value={expires.toLocaleDateString()}
              />
            ) : null}
            {product.identity.sizeMl ? (
              <KvCell
                icon={<Droplet className="h-4 w-4" />}
                label={t('meta.size')}
                value={`${product.identity.sizeMl} ${tCard('sizeSuffix')}`}
              />
            ) : null}
            {product.userFields.periodAfterOpeningMonths ? (
              <KvCell
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
        onValueChange={(value) => setActiveTab(value as typeof activeTab)}
        className="mx-auto mt-8 max-w-5xl overflow-hidden rounded-3xl border border-border bg-surface"
      >
        <TabsList className="w-full justify-start rounded-none border-b border-border bg-surface-muted">
          <TabsTrigger value="about">{t('tabs.about')}</TabsTrigger>
          <TabsTrigger value="ingredients">{t('tabs.ingredients')}</TabsTrigger>
          <TabsTrigger value="how-to-use">{t('tabs.howToUse')}</TabsTrigger>
          <TabsTrigger value="manufacturer">{t('tabs.manufacturer')}</TabsTrigger>
        </TabsList>
        <TabsContent value="about" className="px-6 py-6">
          <DetailAboutTab identity={product.identity} />
        </TabsContent>
        <TabsContent value="ingredients" className="px-6 py-6">
          <DetailIngredientsTab
            ingredients={product.identity.inciIngredients}
            lastConfirmedAt={product.identity.inciLastConfirmedAt}
          />
        </TabsContent>
        <TabsContent value="how-to-use" className="px-6 py-6">
          <DetailHowToUseTab
            guidance={product.guidance}
            preferredTimeOfDay={product.userFields.preferredTimeOfDay}
          />
        </TabsContent>
        <TabsContent value="manufacturer" className="px-6 py-6">
          <DetailManufacturerTab
            manufacturer={product.manufacturer}
            provenance={product.provenance}
            confirmedAt={product.identity.inciLastConfirmedAt ?? product.updatedAt}
          />
        </TabsContent>
      </Tabs>

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
        tone="danger"
        isPending={isMutating}
      />
    </div>
  );
}

type KvProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

function KvCell({ icon, label, value }: KvProps) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl bg-surface-muted p-2.5">
      <span className="mt-0.5 text-accent-strong">{icon}</span>
      <div>
        <span className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
          {label}
        </span>
        <span className="text-[15px] font-semibold">{value}</span>
      </div>
    </div>
  );
}
