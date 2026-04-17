'use client';

import { ProductCard } from './product-card';
import type { ShelfProduct } from '@/types/shelf';

type Props = {
  products: ShelfProduct[];
  selectedIds: ReadonlySet<string>;
  onOpen: (id: string) => void;
  onToggleSelect: (id: string) => void;
};

export function ProductGrid({
  products,
  selectedIds,
  onOpen,
  onToggleSelect,
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
          isSelected={selectedIds.has(product.id)}
          onOpen={onOpen}
          onToggleSelect={onToggleSelect}
        />
      ))}
    </div>
  );
}
