'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  ProductFormBody,
  type ProductFormValue,
} from '../product-form-body';
import { Button } from '@/components/ui/button';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { AppRoute } from '@/constants/app-routes';
import { useUpdateProduct } from '@/hooks/use-shelf';
import { normalizeShelfProductForm, validateShelfProductForm } from '@/lib/shelf-form';
import {
  ShelfFormValidationCode,
  type ShelfProduct,
} from '@/types/shelf';

type Props = {
  product: ShelfProduct;
};

export function ProductEditForm({ product }: Props) {
  const t = useTranslations('shelf.edit');
  const tDetail = useTranslations('shelf.detail');
  const tValidation = useTranslations('shelf.dialog.validation');
  const router = useRouter();
  const updateProduct = useUpdateProduct();

  const [value, setValue] = useState<ProductFormValue>({
    identity: product.identity,
    guidance: product.guidance,
    manufacturer: product.manufacturer,
    userFields: product.userFields,
  });
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
        return t('genericError');
    }
  };

  const handleSave = () => {
    if (validationCode) {
      setSubmitError(getValidationMessage(validationCode));
      return;
    }

    setSubmitError(null);
    const normalized = normalizeShelfProductForm(value);

    updateProduct.mutate(
      {
        id: product.id,
        patch: {
          identity: normalized.identity,
          manufacturer: normalized.manufacturer,
          guidance: normalized.guidance,
          userFields: normalized.userFields,
        },
      },
      {
        onSuccess: () => {
          toast.success(t('successToast'));
          router.push(`${AppRoute.Shelf}/${product.id}`);
        },
        onError: () => {
          setSubmitError(t('genericError'));
        },
      },
    );
  };

  return (
    <div className="relative pb-16">
      {/* Sticky header — direct child of <main>, spans full width */}
      <div className="sticky top-0 z-10 -mx-4 bg-background/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <Link
            href={`${AppRoute.Shelf}/${product.id}`}
            aria-label={tDetail('backLink')}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border-strong bg-surface text-foreground hover:bg-surface-muted"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="truncate text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {t('title')}
            </h1>
            <p className="mt-0.5 truncate text-xs text-muted sm:text-sm">
              {product.identity.brand} · {product.identity.name}
            </p>
          </div>
          <div className="shrink-0">
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={updateProduct.isPending}
            >
              {updateProduct.isPending ? (
                <LoadingIndicator label={t('saving')} />
              ) : (
                <>
                  <span className="sm:hidden">{t('saveShort')}</span>
                  <span className="hidden sm:inline">{t('save')}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        className="mx-auto mt-6 max-w-5xl"
      >
        {submitError ? (
          <div
            role="alert"
            className="mb-4 rounded-2xl border border-danger bg-danger/10 px-4 py-3 text-sm text-danger"
          >
            {submitError}
          </div>
        ) : null}
        <ProductFormBody value={value} onChange={setValue} />
      </form>
    </div>
  );
}
