import { render, screen } from '@testing-library/react';
import { AuthDivider } from '@/components/auth/auth-divider';

describe('AuthDivider', () => {
  it('renders the visible label inside a separator role', () => {
    render(<AuthDivider label="or continue with email" />);

    expect(screen.getByRole('separator')).toBeInTheDocument();
    expect(screen.getByText('or continue with email')).toBeInTheDocument();
  });
});
