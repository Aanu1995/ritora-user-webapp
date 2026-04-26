import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import { ProductHowToUseSection, ProductIdentitySection, ProductAboutSection } from '@/components/shelf/form/product-form-sections';
import { ProductManufacturerSection, ProductUserFieldsSection } from '@/components/shelf/form/product-form-metadata-sections';
import {
  ApplicationMethod,
  PreferredTimeOfDay,
  ProductCategory,
  Quantity,
} from '@/types/shelf';

describe('shelf form sections', () => {
  it('renders identity and about sections with source badges', async () => {
    const onIdentityChange = jest.fn();

    renderWithProviders(
      <>
        <ProductIdentitySection
          identity={{
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
          }}
          onChange={onIdentityChange}
          identityReadOnly
          identitySourceLabel="From barcode"
        />
        <ProductAboutSection
          identity={{
            brand: 'CeraVe',
            name: 'Retinol Serum',
            category: ProductCategory.Serum,
            barcode: null,
            imageUrls: [],
            sizeMl: 30,
            description: 'Night serum',
            benefits: ['calming'],
            suitedFor: ['dry'],
            inciIngredients: ['Aqua'],
            inciLastConfirmedAt: null,
          }}
          onChange={onIdentityChange}
          identityReadOnly
          identitySourceLabel="From barcode"
        />
      </>,
    );

    expect(screen.getAllByText(/from barcode/i).length).toBeGreaterThan(0);
    expect(
      screen.getByRole('heading', { name: /about this product/i }),
    ).toBeInTheDocument();
    expect(onIdentityChange).not.toHaveBeenCalled();
  });

  it('renders user, guidance, and manufacturer sections', async () => {
    const user = userEvent.setup();
    const onUserChange = jest.fn();
    const onGuidanceChange = jest.fn();
    const onManufacturerChange = jest.fn();

    renderWithProviders(
      <>
        <ProductUserFieldsSection
          userFields={{
            openedAt: '2026-04-01T00:00:00.000Z',
            expiresAt: null,
            periodAfterOpeningMonths: 12,
            pricePaid: 24,
            pricePaidCurrency: 'SEK',
            purchasedFrom: 'Kicks',
            personalNotes: 'Feels good',
            preferredTimeOfDay: PreferredTimeOfDay.Evening,
          }}
          onChange={onUserChange}
        />
        <ProductHowToUseSection
          guidance={{
            applicationMethod: ApplicationMethod.Fingertips,
            quantity: Quantity.TwoToThreeDrops,
            steps: ['Pat gently'],
            cautions: ['Avoid eyes'],
            waitMinutes: 5,
          }}
          onChange={onGuidanceChange}
        />
        <ProductManufacturerSection
          manufacturer={{
            brand: 'CeraVe',
            parentCompany: 'L’Oreal',
            countryOfOrigin: null,
            countryOfManufacture: 'US',
            supportEmail: 'support@cerave.com',
            productUrl: 'https://example.com/product',
            websiteUrl: null,
          }}
          onChange={onManufacturerChange}
        />
      </>,
    );

    expect(screen.getByText(/how to use/i)).toBeInTheDocument();
    expect(screen.getByText(/manufacturer/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/product url/i), 'x');
    expect(onManufacturerChange).toHaveBeenCalled();

    await user.type(screen.getByLabelText(/your notes/i), '!');
    expect(onUserChange).toHaveBeenCalled();
  });

  it('supports choosing a product photo before uploading it', async () => {
    const user = userEvent.setup();
    const onSelectFile = jest.fn();

    renderWithProviders(
      <ProductIdentitySection
        identity={{
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
        }}
        onChange={jest.fn()}
        identityReadOnly={false}
        photoUpload={{
          previewUrl: 'blob:preview',
          isPendingSelection: true,
          isUploading: false,
          onSelectFile,
          onUpload: jest.fn(),
          onClearSelection: jest.fn(),
          text: {
            chooseLabel: 'Choose photo',
            replaceLabel: 'Replace photo',
            chooseDifferentLabel: 'Choose different',
            uploadLabel: 'Upload photo',
            uploadingLabel: 'Uploading…',
            clearLabel: 'Clear',
            inputLabel: 'Choose product photo',
            helperText: 'Pick first and upload later.',
            emptyHint: 'Choose a product photo.',
            selectedHint: 'New photo selected.',
            uploadedHint: 'Current product photo shown here.',
          },
        }}
      />,
    );

    await user.upload(
      screen.getByLabelText(/choose product photo/i),
      new File(['photo'], 'product.jpg', { type: 'image/jpeg' }),
    );

    expect(screen.getByRole('button', { name: /upload photo/i })).toBeInTheDocument();
    expect(onSelectFile).toHaveBeenCalled();
  });
});
