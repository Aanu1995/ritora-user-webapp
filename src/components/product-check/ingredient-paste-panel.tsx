'use client';

import { ClipboardCheck } from 'lucide-react';
import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { parseIngredientPaste } from '@/lib/product-check';
import {
  ProductCheckSource,
  type ProductCheckProductInput,
} from '@/types/ingredients';
import { ProductCategory } from '@/types/shelf';

type Props = {
  canRunCheck?: boolean;
  disabled?: boolean;
  isPending: boolean;
  onCheck: (input: ProductCheckProductInput) => void;
  onCheckBlocked?: () => void;
};

const CATEGORY_OPTIONS = Object.values(ProductCategory);

export function IngredientPastePanel({
  canRunCheck = true,
  disabled = false,
  isPending,
  onCheck,
  onCheckBlocked,
}: Props) {
  const t = useTranslations('checkProduct.paste');
  const tCategories = useTranslations('checkProduct.categories');
  const fieldId = useId();
  const [brand, setBrand] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>(
    ProductCategory.Serum,
  );
  const [ingredients, setIngredients] = useState('');
  const parsedIngredients = parseIngredientPaste(ingredients);
  const canSubmit =
    brand.trim().length > 0 &&
    name.trim().length > 0 &&
    parsedIngredients.length > 0 &&
    !disabled &&
    !isPending;

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (!canSubmit) {
          return;
        }

        if (!canRunCheck) {
          onCheckBlocked?.();
          return;
        }

        onCheck({
          source: ProductCheckSource.IngredientPaste,
          brand: brand.trim(),
          name: name.trim(),
          category,
          inciIngredients: parsedIngredients,
        });
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${fieldId}-brand`}>{t('brandLabel')}</Label>
          <Input
            id={`${fieldId}-brand`}
            required
            value={brand}
            onChange={(event) => setBrand(event.target.value)}
            placeholder={t('brandPlaceholder')}
            autoComplete="organization"
            className="border-border-strong"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${fieldId}-name`}>{t('nameLabel')}</Label>
          <Input
            id={`${fieldId}-name`}
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t('namePlaceholder')}
            autoComplete="off"
            className="border-border-strong"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${fieldId}-category`}>{t('categoryLabel')}</Label>
        <Select
          value={category}
          onValueChange={(value) => setCategory(value as ProductCategory)}
        >
          <SelectTrigger
            id={`${fieldId}-category`}
            className="border-border-strong"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {tCategories(option)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${fieldId}-ingredients`}>
          {t('ingredientsLabel')}
        </Label>
        <textarea
          id={`${fieldId}-ingredients`}
          required
          value={ingredients}
          onChange={(event) => setIngredients(event.target.value)}
          placeholder={t('ingredientsPlaceholder')}
          className="block min-h-40 w-full resize-y rounded-xl border border-border-strong bg-background px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted focus-visible:ring-2 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface-muted px-4 py-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-strong">
          <span
            className="h-1.5 w-1.5 rounded-full bg-accent-strong"
            aria-hidden
          />
          {t('parsedCount', { count: parsedIngredients.length })}
        </span>
        <Button type="submit" size="sm" disabled={!canSubmit}>
          {isPending ? (
            <LoadingIndicator size="sm" label={t('checkingAction')} />
          ) : (
            <>
              <ClipboardCheck className="h-4 w-4" />
              {t('checkAction')}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
