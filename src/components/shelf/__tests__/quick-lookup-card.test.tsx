import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';

jest.mock('@/components/shelf/add-product/scan-tab', () => ({
  ScanTab: ({ onSwitchToManual }: { onSwitchToManual: () => void }) => (
    <button type="button" onClick={onSwitchToManual}>
      scan fallback
    </button>
  ),
}));

jest.mock('@/components/shelf/add-product/search-tab', () => ({
  SearchTab: ({ onPick }: { onPick: (value: { identity: { brand: string } }) => void }) => (
    <button
      type="button"
      onClick={() => onPick({ identity: { brand: 'CeraVe' } })}
    >
      search pick
    </button>
  ),
}));

jest.mock('@/components/shelf/add-product/url-tab', () => ({
  UrlTab: ({ onResolved }: { onResolved: (value: { identity: { brand: string } }) => void }) => (
    <button
      type="button"
      onClick={() => onResolved({ identity: { brand: 'Byoma' } })}
    >
      url resolve
    </button>
  ),
}));

import { QuickLookupCard } from '@/components/shelf/add-product/quick-lookup-card';
import { DataProvenance } from '@/types/shelf';

describe('QuickLookupCard', () => {
  it('switches between modes and forwards picked results with provenance', async () => {
    const user = userEvent.setup();
    const onResult = jest.fn();

    renderWithProviders(<QuickLookupCard onResult={onResult} />);

    await user.click(screen.getByRole('button', { name: /search pick/i }));
    expect(onResult).toHaveBeenCalledWith(
      { identity: { brand: 'CeraVe' } },
      DataProvenance.Catalogue,
    );

    await user.click(screen.getByRole('tab', { name: /^url$/i }));
    await user.click(screen.getByRole('button', { name: /url resolve/i }));
    expect(onResult).toHaveBeenCalledWith(
      { identity: { brand: 'Byoma' } },
      DataProvenance.UrlFetch,
    );

    await user.click(screen.getByRole('tab', { name: /scan/i }));
    await user.click(screen.getByRole('button', { name: /scan fallback/i }));
    expect(screen.getByRole('button', { name: /search pick/i })).toBeInTheDocument();
  });
});
