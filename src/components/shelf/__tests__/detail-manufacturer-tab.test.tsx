import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';
import { DetailManufacturerTab } from '@/components/shelf/detail/detail-manufacturer-tab';
import { DataProvenance, type ManufacturerInfo } from '@/types/shelf';

const FULL: ManufacturerInfo = {
  brand: 'CeraVe',
  parentCompany: "L'Oréal",
  countryOfOrigin: 'US',
  countryOfManufacture: 'US',
  supportEmail: 'support@cerave.com',
  productUrl:
    'https://www.cerave.com/skincare/serums/resurfacing-retinol-serum',
  websiteUrl: 'https://www.cerave.com',
};

describe('DetailManufacturerTab', () => {
  it('renders brand, parent, country, and support email', () => {
    renderWithProviders(
      <DetailManufacturerTab
        manufacturer={FULL}
        provenance={DataProvenance.BarcodeLookup}
        confirmedAt="2026-04-14T09:00:00.000Z"
      />,
    );

    expect(screen.getByText('CeraVe')).toBeInTheDocument();
    expect(screen.getByText("L'Oréal")).toBeInTheDocument();
    expect(screen.getByText('support@cerave.com')).toBeInTheDocument();
    expect(screen.getByText(/United States/)).toBeInTheDocument();
  });

  it('renders the product link with correct domain, target, and rel', () => {
    renderWithProviders(
      <DetailManufacturerTab
        manufacturer={FULL}
        provenance={DataProvenance.BarcodeLookup}
        confirmedAt="2026-04-14T09:00:00.000Z"
      />,
    );

    const link = screen.getByRole('link', {
      name: /open product page on cerave.com/i,
    });
    expect(link).toHaveAttribute(
      'href',
      'https://www.cerave.com/skincare/serums/resurfacing-retinol-serum',
    );
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('does not render the product link when productUrl is null', () => {
    renderWithProviders(
      <DetailManufacturerTab
        manufacturer={{ ...FULL, productUrl: null }}
        provenance={DataProvenance.UserEntered}
        confirmedAt={null}
      />,
    );

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders an empty-state hint when no manufacturer data is present', () => {
    renderWithProviders(
      <DetailManufacturerTab
        manufacturer={{
          brand: '',
          parentCompany: null,
          countryOfOrigin: null,
          countryOfManufacture: null,
          supportEmail: null,
          productUrl: null,
          websiteUrl: null,
        }}
        provenance={DataProvenance.UserEntered}
        confirmedAt={null}
      />,
    );

    expect(screen.getByText(/no manufacturer details/i)).toBeInTheDocument();
  });
});
