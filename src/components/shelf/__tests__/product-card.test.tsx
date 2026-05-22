import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import { ProductCard } from '@/components/shelf/product-card';
import {
  ApplicationMethod,
  DataProvenance,
  ProductCategory,
  Quantity,
  ShelfStatus,
  type ShelfProduct,
} from '@/types/shelf';

function makeProduct(overrides: Partial<ShelfProduct> = {}): ShelfProduct {
  return {
    id: 'product-1',
    identity: {
      brand: 'CeraVe',
      name: 'Resurfacing Retinol Serum',
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
      applicationMethod: ApplicationMethod.Fingertips,
      quantity: Quantity.TwoToThreeDrops,
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
      openedAt: '2026-03-27T00:00:00.000Z',
      expiresAt: '2027-03-27T00:00:00.000Z',
      periodAfterOpeningMonths: 12,
      pricePaid: null,
      pricePaidCurrency: null,
      purchasedFrom: null,
      personalNotes: null,
      preferredTimeOfDay: null,
    },
    status: ShelfStatus.Active,
    provenance: DataProvenance.PhotoLookup,
    createdAt: '2026-03-27T00:00:00.000Z',
    updatedAt: '2026-03-27T00:00:00.000Z',
    ...overrides,
  };
}

describe('ProductCard', () => {
  const user = userEvent.setup();

  it('renders brand, product name, and the category label', () => {
    renderWithProviders(
      <ProductCard
        product={makeProduct()}
        timeZone="Europe/Stockholm"
        isSelected={false}
        onOpen={jest.fn()}
        onToggleSelect={jest.fn()}
      />,
    );

    expect(screen.getByText('CeraVe')).toBeInTheDocument();
    expect(
      screen.getByText('Resurfacing Retinol Serum'),
    ).toBeInTheDocument();
    expect(screen.getByText('Serum')).toBeInTheDocument();
  });

  it('fires onOpen when the card body is clicked', async () => {
    const onOpen = jest.fn();
    renderWithProviders(
      <ProductCard
        product={makeProduct()}
        timeZone="Europe/Stockholm"
        isSelected={false}
        onOpen={onOpen}
        onToggleSelect={jest.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: /resurfacing/i }));
    expect(onOpen).toHaveBeenCalledWith('product-1');
  });

  it('fires onToggleSelect on checkbox click and does not open the card', async () => {
    const onOpen = jest.fn();
    const onToggleSelect = jest.fn();
    renderWithProviders(
      <ProductCard
        product={makeProduct()}
        timeZone="Europe/Stockholm"
        isSelected={false}
        onOpen={onOpen}
        onToggleSelect={onToggleSelect}
      />,
    );

    await user.click(screen.getByRole('checkbox'));
    expect(onToggleSelect).toHaveBeenCalledWith('product-1');
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('shows the Unopened token when openedAt is null', () => {
    renderWithProviders(
      <ProductCard
        product={makeProduct({
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
        })}
        timeZone="Europe/Stockholm"
        isSelected={false}
        onOpen={jest.fn()}
        onToggleSelect={jest.fn()}
      />,
    );

    expect(screen.getByText(/unopened/i)).toBeInTheDocument();
  });

  it('shows the Expired token when the product is past expiry', () => {
    renderWithProviders(
      <ProductCard
        product={makeProduct({
          userFields: {
            openedAt: '2024-01-01T00:00:00.000Z',
            expiresAt: '2024-12-01T00:00:00.000Z',
            periodAfterOpeningMonths: 11,
            pricePaid: null,
            pricePaidCurrency: null,
            purchasedFrom: null,
            personalNotes: null,
            preferredTimeOfDay: null,
          },
        })}
        timeZone="Europe/Stockholm"
        isSelected={false}
        onOpen={jest.fn()}
        onToggleSelect={jest.fn()}
      />,
    );

    expect(screen.getByText(/expired/i)).toBeInTheDocument();
  });

  it('does not render any AM or PM chips on the card', () => {
    renderWithProviders(
      <ProductCard
        product={makeProduct()}
        timeZone="Europe/Stockholm"
        isSelected={false}
        onOpen={jest.fn()}
        onToggleSelect={jest.fn()}
      />,
    );

    expect(screen.queryByText(/\bAM\b/)).not.toBeInTheDocument();
    expect(screen.queryByText(/\bPM\b/)).not.toBeInTheDocument();
    expect(screen.queryByText(/step \d/i)).not.toBeInTheDocument();
  });

  it('marks the checkbox as checked when isSelected is true', () => {
    renderWithProviders(
      <ProductCard
        product={makeProduct()}
        timeZone="Europe/Stockholm"
        isSelected
        onOpen={jest.fn()}
        onToggleSelect={jest.fn()}
      />,
    );

    expect(screen.getByRole('checkbox')).toBeChecked();
  });
});
