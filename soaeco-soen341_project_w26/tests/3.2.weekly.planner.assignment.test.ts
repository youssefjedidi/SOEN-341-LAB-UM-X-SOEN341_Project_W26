/**
 * @jest-environment node
 */
import { updateWeeklyPlannerMeal } from "../app/weekly_planner/actions";
import { applyPlannerUpdate, getPlannerRowsForUser } from "../lib/weeklyPlanner";
import { supabase, supabaseAdmin } from "../lib/supabase";

jest.mock("../lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
  },
  supabaseAdmin: {
    from: jest.fn(),
  },
}));

jest.mock("../lib/weeklyPlanner", () => {
  const actual = jest.requireActual("../lib/weeklyPlanner");

  return {
    ...actual,
    getPlannerRowsForUser: jest.fn(),
    applyPlannerUpdate: jest.fn(),
  };
});

describe("3.2 weekly planner backend meal assignment and clearing", () => {
  const accessToken = "token";
  const userId = "550e8400-e29b-41d4-a716-446655440000";
  const recipeId = "550e8400-e29b-41d4-a716-446655440099";
  const mockedSupabaseAdmin = supabaseAdmin as NonNullable<typeof supabaseAdmin>;

  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: userId } },
      error: null,
    });
  });

  it("adds a new planner slot and returns an add message", async () => {
    (getPlannerRowsForUser as jest.Mock)
      .mockResolvedValueOnce({
        data: [],
        error: null,
      })
      .mockResolvedValueOnce({
        data: [
          {
            day_of_week: "Monday",
            meal_type: "Breakfast",
            recipe_id: recipeId,
            recipes: { title: "Soup" },
          },
        ],
        error: null,
      });

    (mockedSupabaseAdmin.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({
            data: { id: recipeId },
            error: null,
          }),
        }),
      }),
    });

    (applyPlannerUpdate as jest.Mock).mockResolvedValue({ error: null });

    const result = await updateWeeklyPlannerMeal({
      accessToken,
      dayOfWeek: "Monday",
      mealType: "Breakfast",
      recipeId,
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe("Weekly planner slot added successfully.");
  });

  it("clears an existing planner slot and returns a clear message", async () => {
    (getPlannerRowsForUser as jest.Mock)
      .mockResolvedValueOnce({
        data: [
          {
            day_of_week: "Monday",
            meal_type: "Breakfast",
            recipe_id: recipeId,
            recipes: { title: "Soup" },
          },
        ],
        error: null,
      })
      .mockResolvedValueOnce({
        data: [],
        error: null,
      });

    (applyPlannerUpdate as jest.Mock).mockResolvedValue({ error: null });

    const result = await updateWeeklyPlannerMeal({
      accessToken,
      dayOfWeek: "Monday",
      mealType: "Breakfast",
      recipeId: null,
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe("Weekly planner slot cleared successfully.");
  });
});
