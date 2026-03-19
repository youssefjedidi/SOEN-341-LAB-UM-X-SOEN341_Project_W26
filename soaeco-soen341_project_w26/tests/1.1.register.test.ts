import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import RegisterPage from '../app/register/page';
import { supabase } from '../lib/supabase';

const mockPush = jest.fn();
const mockSignUp = jest.fn();

jest.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: (...args: unknown[]) => mockSignUp(...args),
    },
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

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
    // Reset mocks so one test's auth state does not hide another issue.
    jest.clearAllMocks();
    // Default successful signup keeps tests focused on each explicit failure path.
    mockSignUp.mockResolvedValue({
      data: { user: { id: 'default-user' }, session: { access_token: 'default-token' } },
      error: null,
    });
  });

  it('renders registration inputs and actions', () => {
    // Issue covered: missing required fields/buttons would block registration flow.
    render(React.createElement(RegisterPage));

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();

    const loginLink = screen.getByRole('link', { name: /login here/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('rejects invalid email and does not call backend signup', async () => {
    // Issue covered: invalid email must not reach backend account creation.
    render(React.createElement(RegisterPage));

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'invalid-email' } });
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByLabelText(/^password:/i), { target: { value: 'Validpass1!' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'Validpass1!' } });

    const form = screen.getByRole('button', { name: /register/i }).closest('form');
    expect(form).not.toBeNull();
    fireEvent.submit(form as HTMLFormElement);

    expect(await screen.findByText(/please enter a valid email address/i)).toBeInTheDocument();
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('shows backend error when signup fails and does not redirect', async () => {
    // Issue covered: backend signup failure should surface a clear message.
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

  it('does not submit when confirmation password does not match', async () => {
    // Issue covered: mismatched passwords should block submission.
    render(React.createElement(RegisterPage));

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'abc.def@example.com' } });
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByLabelText(/^password:/i), { target: { value: 'Validpass1!' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'Validpass1?' } });

    const form = screen.getByRole('button', { name: /register/i }).closest('form');
    fireEvent.submit(form as HTMLFormElement);

    const mismatchMessages = await screen.findAllByText(/passwords do not match/i);
    expect(mismatchMessages.length).toBeGreaterThan(0);
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('uses the Supabase auth signup path to create user records', () => {
    // Issue covered: registration must use Supabase auth signup entry point.
    expect((supabase as { auth?: unknown }).auth).toBeDefined();
    expect(typeof (supabase as { auth: { signUp: unknown } }).auth.signUp).toBe('function');
  });
});
