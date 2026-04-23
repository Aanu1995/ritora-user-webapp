import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import enMessages from '../../../../messages/en.json';
import { useScheduleUiStore } from '@/stores/schedule-ui-store';
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

function renderList(
  steps: RoutineStepInput[],
  props?: Partial<React.ComponentProps<typeof RoutineStepList>>,
) {
  return render(
    <NextIntlClientProvider locale="en" messages={enMessages}>
      <RoutineStepList
        steps={steps}
        productLookup={new Map()}
        onChange={jest.fn()}
        onProductPicked={jest.fn()}
        {...props}
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
    useScheduleUiStore.setState({
      productPickerOpenForStepIndex: null,
      pendingProductSelection: null,
    });
  });

  it('opens the picker with the selected step label without querying shelf products on its own', () => {
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

    expect(useScheduleUiStore.getState().productPickerOpenForStepIndex).toBe(0);
    expect(useScheduleUiStore.getState().productPickerStepLabel).toBe(
      StepLabel.Cleanser,
    );
  });

  it('applies a picked product and closes the picker through the shared bridge', async () => {
    const onChange = jest.fn();
    const onProductPicked = jest.fn();
    const onProductPickerClose = jest.fn();

    renderList(
      [
        {
          id: 'step-1',
          stepOrder: 0,
          inventoryProductId: null,
          stepLabel: StepLabel.Cleanser,
        },
      ],
      {
        onChange,
        onProductPicked,
        onProductPickerClose,
      },
    );

    act(() => {
      useScheduleUiStore.setState({
        productPickerOpenForStepIndex: 0,
        pendingProductSelection: {
          id: 'product-1',
          brand: 'Brand',
          name: 'Product',
          category: 'cleanser',
          imageUrl: null,
          status: 'active',
        },
      });
    });

    await waitFor(() => {
      expect(onProductPicked).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'product-1' }),
      );
      expect(onChange).toHaveBeenCalledWith([
        expect.objectContaining({
          id: 'step-1',
          inventoryProductId: 'product-1',
        }),
      ]);
      expect(onProductPickerClose).toHaveBeenCalled();
      expect(useScheduleUiStore.getState().productPickerOpenForStepIndex).toBeNull();
    });
  });
});
