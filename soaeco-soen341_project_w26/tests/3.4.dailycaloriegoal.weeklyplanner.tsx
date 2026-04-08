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

function setup(recipeCalories: number, dailyGoal: number | null) {
  mockGetSession.mockResolvedValue({
    data: { session: { access_token: 't' } },
    error: null,
  });

  mockGetWeeklyPlanner.mockResolvedValue({
    success: true,
    grid: {
      Monday: {
        Breakfast: { recipeId: 'r1' },
        Lunch: { recipeId: null },
        Dinner: { recipeId: null },
        Snack: { recipeId: null },
      },
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
        ingredients: [{ calories: recipeCalories }],
      },
    ],
  });

  mockSingle.mockResolvedValue({
    data: { daily_calorie_goal: dailyGoal },
    error: null,
  });
}

describe('daily calorie goal status', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows within limit when total calories are below the daily goal', async () => {
    setup(500, 1000);

    render(React.createElement(WeeklyPlanner));

    await waitFor(() => {
      expect(screen.getByText(/500 \/ 1000 cal/i)).toBeInTheDocument();
      expect(screen.getByText(/within limit/i)).toBeInTheDocument();
    });
  });

  it('shows near max when total calories reach 75% of the daily goal', async () => {
    setup(800, 1000);

    render(React.createElement(WeeklyPlanner));

    await waitFor(() => {
      expect(screen.getByText(/800 \/ 1000 cal/i)).toBeInTheDocument();
      expect(screen.getByText(/near max/i)).toBeInTheDocument();
    });
  });

  it('shows at or above max when total calories meet or exceed the daily goal', async () => {
    setup(1200, 1000);

    render(React.createElement(WeeklyPlanner));

    await waitFor(() => {
      expect(screen.getByText(/1200 \/ 1000 cal/i)).toBeInTheDocument();
      expect(screen.getByText(/at or above max/i)).toBeInTheDocument();
    });
  });

  it('shows no max set when the user has no daily calorie goal', async () => {
    setup(500, null);

    render(React.createElement(WeeklyPlanner));

    await waitFor(() => {
      expect(screen.getByText(/500 \/ — cal/i)).toBeInTheDocument();
      expect(screen.getAllByText(/no max set/i).length).toBeGreaterThan(0);
    });
  });
});