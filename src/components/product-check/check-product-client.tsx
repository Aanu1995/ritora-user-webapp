"use client";

import { GitCompareArrows, Sparkles } from "lucide-react";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { QuickCheckProductCompareSheet } from "@/components/product-compare/product-compare-sheet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCheckProduct } from "@/hooks/use-ingredients";
import { useRefreshUserCapabilitiesOnRestriction } from "@/hooks/use-refresh-user-capabilities";
import {
  isCapabilityDisabled,
  useUserCapabilities,
} from "@/hooks/use-user-capabilities";
import { normalizeLocale } from "@/i18n/config";
import { IngredientPastePanel } from "./ingredient-paste-panel";
import { ProductCheckResultDetails } from "./product-check-result-details";
import { ProductPhotoCheckPanel } from "./product-photo-check-panel";
import { ProductVerdictCard } from "./product-verdict-card";
import { ProductCompareItemKind } from "@/types/ingredients";
import type {
  ProductCheckInput,
  ProductCheckProductInput,
  ProductCheckResponse,
} from "@/types/ingredients";

enum CheckProductTab {
  Paste = "paste",
  Photos = "photos",
}

export function CheckProductClient() {
  const t = useTranslations("checkProduct");
  const locale = normalizeLocale(useLocale());
  const checkProduct = useCheckProduct();
  const refreshCapabilitiesOnRestriction =
    useRefreshUserCapabilitiesOnRestriction();
  const capabilities = useUserCapabilities();
  const isAiDisabled = isCapabilityDisabled(capabilities.aiGeneration);
  const isPhotoCheckDisabled =
    isCapabilityDisabled(capabilities.imageUpload) ||
    isCapabilityDisabled(capabilities.productExtraction) ||
    isAiDisabled;
  const [result, setResult] = useState<ProductCheckResponse | null>(null);
  const [lastCheckedProduct, setLastCheckedProduct] =
    useState<ProductCheckProductInput | null>(null);

  const runCheck = (product: ProductCheckProductInput) => {
    if (isAiDisabled) {
      return;
    }

    const payload: ProductCheckInput = {
      product,
      language: locale,
    };

    setResult(null);
    checkProduct.mutate(payload, {
      onSuccess: (response) => {
        setLastCheckedProduct(product);
        setResult(response);
      },
      onError: (error) => {
        setLastCheckedProduct(null);
        setResult(null);
        if (refreshCapabilitiesOnRestriction(error)) {
          return;
        }

        toast.error(t("errors.checkFailed"));
      },
    });
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,28rem)]">
      <section className="animate-fade-up flex flex-col rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-soft)] sm:p-6 xl:sticky xl:top-24 xl:max-h-[calc(100dvh-9rem)] xl:self-start xl:overflow-hidden">
        <Tabs
          defaultValue={CheckProductTab.Paste}
          className="flex min-h-0 flex-1 flex-col"
        >
          <TabsList aria-label={t("tabsLabel")} className="shrink-0">
            <TabsTrigger value={CheckProductTab.Paste}>
              {t("tabs.paste")}
            </TabsTrigger>
            <TabsTrigger value={CheckProductTab.Photos}>
              {t("tabs.photos")}
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value={CheckProductTab.Paste}
            className="-mr-2 flex-1 overflow-y-auto pr-2 data-[state=inactive]:hidden"
          >
            <IngredientPastePanel
              disabled={isAiDisabled}
              isPending={checkProduct.isPending}
              onCheck={(input) => runCheck(input)}
            />
          </TabsContent>
          <TabsContent
            value={CheckProductTab.Photos}
            className="-mr-2 flex-1 overflow-y-auto pr-2 data-[state=inactive]:hidden"
          >
            <ProductPhotoCheckPanel
              disabled={isPhotoCheckDisabled}
              isPending={checkProduct.isPending}
              onCheck={(input) => runCheck(input)}
            />
          </TabsContent>
        </Tabs>
      </section>

      <aside className="animate-fade-up-delay-1 -mr-2 flex flex-col gap-4 pr-2 xl:sticky xl:top-24 xl:max-h-[calc(100dvh-9rem)] xl:self-start xl:overflow-y-auto">
        {result ? (
          <>
            <ProductVerdictCard verdict={result.verdict} />
            {lastCheckedProduct ? (
              <CompareWithShelfCard
                anchor={{
                  kind: ProductCompareItemKind.CheckedProduct,
                  product: lastCheckedProduct,
                }}
                anchorLabel={formatCheckedProductLabel(
                  lastCheckedProduct,
                  t("compare.checkedProductFallback"),
                )}
              />
            ) : null}
            <ProductCheckResultDetails result={result} />
          </>
        ) : (
          <EmptyVerdictPanel />
        )}
      </aside>
    </div>
  );
}

function CompareWithShelfCard({
  anchor,
  anchorLabel,
}: {
  anchor: Parameters<typeof QuickCheckProductCompareSheet>[0]["anchor"];
  anchorLabel: string;
}) {
  const t = useTranslations("checkProduct.compare");

  return (
    <section className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-strong">
          <GitCompareArrows className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-sm font-bold text-foreground sm:text-[15px]">
            {t("cardTitle")}
          </h3>
          <p className="mt-0.5 text-xs leading-snug text-muted sm:text-[13px]">
            {t("cardBody")}
          </p>
        </div>
      </div>
      <QuickCheckProductCompareSheet
        anchor={anchor}
        anchorLabel={anchorLabel}
        trigger={
          <Button size="sm" variant="outline" className="mt-3 w-full">
            <GitCompareArrows className="h-4 w-4" aria-hidden />
            {t("cardAction")}
          </Button>
        }
      />
    </section>
  );
}

function formatCheckedProductLabel(
  product: ProductCheckProductInput,
  fallback: string,
): string {
  return [product.brand, product.name]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value))
    .join(" ") || fallback;
}

function EmptyVerdictPanel() {
  const t = useTranslations("checkProduct.empty");
  return (
    <section className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-surface-muted px-6 py-8 text-center">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent-strong">
        <Sparkles className="h-6 w-6" aria-hidden />
      </span>
      <h2 className="mt-4 font-display text-base font-bold text-foreground">
        {t("title")}
      </h2>
      <p className="mt-1.5 max-w-sm text-sm text-muted">{t("body")}</p>
    </section>
  );
}
