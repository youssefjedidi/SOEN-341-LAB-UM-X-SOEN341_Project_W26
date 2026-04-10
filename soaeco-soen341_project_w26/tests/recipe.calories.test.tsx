import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import RecipePage from '../src/app/recipe/page';

const mockGetRecipes = jest.fn();
const mockCreateRecipe = jest.fn();
const mockUpdateRecipe = jest.fn();
const mockDeleteRecipe = jest.fn();

jest.mock('../src/lib/useAuth', () => ({
  useAuth: () => ({ user: { id: 'u1' } }),
}));

jest.mock('../src/app/recipe/actions', () => ({
  getRecipes: (...args: unknown[]) => mockGetRecipes(...args),
  createRecipe: (...args: unknown[]) => mockCreateRecipe(...args),
  updateRecipe: (...args: unknown[]) => mockUpdateRecipe(...args),
  deleteRecipe: (...args: unknown[]) => mockDeleteRecipe(...args),
}));

jest.mock('../src/components/IngredientSelector', () => ({
  IngredientSelector: () => <div>Ingredient Selector</div>,
}));

describe('4.4 recipe calories', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetRecipes.mockResolvedValue({
      success: true,
      recipes: [
        {
          id: 'r1',
          user_id: 'u1',
          title: 'Chicken Rice',
          prep_time: 20,
          cost: 10,
          difficulty: 3,
          restrictions: [],
          ingredients: [
            { name: 'Chicken', calories: 200 },
            { name: 'Rice', calories: 300 },
          ],
        },
      ],
    });

    mockCreateRecipe.mockResolvedValue({ success: true });
    mockUpdateRecipe.mockResolvedValue({ success: true });
    mockDeleteRecipe.mockResolvedValue({ success: true });
  });

  it('shows calorie value next to each ingredient', async () => {
    render(React.createElement(RecipePage));

    await waitFor(() => {
      expect(screen.getByText(/Chicken - 200 cal/i)).toBeInTheDocument();
      expect(screen.getByText(/Rice - 300 cal/i)).toBeInTheDocument();
    });
  });

  it('calculates and shows total calories from ingredients', async () => {
    render(React.createElement(RecipePage));

    await waitFor(() => {
      expect(screen.getByText(/Total Calories: 500/i)).toBeInTheDocument();
    });
  });

  it('uses total_calories if it already exists', async () => {
    mockGetRecipes.mockResolvedValueOnce({
      success: true,
      recipes: [
        {
          id: 'r2',
          user_id: 'u1',
          title: 'Pasta',
          prep_time: 15,
          cost: 8,
          difficulty: 2,
          restrictions: [],
          total_calories: 900,
          ingredients: [
            { name: 'Sauce', calories: 100 },
            { name: 'Noodles', calories: 200 },
          ],
        },
      ],
    });

    render(React.createElement(RecipePage));

    await waitFor(() => {
      expect(screen.getByText(/Total Calories: 900/i)).toBeInTheDocument();
    });
  });

  it('shows 0 total calories when ingredients have no calories', async () => {
    mockGetRecipes.mockResolvedValueOnce({
      success: true,
      recipes: [
        {
          id: 'r3',
          user_id: 'u1',
          title: 'Empty Recipe',
          prep_time: 10,
          cost: 5,
          difficulty: 1,
          restrictions: [],
          ingredients: [
            { name: 'Water' },
            { name: 'Salt', calories: '' },
          ],
        },
      ],
    });

    render(React.createElement(RecipePage));

    await waitFor(() => {
      expect(screen.getByText(/Total Calories: 0/i)).toBeInTheDocument();
    });
  });
});