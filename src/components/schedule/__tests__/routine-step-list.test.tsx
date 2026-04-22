import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import enMessages from '../../../../messages/en.json';
import {
  StepLabel,
  type RoutineStepInput,
} from '@/types/schedule';
import { RoutineStepList } from '../routine-step-list';

const mockUseShelfProducts = jest.fn();

jest.mock('@/hooks/use-shelf', () => ({
  useShelfProducts: (...args: unknown[]) => mockUseShelfProducts(...args),
}));

jest.mock('@/components/ui/sheet', () => ({
  Sheet: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetContent: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <div className={className}>{children}</div>,
  SheetTitle: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SheetDescription: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock('@/components/ui/select', () => ({
  Select: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectItem: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => <div data-value={value}>{children}</div>,
  SelectTrigger: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <button className={className}>{children}</button>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <span>{placeholder}</span>
  ),
}));

function renderList(steps: RoutineStepInput[]) {
  return render(
    <NextIntlClientProvider locale="en" messages={enMessages}>
      <RoutineStepList
        steps={steps}
        productLookup={new Map()}
        onChange={jest.fn()}
        onProductPicked={jest.fn()}
      />
    </NextIntlClientProvider>,
  );
}

describe('RoutineStepList', () => {
  beforeEach(() => {
    mockUseShelfProducts.mockReset();
    mockUseShelfProducts.mockReturnValue({
      data: [],
      isLoading: false,
    });
  });

  it('does not query shelf products until the picker is opened', async () => {
    renderList([
      {
        id: 'step-1',
        stepOrder: 0,
        inventoryProductId: null,
        stepLabel: StepLabel.Cleanser,
      },
      {
        id: 'step-2',
        stepOrder: 1,
        inventoryProductId: null,
        stepLabel: StepLabel.Serum,
      },
    ]);

    expect(mockUseShelfProducts).not.toHaveBeenCalled();

    fireEvent.click(screen.getAllByRole('button', { name: /pick a product/i })[0]);

    await waitFor(() => {
      expect(mockUseShelfProducts).toHaveBeenCalledTimes(1);
    });
  });
});
