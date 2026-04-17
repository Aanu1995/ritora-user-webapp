'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { ProductFormBody, type ProductFormValue } from './product-form-body';
import { QuickLookupCard } from './add-product/quick-lookup-card';
import { buildTemplateGuidance } from './add-product/category-templates';
import { Button } from '@/components/ui/button';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { AppRoute } from '@/constants/app-routes';
import { useCreateProduct } from '@/hooks/use-shelf';
import {
  createEmptyIdentity,
  createEmptyManufacturer,
  createEmptyUserFields,
  toShelfProductDraft,
  validateShelfProductForm,
} from '@/lib/shelf-form';
import {
  type ApplicationGuidance,
  type CatalogueIdentity,
  DataProvenance,
  type ManufacturerInfo,
  ShelfFormValidationCode,
  type ShelfProductPartial,
} from '@/types/shelf';

export function AddProductPage() {
  const t = useTranslations('shelf');
  const tDialog = useTranslations('shelf.dialog');
  const tValidation = useTranslations('shelf.dialog.validation');
  const router = useRouter();
  const createProduct = useCreateProduct();

  const [value, setValue] = useState<ProductFormValue>(() => {
    const identity = createEmptyIdentity();
    return {
      identity,
      manufacturer: createEmptyManufacturer(),
      guidance: buildTemplateGuidance(identity.category, [], []),
      userFields: createEmptyUserFields(),
    };
  });
  const [provenance, setProvenance] = useState<DataProvenance>(
    DataProvenance.UserEntered,
  );
  const [identitySource, setIdentitySource] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validationCode = validateShelfProductForm(value);
  const getValidationMessage = (code: ShelfFormValidationCode) => {
    switch (code) {
      case ShelfFormValidationCode.BrandRequired:
        return tValidation('brandRequired');
      case ShelfFormValidationCode.NameRequired:
        return tValidation('nameRequired');
      case ShelfFormValidationCode.SizeInvalid:
        return tValidation('sizeInvalid');
      case ShelfFormValidationCode.PriceInvalid:
        return tValidation('priceInvalid');
      case ShelfFormValidationCode.SupportEmailInvalid:
        return tValidation('supportEmailInvalid');
      case ShelfFormValidationCode.ProductUrlInvalid:
        return tValidation('productUrlInvalid');
      default:
        return tDialog('genericError');
    }
  };

  const handleLookupResult = (
    partial: ShelfProductPartial,
    nextProvenance: DataProvenance,
  ) => {
    setValue((prev) => {
      const nextIdentity: CatalogueIdentity = {
        ...prev.identity,
        ...(partial.identity ?? {}),
      };
      const nextManufacturer: ManufacturerInfo = {
        ...prev.manufacturer,
        ...(partial.manufacturer ?? {}),
      };
      const nextGuidance: ApplicationGuidance =
        prev.guidance.steps.length > 0
          ? prev.guidance
          : buildTemplateGuidance(nextIdentity.category, [], []);
      return {
        ...prev,
        identity: nextIdentity,
        manufacturer: nextManufacturer,
        guidance: nextGuidance,
      };
    });
    setProvenance(nextProvenance);
    setIdentitySource(
      nextProvenance === DataProvenance.BarcodeLookup
        ? tDialog('confirm.fromSource')
        : nextProvenance === DataProvenance.UrlFetch
          ? tDialog('confirm.fromUrl')
          : tDialog('confirm.fromSource'),
    );
  };

  const handleSave = () => {
    if (validationCode) {
      setSubmitError(getValidationMessage(validationCode));
      return;
    }
    setSubmitError(null);
    const draft = toShelfProductDraft(value, provenance);

    createProduct.mutate(draft, {
      onSuccess: (created) => {
        toast.success(tDialog('confirm.successToast'));
        router.push(`${AppRoute.Shelf}/${created.id}`);
      },
      onError: () => {
        setSubmitError(tDialog('genericError'));
      },
    });
  };

  return (
    <div className="relative pb-16">
      {/* Sticky header — direct child of <main>, spans full width */}
      <div className="sticky top-0 z-10 -mx-4 bg-background/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <Link
            href={AppRoute.Shelf}
            aria-label={t('detail.backLink')}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border-strong bg-surface text-foreground hover:bg-surface-muted"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="truncate text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {tDialog('title')}
            </h1>
            <p className="mt-0.5 truncate text-xs text-muted sm:text-sm">
              {tDialog('subtitle')}
            </p>
          </div>
          <div className="shrink-0">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={createProduct.isPending}
            >
              {createProduct.isPending ? (
                <LoadingIndicator label={tDialog('confirm.submitting')} />
              ) : (
                tDialog('confirm.submit')
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-6 flex max-w-5xl flex-col gap-6">
        <QuickLookupCard onResult={handleLookupResult} />

        {submitError ? (
          <div
            role="alert"
            className="rounded-2xl border border-danger bg-danger/10 px-4 py-3 text-sm text-danger"
          >
            {submitError}
          </div>
        ) : null}

        <ProductFormBody
          value={value}
          onChange={setValue}
          identityReadOnly={false}
          identitySourceLabel={identitySource ?? undefined}
        />
      </div>
    </div>
  );
}
