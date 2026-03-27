import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import RegisterPage from '../app/register/page';
import { supabase } from '../lib/supabase';

// Mock navigation + backend calls
const mockPush = jest.fn();
const mockSignUp = jest.fn();

// Mock Supabase auth, mock sign up
jest.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: (...args: unknown[]) => mockSignUp(...args),
    },
  },
}));

// Mock router (redirects)
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock Next.js Link, avoid rendering issues
jest.mock('next/link', () => {
  return {
    __esModule: true,
    default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
      React.createElement('a', { href, ...rest }, children)
    ),
  };
});

describe('Register user story', () => {
  beforeEach(() => {
    // Reset mocks between tests
    jest.clearAllMocks();

    // Default: successful signup
    mockSignUp.mockResolvedValue({
      data: { user: { id: 'default-user' }, session: { access_token: 'default-token' } },
      error: null,
    });
  });

  it('renders registration inputs and actions', () => {
    // Test: UI elements exist
    render(React.createElement(RegisterPage));

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();

    const loginLink = screen.getByRole('link', { name: /login here/i });
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('rejects invalid email and does not call backend signup', async () => {
    // Test: frontend validation blocks bad email
    render(React.createElement(RegisterPage));

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'invalid-email' } });
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByLabelText(/^password:/i), { target: { value: 'Validpass1!' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'Validpass1!' } });

    const form = screen.getByRole('button', { name: /register/i }).closest('form');
    fireEvent.submit(form as HTMLFormElement);

    expect(await screen.findByText(/please enter a valid email address/i)).toBeInTheDocument();
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('shows backend error when signup fails and does not redirect', async () => {
    // Test: backend error is shown to user
    mockSignUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Email already registered' },
    });

    render(React.createElement(RegisterPage));

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'abc.def@example.com' } });
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByLabelText(/^password:/i), { target: { value: 'Validpass1!' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'Validpass1!' } });

    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    expect(await screen.findByText(/email already registered/i)).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('submits valid registration data and redirects to profile management', async () => {
    render(React.createElement(RegisterPage));

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'valid.user@example.com' } });
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'validuser' } });
    fireEvent.change(screen.getByLabelText(/^password:/i), { target: { value: 'Validpass1!' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'Validpass1!' } });

    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'valid.user@example.com',
        password: 'Validpass1!',
        options: {
          data: {
            username: 'validuser',
          },
        },
      });
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/profile_management');
    });
  });

  it('does not submit when confirmation password does not match', async () => {
    // Test: password mismatch blocks submission
    render(React.createElement(RegisterPage));

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'abc.def@example.com' } });
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByLabelText(/^password:/i), { target: { value: 'Validpass1!' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'Validpass1?' } });

    const form = screen.getByRole('button', { name: /register/i }).closest('form');
    fireEvent.submit(form as HTMLFormElement);

    expect(await screen.findAllByText(/passwords do not match/i)).toBeTruthy();
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('uses the Supabase auth signup path to create user records', () => {
    // Test: correct backend method is used
    expect((supabase as { auth?: unknown }).auth).toBeDefined();
    expect(typeof (supabase as { auth: { signUp: unknown } }).auth.signUp).toBe('function');
  });
});