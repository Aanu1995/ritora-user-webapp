"use client";

import {
  Archive,
  Check,
  GitCompareArrows,
  Pencil,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ShelfProductCompareSheet } from "@/components/product-compare/shelf-product-compare-sheet";
import { Button } from "@/components/ui/button";
import { ProductCompareItemKind } from "@/types/ingredients";
import { type ShelfProduct } from "@/types/shelf";

type Props = {
  product: ShelfProduct;
  productDetailPath: string;
  isArchived: boolean;
  isMutating: boolean;
  onArchiveToggle: () => void;
  onDeleteOpen: () => void;
  onEditClick: () => void;
  onFinish: () => void;
};

export function ProductDetailActions({
  product,
  productDetailPath,
  isArchived,
  isMutating,
  onArchiveToggle,
  onDeleteOpen,
  onEditClick,
  onFinish,
}: Props) {
  const t = useTranslations("shelf.detail");
  const tEdit = useTranslations("shelf.edit");

  return (
    <>
      <ShelfProductCompareSheet
        anchor={{
          kind: ProductCompareItemKind.ShelfProduct,
          productId: product.id,
        }}
        anchorLabel={`${product.identity.brand} ${product.identity.name}`}
        excludeProductIds={[product.id]}
        trigger={
          <Button
            size="sm"
            variant="secondary"
            aria-label={t("actions.compare")}
            className="w-7 px-0 sm:w-auto sm:px-4"
          >
            <GitCompareArrows className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t("actions.compare")}</span>
          </Button>
        }
      />

      <Button asChild size="sm" className="w-7 px-0 sm:w-auto sm:px-4">
        <Link
          href={`${productDetailPath}/edit`}
          aria-label={tEdit("title")}
          onClick={onEditClick}
        >
          <Pencil className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t("actions.edit")}</span>
        </Link>
      </Button>

      <Button
        size="sm"
        variant="secondary"
        onClick={onArchiveToggle}
        aria-label={isArchived ? t("actions.unarchive") : t("actions.archive")}
        disabled={isMutating}
        className="w-7 px-0 sm:w-auto sm:px-4"
      >
        <Archive className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">
          {isArchived ? t("actions.unarchive") : t("actions.archive")}
        </span>
      </Button>

      <Button
        size="sm"
        variant="secondary"
        onClick={onFinish}
        aria-label={t("actions.markFinished")}
        disabled={isMutating}
        className="w-7 px-0 sm:w-auto sm:px-4"
      >
        <Check className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{t("actions.markFinished")}</span>
      </Button>

      <Button
        size="sm"
        onClick={onDeleteOpen}
        aria-label={t("actions.delete")}
        className="w-7 bg-danger/10 px-0 text-danger shadow-none hover:bg-danger/15 sm:w-auto sm:px-4"
        disabled={isMutating}
      >
        <Trash2 className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{t("actions.delete")}</span>
      </Button>
    </>
  );
}
