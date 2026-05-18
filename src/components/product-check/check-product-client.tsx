"use client";

import { Sparkles } from "lucide-react";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCheckProduct } from "@/hooks/use-ingredients";
import { normalizeLocale } from "@/i18n/config";
import { IngredientPastePanel } from "./ingredient-paste-panel";
import { ProductCheckResultDetails } from "./product-check-result-details";
import { ProductPhotoCheckPanel } from "./product-photo-check-panel";
import { ProductVerdictCard } from "./product-verdict-card";
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
  const [result, setResult] = useState<ProductCheckResponse | null>(null);

  const runCheck = (product: ProductCheckProductInput) => {
    const payload: ProductCheckInput = {
      product,
      language: locale,
    };

    setResult(null);
    checkProduct.mutate(payload, {
      onSuccess: (response) => {
        setResult(response);
      },
      onError: () => {
        setResult(null);
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
              isPending={checkProduct.isPending}
              onCheck={(input) => runCheck(input)}
            />
          </TabsContent>
          <TabsContent
            value={CheckProductTab.Photos}
            className="-mr-2 flex-1 overflow-y-auto pr-2 data-[state=inactive]:hidden"
          >
            <ProductPhotoCheckPanel
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
            <ProductCheckResultDetails result={result} />
          </>
        ) : (
          <EmptyVerdictPanel />
        )}
      </aside>
    </div>
  );
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
