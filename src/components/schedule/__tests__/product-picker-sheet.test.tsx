import { fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import enMessages from '../../../../messages/en.json';
import { ProductPickerSheet } from '../product-picker-sheet';

jest.mock('@/components/ui/sheet', () => ({
  Sheet: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetContent: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <div className={className}>{children}</div>,
  SheetTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetDescription: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock('../product-picker-content', () => ({
  ProductPickerContent: ({
    onSelect,
  }: {
    onSelect: (product: { id: string }) => void;
  }) => (
    <button
      type="button"
      onClick={() =>
        onSelect({
          id: 'product-1',
          brand: 'Brand',
          name: 'Product',
          category: 'cleanser',
          imageUrl: null,
          status: 'active',
        })
      }
    >
      Pick product
    </button>
  ),
}));

describe('ProductPickerSheet', () => {
  it('does not close the sheet before the editor can consume a picked product', () => {
    const onOpenChange = jest.fn();
    const onSelect = jest.fn();

    render(
      <NextIntlClientProvider locale="en" messages={enMessages}>
        <ProductPickerSheet
          open
          onOpenChange={onOpenChange}
          onSelect={onSelect}
        />
      </NextIntlClientProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /pick product/i }));

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'product-1' }),
    );
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
