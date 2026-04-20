import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import {
  CatalogueSource,
  DataProvenance,
  LookupConfidence,
} from '@/types/shelf';

jest.mock('@/components/shelf/add-product/scan-tab', () => ({
  ScanTab: ({
    onSwitchToManual,
    onResolved,
  }: {
    onSwitchToManual: () => void;
    onResolved: (value: unknown) => void;
  }) => (
    <>
      <button
        type="button"
        onClick={() =>
          onResolved({
            identity: { brand: 'La Roche-Posay' },
            guidance: {},
            manufacturer: {},
            provenance: DataProvenance.BarcodeLookup,
            source: CatalogueSource.OpenBeautyFacts,
            confidence: LookupConfidence.Low,
            reviewRequired: true,
            warnings: [],
            evidence: [],
          })
        }
      >
        scan resolve
      </button>
      <button type="button" onClick={onSwitchToManual}>
        scan fallback
      </button>
    </>
  ),
}));

jest.mock('@/components/shelf/add-product/search-tab', () => ({
  SearchTab: ({
    onResolved,
  }: {
    onResolved: (value: unknown) => void;
  }) => (
    <button
      type="button"
      onClick={() =>
        onResolved({
          identity: { brand: 'CeraVe' },
          guidance: {},
          manufacturer: {},
          provenance: DataProvenance.Catalogue,
          source: CatalogueSource.RitoraCatalogue,
          confidence: LookupConfidence.High,
          reviewRequired: false,
          warnings: [],
          evidence: [],
        })
      }
    >
      search pick
    </button>
  ),
}));

jest.mock('@/components/shelf/add-product/url-tab', () => ({
  UrlTab: ({ onResolved }: { onResolved: (value: unknown) => void }) => (
    <button
      type="button"
      onClick={() =>
        onResolved({
          identity: { brand: 'Byoma' },
          guidance: {},
          manufacturer: {},
          provenance: DataProvenance.UrlFetch,
          source: CatalogueSource.OfficialPage,
          confidence: LookupConfidence.High,
          reviewRequired: true,
          warnings: [],
          evidence: [],
        })
      }
    >
      url resolve
    </button>
  ),
}));

import { QuickLookupCard } from '@/components/shelf/add-product/quick-lookup-card';

describe('QuickLookupCard', () => {
  it('switches between modes and forwards picked results with provenance', async () => {
    const user = userEvent.setup();
    const onResult = jest.fn();

    renderWithProviders(<QuickLookupCard onResult={onResult} />);

    await user.click(screen.getByRole('button', { name: /search pick/i }));
    expect(onResult).toHaveBeenCalledWith(
      expect.objectContaining({
        identity: { brand: 'CeraVe' },
        provenance: DataProvenance.Catalogue,
      }),
    );

    await user.click(screen.getByRole('tab', { name: /^url$/i }));
    await user.click(screen.getByRole('button', { name: /url resolve/i }));
    expect(onResult).toHaveBeenCalledWith(
      expect.objectContaining({
        identity: { brand: 'Byoma' },
        provenance: DataProvenance.UrlFetch,
      }),
    );

    await user.click(screen.getByRole('tab', { name: /scan/i }));
    await user.click(screen.getByRole('button', { name: /scan resolve/i }));
    expect(onResult).toHaveBeenCalledWith(
      expect.objectContaining({
        identity: { brand: 'La Roche-Posay' },
        provenance: DataProvenance.BarcodeLookup,
      }),
    );

    await user.click(screen.getByRole('button', { name: /scan fallback/i }));
    expect(screen.getByRole('button', { name: /search pick/i })).toBeInTheDocument();
  });
});
