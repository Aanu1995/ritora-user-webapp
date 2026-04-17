import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import { ScanTab } from '@/components/shelf/add-product/scan-tab';

describe('ScanTab', () => {
  it('renders the placeholder scanner and fallback action', async () => {
    const user = userEvent.setup();
    const onSwitchToManual = jest.fn();

    renderWithProviders(<ScanTab onSwitchToManual={onSwitchToManual} />);

    expect(screen.getByText(/camera scanning arrives/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /enter manually instead/i }));
    expect(onSwitchToManual).toHaveBeenCalled();
  });
});
