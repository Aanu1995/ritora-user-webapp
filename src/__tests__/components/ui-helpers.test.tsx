import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton';
import { SkinProfileSkeleton } from '@/components/skin-profile/skin-profile-skeleton';
import { RetryPanel } from '@/components/ui/retry-panel';
import { Skeleton } from '@/components/ui/skeleton';

describe('UI helper components', () => {
  it('renders the dashboard skeleton placeholders', () => {
    const { container } = render(<DashboardSkeleton />);

    expect(container.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThan(0);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(5);
  });

  it('renders the skin profile skeleton placeholders', () => {
    const { container } = render(<SkinProfileSkeleton />);

    expect(container.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThan(0);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(5);
  });

  it('renders the base skeleton primitive with the provided class name', () => {
    const { container } = render(<Skeleton className="h-4 w-10" />);
    const element = container.firstChild as HTMLElement;

    expect(element).toHaveAttribute('aria-hidden', 'true');
    expect(element).toHaveClass('animate-pulse');
    expect(element).toHaveClass('h-4');
    expect(element).toHaveClass('w-10');
  });

  it('renders the retry panel and invokes the retry action', async () => {
    const user = userEvent.setup();
    const onAction = jest.fn();

    render(
      <RetryPanel
        title="Something went wrong"
        description="Please retry the request."
        actionLabel="Try again"
        onAction={onAction}
      />,
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /try again/i }));

    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
