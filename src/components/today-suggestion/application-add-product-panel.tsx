"use client";

import { PlusCircle, X } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  ApplicationProductPicker,
  type ApplicationSelectableProduct,
} from "@/components/today-suggestion/application-product-picker";

type Props = {
  disabled?: boolean;
  onAddShelfProduct: (product: ApplicationSelectableProduct) => void;
  onAddOffShelfProduct: (input: { brand: string; name: string }) => void;
};

export function ApplicationAddProductPanel({
  disabled,
  onAddShelfProduct,
  onAddOffShelfProduct,
}: Props) {
  const t = useTranslations("todaysSuggestion.recordSheet.addProduct");
  const [open, setOpen] = useState(false);
  const [brand, setBrand] = useState("");
  const [name, setName] = useState("");
  const canAddOffShelf = brand.trim().length > 0 && name.trim().length > 0;

  if (!open) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-dashed border-[color:var(--border-strong)] bg-transparent p-3.5 text-left transition hover:bg-accent-soft disabled:opacity-60"
      >
        <PlusCircle className="h-4 w-4 text-accent-strong" />
        <span className="flex-1">
          <span className="block text-sm font-semibold text-accent-strong">
            {t("title")}
          </span>
          <span className="mt-0.5 block text-xs text-muted">{t("body")}</span>
        </span>
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-3xl border border-[color:var(--border-strong)] bg-accent-soft/30 p-3.5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">
            {t("panelTitle")}
          </p>
          <p className="text-xs text-muted">{t("panelBody")}</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-surface"
          aria-label={t("close")}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <ApplicationProductPicker
        disabled={disabled}
        onSelect={(product) => {
          onAddShelfProduct(product);
          setOpen(false);
        }}
      />
      <div className="mt-3 rounded-2xl border border-border bg-surface p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          {t("offShelfTitle")}
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <input
            value={brand}
            onChange={(event) => setBrand(event.target.value)}
            disabled={disabled}
            placeholder={t("brandPlaceholder")}
            className="h-10 rounded-xl border border-[color:var(--border-strong)] bg-surface px-3 text-sm text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
          />
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={disabled}
            placeholder={t("namePlaceholder")}
            className="h-10 rounded-xl border border-[color:var(--border-strong)] bg-surface px-3 text-sm text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
          />
        </div>
        <Button
          type="button"
          size="sm"
          disabled={disabled || !canAddOffShelf}
          onClick={() => {
            onAddOffShelfProduct({ brand: brand.trim(), name: name.trim() });
            setBrand("");
            setName("");
            setOpen(false);
          }}
          className="mt-2"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          {t("addOffShelf")}
        </Button>
      </div>
    </div>
  );
}
