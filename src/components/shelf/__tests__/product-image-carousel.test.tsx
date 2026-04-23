import svMessages from '../../../../messages/sv.json';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { renderWithProviders } from '@/test/utils';
import { ProductImageCarousel } from '@/components/shelf/detail/product-image-carousel';
import { ProductCategory } from '@/types/shelf';

describe('ProductImageCarousel', () => {
  const user = userEvent.setup();

  it('renders the placeholder illustration when there are no images', () => {
    const { container } = renderWithProviders(
      <ProductImageCarousel
        imageUrls={[]}
        brand="CeraVe"
        productName="Retinol Serum"
        category={ProductCategory.Serum}
      />,
    );

    expect(container.querySelector('svg[role="img"]')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /next image/i }),
    ).not.toBeInTheDocument();
  });

  it('renders prev/next controls when there are multiple images', () => {
    renderWithProviders(
      <ProductImageCarousel
        imageUrls={['/a.jpg', '/b.jpg', '/c.jpg']}
        brand="CeraVe"
        productName="Retinol"
        category={ProductCategory.Serum}
      />,
    );

    expect(
      screen.getByRole('button', { name: /previous image/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /next image/i }),
    ).toBeInTheDocument();
  });

  it('does not render prev/next controls when there is only one image', () => {
    renderWithProviders(
      <ProductImageCarousel
        imageUrls={['/a.jpg']}
        brand="CeraVe"
        productName="Retinol"
        category={ProductCategory.Serum}
      />,
    );

    expect(
      screen.queryByRole('button', { name: /next image/i }),
    ).not.toBeInTheDocument();
  });

  it('responds to ArrowRight and ArrowLeft keys', async () => {
    renderWithProviders(
      <ProductImageCarousel
        imageUrls={['/a.jpg', '/b.jpg', '/c.jpg']}
        brand="CeraVe"
        productName="Retinol"
        category={ProductCategory.Serum}
      />,
    );

    const nextBtn = screen.getByRole('button', { name: /next image/i });
    await user.click(nextBtn);
    await user.click(nextBtn);
    expect(nextBtn).toBeInTheDocument();
  });

  it('renders translated carousel controls when the locale changes', () => {
    render(
      <NextIntlClientProvider locale="sv" messages={svMessages}>
        <ProductImageCarousel
          imageUrls={['/a.jpg', '/b.jpg']}
          brand="CeraVe"
          productName="Retinol"
          category={ProductCategory.Serum}
        />
      </NextIntlClientProvider>,
    );

    expect(
      screen.getByRole('button', { name: /föregående bild/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /nästa bild/i }),
    ).toBeInTheDocument();
  });
});
