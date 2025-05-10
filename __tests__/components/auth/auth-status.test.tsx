import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithAuth } from '../../utils/auth-test-utils';
import { checkA11y } from '../../utils/a11y-utils';
import { AuthStatus } from '@/components/auth/auth-status';

describe('AuthStatus Component', () => {
  it('displays authenticated user info when signed in', () => {
    renderWithAuth(<AuthStatus />, { userType: 'client' });
    
    expect(screen.getByText(/Client User/i)).toBeInTheDocument();
    expect(screen.getByText(/client@example.com/i)).toBeInTheDocument();
  });

  it('displays sign-in button when not authenticated', () => {
    renderWithAuth(<AuthStatus />, { userType: 'unauthenticated' });
    
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.queryByText(/Client User/i)).not.toBeInTheDocument();
  });

  it('shows different UI for builder accounts', () => {
    renderWithAuth(<AuthStatus />, { userType: 'builder' });
    
    expect(screen.getByText(/Builder User/i)).toBeInTheDocument();
    expect(screen.getByText(/builder@example.com/i)).toBeInTheDocument();
  });

  it('meets accessibility standards', async () => {
    const { container } = renderWithAuth(<AuthStatus />, { userType: 'client' });
    await checkA11y(container);
  });
});