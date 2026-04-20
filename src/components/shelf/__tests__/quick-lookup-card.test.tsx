import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import { CatalogueSource, DataProvenance, LookupConfidence } from '@/types/shelf';

jest.mock('@/components/shelf/add-product/photos-tab', () => ({
  PhotosTab: ({ onResolved }: { onResolved: (value: unknown) => void }) => (
    <button
      type="button"
      onClick={() =>
        onResolved({
          identity: { brand: 'La Roche-Posay' },
          guidance: {},
          manufacturer: {},
          provenance: DataProvenance.PhotoLookup,
          source: CatalogueSource.UserPhotos,
          confidence: LookupConfidence.Medium,
          reviewRequired: true,
          warnings: [],
          evidence: [],
        })
      }
    >
      photos resolve
    </button>
  ),
}));

import { QuickLookupCard } from '@/components/shelf/add-product/quick-lookup-card';

describe('QuickLookupCard', () => {
  it('forwards photo lookup results with provenance', async () => {
    const user = userEvent.setup();
    const onResult = jest.fn();

    renderWithProviders(<QuickLookupCard onResult={onResult} />);

    await user.click(screen.getByRole('button', { name: /photos resolve/i }));
    expect(onResult).toHaveBeenCalledWith(
      expect.objectContaining({
        identity: { brand: 'La Roche-Posay' },
        provenance: DataProvenance.PhotoLookup,
      }),
    );
  });
});
