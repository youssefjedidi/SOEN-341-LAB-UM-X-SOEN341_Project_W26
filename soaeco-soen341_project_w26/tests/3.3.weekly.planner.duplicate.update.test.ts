/**
 * @jest-environment node
 */
import { updateWeeklyPlannerMeal } from "../src/app/weekly_planner/actions";
import { applyPlannerUpdate, getPlannerRowsForUser } from "../src/lib/weeklyPlanner";
import { supabase, supabaseAdmin } from "../src/lib/supabase";

jest.mock("../src/lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
  },
  supabaseAdmin: {
    from: jest.fn(),
  },
}));

jest.mock("../src/lib/weeklyPlanner", () => {
  const actual = jest.requireActual("../src/lib/weeklyPlanner");

  return {
    ...actual,
    getPlannerRowsForUser: jest.fn(),
    applyPlannerUpdate: jest.fn(),
  };
});

describe("3.3 weekly planner backend duplicate prevention and update flow", () => {
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

  it("rejects duplicate recipe assignments anywhere else in the same week", async () => {
    (getPlannerRowsForUser as jest.Mock).mockResolvedValue({
      data: [
        {
          day_of_week: "Tuesday",
          meal_type: "Lunch",
          recipe_id: recipeId,
          recipes: { title: "Soup" },
        },
      ],
      error: null,
    });

    const result = await updateWeeklyPlannerMeal({
      accessToken,
      dayOfWeek: "Monday",
      mealType: "Breakfast",
      recipeId,
    });

    expect(result).toEqual({
      success: false,
      status: "error",
      message: "This recipe is already assigned to another meal slot this week.",
    });
    expect(applyPlannerUpdate).not.toHaveBeenCalled();
  });

  it("updates an existing planner slot and returns an update message", async () => {
    (getPlannerRowsForUser as jest.Mock)
      .mockResolvedValueOnce({
        data: [
          {
            day_of_week: "Monday",
            meal_type: "Breakfast",
            recipe_id: "550e8400-e29b-41d4-a716-446655440111",
            recipes: { title: "Old Recipe" },
          },
        ],
        error: null,
      })
      .mockResolvedValueOnce({
        data: [
          {
            day_of_week: "Monday",
            meal_type: "Breakfast",
            recipe_id: recipeId,
            recipes: { title: "New Recipe" },
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
    expect(result.message).toBe("Weekly planner slot updated successfully.");
  });
});
