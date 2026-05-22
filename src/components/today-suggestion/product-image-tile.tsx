"use client";

import { SmoothImage } from "@/components/ui/smooth-image";
import { productCategoryEmoji } from "@/components/today-suggestion/product-category-icon";
import { cn } from "@/lib/utils";

type SuggestionProductImageTileProps = {
  imageUrl: string | null;
  label: string;
  category: string | null;
  className?: string;
  sizes?: string;
};

export function SuggestionProductImageTile({
  imageUrl,
  label,
  category,
  className,
  sizes = "40px",
}: SuggestionProductImageTileProps) {
  const fallback = (
    <span className="grid h-full w-full place-items-center" aria-hidden>
      {productCategoryEmoji(category ?? "")}
    </span>
  );

  return (
    <div
      className={cn(
        "grid h-12 w-10 shrink-0 place-items-center overflow-hidden rounded-md bg-surface text-base",
        className,
      )}
    >
      {imageUrl ? (
        <SmoothImage
          src={imageUrl}
          alt={label}
          className="h-full w-full rounded-[inherit]"
          sizes={sizes}
          fallback={fallback}
        />
      ) : (
        fallback
      )}
    </div>
  );
}
