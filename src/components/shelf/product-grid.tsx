'use client';

import { ProductCard } from './product-card';
import {
  ProductIntroductionStatus,
  type ShelfProduct,
} from '@/types/shelf';

type Props = {
  products: ShelfProduct[];
  timeZone: string;
  selectedIds: ReadonlySet<string>;
  onOpen: (id: string) => void;
  onToggleSelect: (id: string) => void;
  onIntroductionStatusChange?: (
    productId: string,
    status: ProductIntroductionStatus,
  ) => void;
  isIntroductionPending?: boolean;
};

export function ProductGrid({
  products,
  timeZone,
  selectedIds,
  onOpen,
  onToggleSelect,
  onIntroductionStatusChange,
  isIntroductionPending = false,
}: Props) {
  return (
    <div
      data-testid="product-grid"
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-5"
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          timeZone={timeZone}
          isSelected={selectedIds.has(product.id)}
          onOpen={onOpen}
          onToggleSelect={onToggleSelect}
          onIntroductionStatusChange={onIntroductionStatusChange}
          isIntroductionPending={isIntroductionPending}
        />
      ))}
    </div>
  );
}
