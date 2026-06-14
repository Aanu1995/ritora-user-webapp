import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import { ProductList } from '@/components/shelf/product-list';
import {
  DataProvenance,
  ProductCategory,
  ProductIntroductionStatus,
  ShelfStatus,
  type ShelfProduct,
} from '@/types/shelf';

const PRODUCT: ShelfProduct = {
  id: 'product-1',
  identity: {
    brand: 'CeraVe',
    name: 'Retinol Serum',
    category: ProductCategory.Serum,
    barcode: null,
    imageUrls: [],
    sizeMl: 30,
    description: null,
    benefits: [],
    suitedFor: [],
    inciIngredients: [],
    inciLastConfirmedAt: null,
  },
  guidance: {
    applicationMethod: null,
    quantity: null,
    steps: [],
    cautions: [],
    waitMinutes: null,
  },
  manufacturer: {
    brand: 'CeraVe',
    parentCompany: null,
    countryOfOrigin: null,
    countryOfManufacture: null,
    supportEmail: null,
    productUrl: null,
    websiteUrl: null,
  },
  userFields: {
    openedAt: null,
    expiresAt: null,
    periodAfterOpeningMonths: 12,
    pricePaid: null,
    pricePaidCurrency: null,
    purchasedFrom: null,
    personalNotes: null,
    preferredTimeOfDay: null,
  },
  status: ShelfStatus.Active,
  provenance: DataProvenance.PhotoLookup,
  createdAt: '2026-04-17T00:00:00.000Z',
  updatedAt: '2026-04-17T00:00:00.000Z',
};

describe('ProductList', () => {
  it('opens a product row and toggles selection separately', async () => {
    const user = userEvent.setup();
    const onOpen = jest.fn();
    const onToggleSelect = jest.fn();

    renderWithProviders(
      <ProductList
        products={[PRODUCT]}
        timeZone="Europe/Stockholm"
        selectedIds={new Set<string>()}
        onOpen={onOpen}
        onToggleSelect={onToggleSelect}
      />,
    );

    await user.click(screen.getByRole('button', { name: /cerave, retinol serum/i }));
    expect(onOpen).toHaveBeenCalledWith(PRODUCT.id);

    await user.click(screen.getByRole('checkbox', { name: /select cerave, retinol serum/i }));
    expect(onToggleSelect).toHaveBeenCalledWith(PRODUCT.id);
  });

  it('shows the product introduction status on the row image', () => {
    renderWithProviders(
      <ProductList
        products={[
          {
            ...PRODUCT,
            introduction: {
              status: ProductIntroductionStatus.Paused,
              startedAt: '2026-06-14T08:00:00.000Z',
              statusUpdatedAt: '2026-06-15T08:00:00.000Z',
            },
          },
        ]}
        timeZone="Europe/Stockholm"
        selectedIds={new Set<string>()}
        onOpen={jest.fn()}
        onToggleSelect={jest.fn()}
      />,
    );

    expect(
      within(screen.getByTestId('product-list-image-product-1')).getByText(
        /paused/i,
      ),
    ).toBeInTheDocument();
  });

  it('updates product introduction status from the row brand menu without opening the row', async () => {
    const user = userEvent.setup();
    const onOpen = jest.fn();
    const onIntroductionStatusChange = jest.fn();

    renderWithProviders(
      <ProductList
        products={[
          {
            ...PRODUCT,
            introduction: {
              status: ProductIntroductionStatus.Paused,
              startedAt: '2026-06-14T08:00:00.000Z',
              statusUpdatedAt: '2026-06-15T08:00:00.000Z',
            },
          },
        ]}
        timeZone="Europe/Stockholm"
        selectedIds={new Set<string>()}
        onOpen={onOpen}
        onToggleSelect={jest.fn()}
        onIntroductionStatusChange={onIntroductionStatusChange}
        isIntroductionPending={false}
      />,
    );

    const image = screen.getByTestId('product-list-image-product-1');
    expect(within(image).getByText(/paused/i)).toBeInTheDocument();
    expect(
      within(image).queryByRole('button', {
        name: /change product introduction status/i,
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: /explain product introduction statuses/i,
      }),
    ).toBeInTheDocument();
    const actions = screen.getByTestId(
      'product-list-introduction-actions-product-1',
    );
    expect(actions).toHaveClass('-mr-1.5');
    const actionButtons = within(actions).getAllByRole('button');
    expect(actionButtons[0]).toHaveAccessibleName(
      /change product introduction status/i,
    );
    expect(actionButtons[1]).toHaveAccessibleName(
      /explain product introduction statuses/i,
    );
    expect(actionButtons[0]).toHaveClass('rounded-full');
    expect(actionButtons[1]).toHaveClass('w-7');

    await user.click(
      screen.getByRole('button', {
        name: /change product introduction status/i,
      }),
    );
    await user.click(screen.getByRole('button', { name: /week 1/i }));

    expect(onIntroductionStatusChange).toHaveBeenCalledWith(
      PRODUCT.id,
      ProductIntroductionStatus.Week1,
    );
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('dismisses the introduction status popover without opening the row when the row is clicked outside', async () => {
    const user = userEvent.setup();
    const onOpen = jest.fn();

    renderWithProviders(
      <ProductList
        products={[
          {
            ...PRODUCT,
            introduction: {
              status: ProductIntroductionStatus.Paused,
              startedAt: '2026-06-14T08:00:00.000Z',
              statusUpdatedAt: '2026-06-15T08:00:00.000Z',
            },
          },
        ]}
        timeZone="Europe/Stockholm"
        selectedIds={new Set<string>()}
        onOpen={onOpen}
        onToggleSelect={jest.fn()}
      />,
    );

    await user.click(
      screen.getByRole('button', {
        name: /change product introduction status/i,
      }),
    );
    expect(screen.getByRole('button', { name: /week 1/i })).toBeInTheDocument();

    await user.click(screen.getByText('Retinol Serum'));

    expect(screen.queryByRole('button', { name: /week 1/i })).not.toBeInTheDocument();
    expect(onOpen).not.toHaveBeenCalled();
  });
});
