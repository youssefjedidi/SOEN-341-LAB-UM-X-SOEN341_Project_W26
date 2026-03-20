import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import SearchPage from '../app/search_page/page';

const mockPush = jest.fn();
const mockSelect = jest.fn();
const mockFrom = jest.fn(() => ({
  select: mockSelect,
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('../lib/supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

describe('2.3 Recipe filtering user story', () => {
  const recipes = [
    {
      id: 'r1',
      title: 'Quick Vegan Salad',
      prep_time: 10,
      ingredients: ['Lettuce', 'Tomato'],
      restrictions: ['Vegan'],
      cost: 5,
      difficulty: 1,
      preparation_steps: 'Chop and mix.',
    },
    {
      id: 'r2',
      title: 'Budget Halal Pasta',
      prep_time: 20,
      ingredients: ['Pasta', 'Tomato Sauce'],
      restrictions: ['Halal'],
      cost: 8,
      difficulty: 2,
      preparation_steps: 'Boil and combine.',
    },
    {
      id: 'r3',
      title: 'Premium Vegan Curry',
      prep_time: 35,
      ingredients: ['Tofu', 'Coconut Milk'],
      restrictions: ['Vegan'],
      cost: 15,
      difficulty: 4,
      preparation_steps: 'Cook in stages.',
    },
  ];

  function openFilters() {
    fireEvent.click(screen.getByRole('button', { name: /filters/i }));
  }

  function getFilterAnyInputs() {
    // Two numeric fields in filter panel: Max Cost and Max Time.
    return screen.getAllByPlaceholderText('Any');
  }

  function openDietaryTagDropdown() {
    const label = screen.getByText('Dietary tag');
    const wrapper = label.closest('div');
    expect(wrapper).not.toBeNull();

    const trigger = within(wrapper as HTMLElement).getByRole('button');
    fireEvent.click(trigger);
  }

  function openIngredientsDropdown() {
    const labels = screen.getAllByText('Ingredients');
    const filterLabel = labels.find((element) => element.tagName.toLowerCase() === 'label');
    expect(filterLabel).toBeDefined();

    const wrapper = filterLabel?.closest('div');
    expect(wrapper).not.toBeNull();

    const trigger = within(wrapper as HTMLElement).getByRole('button');
    fireEvent.click(trigger);
  }

  beforeEach(() => {
    jest.clearAllMocks();
    mockSelect.mockResolvedValue({ data: recipes, error: null });
  });

  it('renders filter controls for time, price, dietary tag, ingredients, and difficulty scale', async () => {
    render(React.createElement(SearchPage));

    await screen.findByText(/quick vegan salad/i);

    openFilters();

    expect(screen.getByText('Difficulty')).toBeInTheDocument();
    expect(screen.getByText('Max Cost')).toBeInTheDocument();
    expect(screen.getByText('Max Time')).toBeInTheDocument();
    expect(screen.getByText('Dietary tag')).toBeInTheDocument();

    const ingredientLabels = screen.getAllByText('Ingredients');
    expect(ingredientLabels.length).toBeGreaterThan(0);

    expect(screen.getAllByText('★').length).toBe(5);
  });

  it('filters by maximum time, maximum price, and difficulty level', async () => {
    render(React.createElement(SearchPage));

    await screen.findByText(/premium vegan curry/i);

    openFilters();

    const [maxCostInput, maxTimeInput] = getFilterAnyInputs();
    fireEvent.change(maxCostInput, { target: { value: '8' } });
    fireEvent.change(maxTimeInput, { target: { value: '20' } });

    const stars = screen.getAllByText('★');
    fireEvent.click(stars[1]); // difficulty <= 2

    fireEvent.click(screen.getByRole('button', { name: /apply filters/i }));

    expect(await screen.findByText(/quick vegan salad/i)).toBeInTheDocument();
    expect(screen.getByText(/budget halal pasta/i)).toBeInTheDocument();
    expect(screen.queryByText(/premium vegan curry/i)).not.toBeInTheDocument();
  });

  it('filters by dietary restriction and ingredient list, then supports clear all', async () => {
    render(React.createElement(SearchPage));

    await screen.findByText(/budget halal pasta/i);

    openFilters();

    openDietaryTagDropdown();
    fireEvent.click(screen.getByLabelText('Vegan'));

    openIngredientsDropdown();
    fireEvent.click(screen.getByLabelText('Lettuce'));

    fireEvent.click(screen.getByRole('button', { name: /apply filters/i }));

    expect(await screen.findByText(/quick vegan salad/i)).toBeInTheDocument();
    expect(screen.queryByText(/budget halal pasta/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/premium vegan curry/i)).not.toBeInTheDocument();

    openFilters();
    fireEvent.click(screen.getByRole('button', { name: /clear all/i }));
    fireEvent.click(screen.getByRole('button', { name: /apply filters/i }));

    expect(await screen.findByText(/quick vegan salad/i)).toBeInTheDocument();
    expect(screen.getByText(/budget halal pasta/i)).toBeInTheDocument();
    expect(screen.getByText(/premium vegan curry/i)).toBeInTheDocument();
  });

  it('supports combining multiple filters simultaneously and handles no matches', async () => {
    render(React.createElement(SearchPage));

    await screen.findByText(/quick vegan salad/i);

    openFilters();

    const [maxCostInput, maxTimeInput] = getFilterAnyInputs();
    fireEvent.change(maxCostInput, { target: { value: '5' } });
    fireEvent.change(maxTimeInput, { target: { value: '10' } });

    const stars = screen.getAllByText('★');
    fireEvent.click(stars[0]); // difficulty <= 1

    openDietaryTagDropdown();
    fireEvent.click(screen.getByLabelText('Vegan'));

    openIngredientsDropdown();
    fireEvent.click(screen.getByLabelText('Lettuce'));

    fireEvent.click(screen.getByRole('button', { name: /apply filters/i }));

    expect(await screen.findByText(/quick vegan salad/i)).toBeInTheDocument();

    openFilters();
    const [reopenedMaxCostInput] = getFilterAnyInputs();
    fireEvent.change(reopenedMaxCostInput, { target: { value: '4' } });
    fireEvent.click(screen.getByRole('button', { name: /apply filters/i }));

    await waitFor(() => {
      expect(screen.getByText(/no results found/i)).toBeInTheDocument();
    });
  });
});
