import { render, screen } from '@testing-library/react';
import { AuthLegalDisclosure } from '@/components/auth/auth-legal-disclosure';

describe('AuthLegalDisclosure', () => {
  it('renders both legal links opening in a new tab with noopener and noreferrer', () => {
    render(<AuthLegalDisclosure />);

    const termsLink = screen.getByRole('link', { name: /terms of service/i });
    const privacyLink = screen.getByRole('link', { name: /privacy policy/i });

    expect(termsLink).toHaveAttribute('target', '_blank');
    expect(termsLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(privacyLink).toHaveAttribute('target', '_blank');
    expect(privacyLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('includes the disclosure copy so the user understands what they are agreeing to', () => {
    render(<AuthLegalDisclosure />);

    expect(screen.getByText(/by continuing, you agree to our/i)).toBeInTheDocument();
    expect(screen.getByText(/and/i)).toBeInTheDocument();
  });
});
