import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppleSignInButton } from '@/components/auth/apple-sign-in-button';

describe('AppleSignInButton', () => {
  it('renders the localized label and uses type="button" so it never submits a parent form', () => {
    render(<AppleSignInButton />);

    const button = screen.getByRole('button', { name: /continue with apple/i });

    expect(button).toHaveAttribute('type', 'button');
    expect(button).not.toHaveAttribute('aria-busy', 'true');
    expect(button).not.toBeDisabled();
  });

  it('fires onClick when activated', async () => {
    const handleClick = jest.fn();
    render(<AppleSignInButton onClick={handleClick} />);

    await userEvent.click(
      screen.getByRole('button', { name: /continue with apple/i }),
    );

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows the loading label and marks itself busy + disabled while loading', () => {
    render(<AppleSignInButton isLoading />);

    const button = screen.getByRole('button', { name: /opening apple/i });

    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toBeDisabled();
  });

  it('disables itself when isDisabled is true', async () => {
    const handleClick = jest.fn();
    render(<AppleSignInButton isDisabled onClick={handleClick} />);

    const button = screen.getByRole('button', { name: /continue with apple/i });

    expect(button).toBeDisabled();

    await userEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });
});
