import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';
import { DetailIngredientsTab } from '@/components/shelf/detail/detail-ingredients-tab';

describe('DetailIngredientsTab', () => {
  it('renders an empty state when no ingredients are available', () => {
    renderWithProviders(
      <DetailIngredientsTab ingredients={[]} lastConfirmedAt={null} />,
    );

    expect(
      screen.getByText(/no ingredient list on file/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/ingredient intelligence coming soon/i),
    ).toBeInTheDocument();
  });

  it('renders ingredients and the last confirmed date', () => {
    renderWithProviders(
      <DetailIngredientsTab
        ingredients={['Aqua', 'Glycerin']}
        lastConfirmedAt="2026-04-17T09:00:00.000Z"
      />,
    );

    expect(screen.getByText(/aqua, glycerin/i)).toBeInTheDocument();
    expect(screen.getByText(/last confirmed on/i)).toBeInTheDocument();
  });
});
