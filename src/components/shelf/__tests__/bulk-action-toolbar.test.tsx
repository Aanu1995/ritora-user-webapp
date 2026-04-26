import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import { BulkActionToolbar } from '@/components/shelf/bulk-action-toolbar';

describe('BulkActionToolbar', () => {
  const user = userEvent.setup();

  it('renders nothing when there is no selection', () => {
    const { container } = renderWithProviders(
      <BulkActionToolbar
        selectedCount={0}
        onArchive={jest.fn()}
        onMarkFinished={jest.fn()}
        onDelete={jest.fn()}
        onClear={jest.fn()}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders Archive, Mark finished, Delete, and Clear when selection is non-empty', () => {
    renderWithProviders(
      <BulkActionToolbar
        selectedCount={2}
        onArchive={jest.fn()}
        onMarkFinished={jest.fn()}
        onDelete={jest.fn()}
        onClear={jest.fn()}
      />,
    );

    expect(screen.getByText(/2 selected/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /archive/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /mark finished/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /clear selection/i })).toBeInTheDocument();
  });

  it('does not render any "Move to routine" action', () => {
    renderWithProviders(
      <BulkActionToolbar
        selectedCount={2}
        onArchive={jest.fn()}
        onMarkFinished={jest.fn()}
        onDelete={jest.fn()}
        onClear={jest.fn()}
      />,
    );

    expect(screen.queryByText(/move to routine/i)).not.toBeInTheDocument();
  });

  it('fires the correct callback for each action', async () => {
    const onArchive = jest.fn();
    const onMarkFinished = jest.fn();
    const onDelete = jest.fn();
    const onClear = jest.fn();

    renderWithProviders(
      <BulkActionToolbar
        selectedCount={3}
        onArchive={onArchive}
        onMarkFinished={onMarkFinished}
        onDelete={onDelete}
        onClear={onClear}
      />,
    );

    await user.click(screen.getByRole('button', { name: /archive/i }));
    expect(onArchive).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: /mark finished/i }));
    expect(onMarkFinished).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: /clear selection/i }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
