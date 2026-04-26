import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  mockPush,
  renderAddProductPage,
  resetAddProductPageMocks,
} from './add-product-page.test-harness';

beforeEach(() => {
  resetAddProductPageMocks();
});

describe('AddProductPage unsaved changes guard', () => {
  it('opens the discard dialog when the back arrow is clicked with dirty state', async () => {
    const user = userEvent.setup();
    renderAddProductPage({ withUnsavedDialog: true });

    await user.type(screen.getByLabelText(/^brand$/i), 'CeraVe');

    const backLink = screen.getByLabelText(/back to shelf/i);
    await user.click(backLink);

    expect(screen.getByText(/unsaved changes/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /keep editing/i }),
    ).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('keeps the user on the form when "Keep editing" is clicked', async () => {
    const user = userEvent.setup();
    renderAddProductPage({ withUnsavedDialog: true });

    await user.type(screen.getByLabelText(/^brand$/i), 'CeraVe');
    await user.click(screen.getByLabelText(/back to shelf/i));
    await user.click(screen.getByRole('button', { name: /keep editing/i }));

    await waitFor(() => {
      expect(screen.queryByText(/unsaved changes/i)).not.toBeInTheDocument();
    });
    expect(mockPush).not.toHaveBeenCalled();
    expect((screen.getByLabelText(/^brand$/i) as HTMLInputElement).value).toBe(
      'CeraVe',
    );
  });

  it('navigates to the shelf when "Discard changes" is clicked', async () => {
    const user = userEvent.setup();
    renderAddProductPage({ withUnsavedDialog: true });

    await user.type(screen.getByLabelText(/^brand$/i), 'CeraVe');
    await user.click(screen.getByLabelText(/back to shelf/i));
    await user.click(screen.getByRole('button', { name: /discard changes/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/shelf');
    });
  });

  it('does not open the dialog when the back arrow is clicked with a clean form', async () => {
    const user = userEvent.setup();
    renderAddProductPage({ withUnsavedDialog: true });

    await user.click(screen.getByLabelText(/back to shelf/i));

    expect(screen.queryByText(/unsaved changes/i)).not.toBeInTheDocument();
  });
});
