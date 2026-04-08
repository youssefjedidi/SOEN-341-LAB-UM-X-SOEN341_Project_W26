import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import WeeklyPlanner from '../app/weekly_planner/page';

const mockGetWeeklyPlanner = jest.fn();
const mockGetRecipes = jest.fn();
const mockGetSession = jest.fn();
const mockSingle = jest.fn();

jest.mock('../lib/useAuth', () => ({
  useAuth: () => ({ user: { id: 'u1' } }),
}));

jest.mock('../app/weekly_planner/actions', () => ({
  getWeeklyPlanner: (...args: unknown[]) => mockGetWeeklyPlanner(...args),
  updateWeeklyPlannerMeal: jest.fn(),
  resetWeeklyPlanner: jest.fn(),
}));

jest.mock('../app/recipe/actions', () => ({
  getRecipes: () => mockGetRecipes(),
}));

jest.mock('../lib/supabase', () => ({
  supabase: {
    auth: { getSession: () => mockGetSession() },
    from: () => ({
      select: () => ({
        eq: () => ({ single: mockSingle }),
      }),
    }),
  },
}));

jest.mock('../lib/weeklyPlanner', () => ({
  createEmptyPlannerGrid: () => ({
    Monday: { Breakfast: { recipeId: null }, Lunch: { recipeId: null }, Dinner: { recipeId: null }, Snack: { recipeId: null } },
    Tuesday: { Breakfast: { recipeId: null }, Lunch: { recipeId: null }, Dinner: { recipeId: null }, Snack: { recipeId: null } },
    Wednesday: { Breakfast: { recipeId: null }, Lunch: { recipeId: null }, Dinner: { recipeId: null }, Snack: { recipeId: null } },
    Thursday: { Breakfast: { recipeId: null }, Lunch: { recipeId: null }, Dinner: { recipeId: null }, Snack: { recipeId: null } },
    Friday: { Breakfast: { recipeId: null }, Lunch: { recipeId: null }, Dinner: { recipeId: null }, Snack: { recipeId: null } },
    Saturday: { Breakfast: { recipeId: null }, Lunch: { recipeId: null }, Dinner: { recipeId: null }, Snack: { recipeId: null } },
    Sunday: { Breakfast: { recipeId: null }, Lunch: { recipeId: null }, Dinner: { recipeId: null }, Snack: { recipeId: null } },
  }),
}));

describe('4.1 weekly calories', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetSession.mockResolvedValue({
      data: { session: { access_token: 't' } },
      error: null,
    });

    mockGetWeeklyPlanner.mockResolvedValue({
      success: true,
      grid: {
        Monday: { Breakfast: { recipeId: 'r1' }, Lunch: { recipeId: null }, Dinner: { recipeId: null }, Snack: { recipeId: null } },
        Tuesday: { Breakfast: { recipeId: null }, Lunch: { recipeId: null }, Dinner: { recipeId: null }, Snack: { recipeId: null } },
        Wednesday: { Breakfast: { recipeId: null }, Lunch: { recipeId: null }, Dinner: { recipeId: null }, Snack: { recipeId: null } },
        Thursday: { Breakfast: { recipeId: null }, Lunch: { recipeId: null }, Dinner: { recipeId: null }, Snack: { recipeId: null } },
        Friday: { Breakfast: { recipeId: null }, Lunch: { recipeId: null }, Dinner: { recipeId: null }, Snack: { recipeId: null } },
        Saturday: { Breakfast: { recipeId: null }, Lunch: { recipeId: null }, Dinner: { recipeId: null }, Snack: { recipeId: null } },
        Sunday: { Breakfast: { recipeId: null }, Lunch: { recipeId: null }, Dinner: { recipeId: null }, Snack: { recipeId: null } },
      },
      message: 'Planner loaded.',
    });

    mockGetRecipes.mockResolvedValue({
      success: true,
      recipes: [
        {
          id: 'r1',
          title: 'Recipe 1',
          ingredients: [{ calories: 200 }],
        },
      ],
    });

    mockSingle.mockResolvedValue({
      data: { daily_calorie_goal: 1000 },
      error: null,
    });
  });

  it('shows daily calories', async () => {
    render(React.createElement(WeeklyPlanner));

    await waitFor(() => {
      expect(screen.getByText(/200.*1000/i)).toBeInTheDocument();
    });
  });

  it('shows weekly total', async () => {
    render(React.createElement(WeeklyPlanner));

    await waitFor(() => {
      expect(screen.getByText(/200.*7000/i)).toBeInTheDocument();
    });
  });

  it('shows no max if no goal', async () => {
    mockSingle.mockResolvedValueOnce({
      data: { daily_calorie_goal: null },
      error: null,
    });

    render(React.createElement(WeeklyPlanner));

    await waitFor(() => {
      expect(screen.getAllByText(/no max set/i).length).toBeGreaterThan(0);
    });
  });
});