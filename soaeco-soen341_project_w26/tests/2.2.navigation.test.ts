import React from 'react';
import { render, screen } from '@testing-library/react';
import { Navigation } from '../src/components/Navigation';

const mockUseAuth = jest.fn();
const mockUsePathname = jest.fn();

jest.mock('../src/lib/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

jest.mock('next/link', () => {
  return {
    __esModule: true,
    default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) =>
      React.createElement('a', { href, ...rest }, children),
  };
});

describe('2.2 Navigation for recipes/profile user story', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue('/search_page');
    mockUseAuth.mockReturnValue({
      user: { id: 'user-123' },
      loading: false,
    });
  });

  it('shows recipe and profile navigation links for authenticated users', () => {
    render(React.createElement(Navigation));

    expect(screen.getByRole('link', { name: /studio/i })).toHaveAttribute('href', '/search_page');
    expect(screen.getByRole('link', { name: /create/i })).toHaveAttribute('href', '/recipe');
    expect(screen.getByRole('link', { name: /profile/i })).toHaveAttribute('href', '/profile_management');
  });

  it('hides navigation when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });

    const { container } = render(React.createElement(Navigation));
    expect(container.firstChild).toBeNull();
  });
});
