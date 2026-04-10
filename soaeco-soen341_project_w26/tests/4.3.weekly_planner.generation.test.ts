import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import WeeklyPlanner from '../src/app/weekly_planner/page';
import { PlannerDayType, PlannerMealType, Recipe, WeeklyPlannerGrid } from '../src/lib/types';

const mockGetWeeklyPlanner = jest.fn();
const mockUpdateWeeklyPlannerMeal = jest.fn();
const mockResetWeeklyPlanner = jest.fn();
const mockGetRecipes = jest.fn();
const mockUseAuth = jest.fn();
const mockGetSession = jest.fn();
const mockSingle = jest.fn();

jest.mock('../src/app/weekly_planner/actions', () => ({
  getWeeklyPlanner: (...args: unknown[]) => mockGetWeeklyPlanner(...args),
  updateWeeklyPlannerMeal: (...args: unknown[]) => mockUpdateWeeklyPlannerMeal(...args),
  resetWeeklyPlanner: (...args: unknown[]) => mockResetWeeklyPlanner(...args),
}));

jest.mock('../src/app/recipe/actions', () => ({
  getRecipes: (...args: unknown[]) => mockGetRecipes(...args),
}));

jest.mock('../src/lib/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('../src/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: (...args: unknown[]) => mockSingle(...args),
        })),
      })),
    })),
  },
}));

const days: PlannerDayType[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const meals: PlannerMealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

function createEmptyGrid(): WeeklyPlannerGrid {
  return {
    Monday: {
      Breakfast: { recipeId: null, recipeTitle: null },
      Lunch: { recipeId: null, recipeTitle: null },
      Dinner: { recipeId: null, recipeTitle: null },
      Snack: { recipeId: null, recipeTitle: null },
    },
    Tuesday: {
      Breakfast: { recipeId: null, recipeTitle: null },
      Lunch: { recipeId: null, recipeTitle: null },
      Dinner: { recipeId: null, recipeTitle: null },
      Snack: { recipeId: null, recipeTitle: null },
    },
    Wednesday: {
      Breakfast: { recipeId: null, recipeTitle: null },
      Lunch: { recipeId: null, recipeTitle: null },
      Dinner: { recipeId: null, recipeTitle: null },
      Snack: { recipeId: null, recipeTitle: null },
    },
    Thursday: {
      Breakfast: { recipeId: null, recipeTitle: null },
      Lunch: { recipeId: null, recipeTitle: null },
      Dinner: { recipeId: null, recipeTitle: null },
      Snack: { recipeId: null, recipeTitle: null },
    },
    Friday: {
      Breakfast: { recipeId: null, recipeTitle: null },
      Lunch: { recipeId: null, recipeTitle: null },
      Dinner: { recipeId: null, recipeTitle: null },
      Snack: { recipeId: null, recipeTitle: null },
    },
    Saturday: {
      Breakfast: { recipeId: null, recipeTitle: null },
      Lunch: { recipeId: null, recipeTitle: null },
      Dinner: { recipeId: null, recipeTitle: null },
      Snack: { recipeId: null, recipeTitle: null },
    },
    Sunday: {
      Breakfast: { recipeId: null, recipeTitle: null },
      Lunch: { recipeId: null, recipeTitle: null },
      Dinner: { recipeId: null, recipeTitle: null },
      Snack: { recipeId: null, recipeTitle: null },
    },
  };
}

function createRecipes(count: number, restriction: string | null): Recipe[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `550e8400-e29b-41d4-a716-${String(100000000000 + index).slice(-12)}`,
    title: `Recipe ${index + 1}`,
    prep_time: 10,
    tags: [],
    ingredients: [{ name: 'Ingredient', calories: 200 + index }],
    restrictions: restriction ? [restriction] : [],
    cost: 10,
    preparation_steps: 'Cook and serve.',
    difficulty: 2,
    user_id: 'user-1',
  }));
}

function createFilledGrid(recipes: Recipe[]): WeeklyPlannerGrid {
  const grid = createEmptyGrid();
  let index = 0;

  for (const day of days) {
    for (const meal of meals) {
      const recipe = recipes[index];
      grid[day][meal] = {
        recipeId: recipe.id,
        recipeTitle: recipe.title,
      };
      index += 1;
    }
  }

  return grid;
}

describe('4.3 weekly meal generation', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAuth.mockReturnValue({
      user: { id: 'user-1' },
      loading: false,
    });

    mockGetSession.mockResolvedValue({
      data: { session: { access_token: 'token' } },
      error: null,
    });

    mockGetWeeklyPlanner.mockResolvedValue({
      success: true,
      status: 'success',
      message: 'Loaded',
      grid: createEmptyGrid(),
    });

    mockResetWeeklyPlanner.mockResolvedValue({
      success: true,
      status: 'success',
      message: 'Reset',
      grid: createEmptyGrid(),
    });
  });

  it('disables generation when not enough eligible recipes exist under calorie+restriction constraints', async () => {
    const veganRecipes = createRecipes(27, 'Vegan');
    const nonVeganRecipe = createRecipes(1, null);

    mockGetRecipes.mockResolvedValue({
      success: true,
      recipes: [...veganRecipes, ...nonVeganRecipe],
    });

    mockSingle.mockResolvedValue({
      data: {
        daily_calorie_goal: 2000,
        dietary_restrictions: ['Vegan'],
      },
      error: null,
    });

    render(React.createElement(WeeklyPlanner));

    const button = await screen.findByRole('button', { name: /generate weekly plan/i });
    await waitFor(() => {
      expect(button).toBeDisabled();
    });
  });

  it('generates and populates planner when clicked, and ignores restriction filtering if no calorie limit is set', async () => {
    const recipes = createRecipes(28, null);
    const generatedGrid = createFilledGrid(recipes);

    mockGetRecipes.mockResolvedValue({
      success: true,
      recipes,
    });

    mockSingle.mockResolvedValue({
      data: {
        daily_calorie_goal: null,
        dietary_restrictions: ['Vegan'],
      },
      error: null,
    });

    mockUpdateWeeklyPlannerMeal.mockResolvedValue({
      success: true,
      status: 'success',
      message: 'Updated',
      grid: generatedGrid,
    });

    render(React.createElement(WeeklyPlanner));

    const button = await screen.findByRole('button', { name: /generate weekly plan/i });
    await waitFor(() => {
      expect(button).toBeEnabled();
    });

    fireEvent.click(button);

    await waitFor(() => {
      expect(mockResetWeeklyPlanner).toHaveBeenCalledTimes(1);
      expect(mockUpdateWeeklyPlannerMeal).toHaveBeenCalledTimes(28);
    });

    expect(await screen.findByText('Recipe 1')).toBeInTheDocument();
  });
});
