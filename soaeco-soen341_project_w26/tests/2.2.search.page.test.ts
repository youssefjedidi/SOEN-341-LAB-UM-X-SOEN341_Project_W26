import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import SearchPage from '../src/app/search_page/page';

const mockPush = jest.fn();
const mockSelect = jest.fn();
const mockFrom = jest.fn((...args: any[]) => ({
  select: mockSelect,
}));
const fetchMock = jest.fn();

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

describe('2.2 Recipe search/listing page user story', () => {
  const allRecipes = [
    {
      id: 'r1',
      title: 'Tomato Pasta',
      prep_time: 15,
      ingredients: ['Tomato', 'Pasta'],
      restrictions: ['Vegetarian'],
      cost: 8,
      difficulty: 2,
      preparation_steps: 'Boil pasta, add tomato sauce.',
    },
    {
      id: 'r2',
      title: 'Slow Stew',
      prep_time: 45,
      ingredients: ['Beef', 'Onion'],
      restrictions: [],
      cost: 14,
      difficulty: 4,
      preparation_steps: 'Simmer for a long time.',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockSelect.mockResolvedValue({ data: allRecipes, error: null });
    (global.fetch as unknown) = fetchMock;
  });

  it('renders listing/search controls and loads recipe list from database', async () => {
    render(React.createElement(SearchPage));

    expect(screen.getByPlaceholderText(/type recipe name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /\+ create recipe/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith('recipes');
      expect(mockSelect).toHaveBeenCalledWith('*');
    });

    expect(await screen.findByText(/tomato pasta/i)).toBeInTheDocument();
    expect(screen.getByText(/slow stew/i)).toBeInTheDocument();
  });

  it('searches by keyword through backend and displays matching recipes', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          id: 'r3',
          title: 'Garlic Bread',
          prep_time: 10,
          ingredients: ['Bread', 'Garlic'],
          restrictions: ['Vegetarian'],
          cost: 4,
          difficulty: 1,
          prep_steps: 'Toast bread with garlic butter.',
        },
      ],
    });

    render(React.createElement(SearchPage));

    await screen.findByText(/tomato pasta/i);

    fireEvent.change(screen.getByPlaceholderText(/type recipe name/i), {
      target: { value: 'garlic' },
    });
    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/search?keyword=garlic');
    });

    expect(await screen.findByText(/garlic bread/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/garlic bread/i));
    expect(await screen.findByText(/preparation steps/i)).toBeInTheDocument();
    expect(screen.getByText(/toast bread with garlic butter/i)).toBeInTheDocument();
  });

  it('supports filter application and shows no-results message when nothing matches', async () => {
    render(React.createElement(SearchPage));

    await screen.findByText(/slow stew/i);

    fireEvent.click(screen.getByRole('button', { name: /filters/i }));

    const anyInputs = screen.getAllByPlaceholderText('Any');
    fireEvent.change(anyInputs[1], { target: { value: '20' } });
    fireEvent.click(screen.getByRole('button', { name: /apply filters/i }));

    expect(await screen.findByText(/tomato pasta/i)).toBeInTheDocument();
    expect(screen.queryByText(/slow stew/i)).not.toBeInTheDocument();

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    fireEvent.change(screen.getByPlaceholderText(/type recipe name/i), {
      target: { value: 'zzzz-nomatch' },
    });
    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    expect(await screen.findByText(/no results found/i)).toBeInTheDocument();
  });
});
