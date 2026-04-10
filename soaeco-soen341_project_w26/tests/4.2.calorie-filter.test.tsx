import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import SearchPage from '../src/app/search_page/page';

const mockPush = jest.fn();
const mockSelect = jest.fn();
const mockFrom = jest.fn((..._args: unknown[]) => ({
  select: mockSelect,
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('../src/lib/supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

describe('4.2 calorie filter', () => {
  const recipes = [
    {
      id: 'r1',
      title: 'Low Cal',
      prep_time: 10,
      ingredients: [{ name: 'A', calories: 50 }],
      restrictions: [],
      cost: 5,
      difficulty: 1,
      preparation_steps: '',
    },
    {
      id: 'r2',
      title: 'High Cal',
      prep_time: 10,
      ingredients: [{ name: 'B', calories: 300 }],
      restrictions: [],
      cost: 5,
      difficulty: 1,
      preparation_steps: '',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockSelect.mockResolvedValue({ data: recipes, error: null });
  });

  it('filters by max calories', async () => {
    render(React.createElement(SearchPage));

    await screen.findByText('Low Cal');

    fireEvent.click(screen.getByRole('button', { name: /filters/i }));
    fireEvent.change(screen.getByLabelText(/max calories/i), {
      target: { value: '100' },
    });
    fireEvent.click(screen.getByRole('button', { name: /apply filters/i }));

    expect(screen.getByText('Low Cal')).toBeInTheDocument();
    expect(screen.queryByText('High Cal')).not.toBeInTheDocument();
  });

  it('clear all resets filter', async () => {
    render(React.createElement(SearchPage));

    await screen.findByText('Low Cal');

    fireEvent.click(screen.getByRole('button', { name: /filters/i }));
    fireEvent.change(screen.getByLabelText(/max calories/i), {
      target: { value: '100' },
    });
    fireEvent.click(screen.getByRole('button', { name: /apply filters/i }));

    fireEvent.click(screen.getByRole('button', { name: /filters/i }));
    fireEvent.click(screen.getByRole('button', { name: /clear all/i }));
    fireEvent.click(screen.getByRole('button', { name: /apply filters/i }));

    expect(screen.getByText('High Cal')).toBeInTheDocument();
  });
});