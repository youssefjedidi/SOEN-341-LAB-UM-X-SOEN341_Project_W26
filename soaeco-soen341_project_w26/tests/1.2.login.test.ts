import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import LoginPage from '../src/app/login/page';

const mockPush = jest.fn();
const mockSignInWithPassword = jest.fn();

jest.mock('../src/lib/supabase', () => ({
	supabase: {
		auth: {
			signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
			resetPasswordForEmail: jest.fn(),
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
		default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) =>
			React.createElement('a', { href, ...rest }, children),
	};
});

describe('1.2 Login user story', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockSignInWithPassword.mockResolvedValue({
			data: {
				user: { id: 'user-123', email: 'user@example.com' },
				session: { access_token: 'session-token' },
			},
			error: null,
		});
	});

	it('renders login fields and navigation actions (email, password, submit, register link)', () => {
		render(React.createElement(LoginPage));

		expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/^password:/i)).toBeInTheDocument();

		expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
		const registerLink = screen.getByRole('link', { name: /register here/i });
		expect(registerLink).toHaveAttribute('href', '/register');
	});

	it('cross-checks credentials with backend and redirects on successful login session', async () => {
		render(React.createElement(LoginPage));

		fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
		fireEvent.change(screen.getByLabelText(/^password:/i), { target: { value: 'Password123!' } });
		fireEvent.click(screen.getByRole('button', { name: /login/i }));

		await waitFor(() => {
			expect(mockSignInWithPassword).toHaveBeenCalledWith({
				email: 'user@example.com',
				password: 'Password123!',
			});
		});

		expect(mockPush).toHaveBeenCalledWith('/search_page');
	});

	it('signals incorrect or mismatched user/password and does not redirect', async () => {
		mockSignInWithPassword.mockResolvedValue({
			data: { user: null, session: null },
			error: { message: 'Invalid login credentials' },
		});

		render(React.createElement(LoginPage));

		fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
		fireEvent.change(screen.getByLabelText(/^password:/i), { target: { value: 'WrongPassword9!' } });
		fireEvent.click(screen.getByRole('button', { name: /login/i }));

		expect(await screen.findByText(/invalid login credentials/i)).toBeInTheDocument();
		expect(mockPush).not.toHaveBeenCalled();
	});
});
