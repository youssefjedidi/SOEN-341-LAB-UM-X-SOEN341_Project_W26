/**
 * @jest-environment node
 */
import { getWeeklyPlanner, updateWeeklyPlannerMeal } from "../app/weekly_planner/actions";
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
    // These two helpers are mocked so the tests can focus on action behavior
    // without depending on a live planner table or real database writes.
    getPlannerRowsForUser: jest.fn(),
    applyPlannerUpdate: jest.fn(),
  };
});

describe("weekly planner actions", () => {
  const accessToken = "token";
  const userId = "550e8400-e29b-41d4-a716-446655440000";
  const recipeId = "550e8400-e29b-41d4-a716-446655440099";
  const mockedSupabaseAdmin = supabaseAdmin as NonNullable<typeof supabaseAdmin>;

  beforeEach(() => {
    jest.clearAllMocks();
    // Every action call starts by resolving the current user from the access token.
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: userId } },
      error: null,
    });
  });

  it("returns an empty initialized planner when the user has no rows", async () => {
    (getPlannerRowsForUser as jest.Mock).mockResolvedValue({
      data: [],
      error: null,
    });

    const result = await getWeeklyPlanner(accessToken);

    expect(result.success).toBe(true);
    expect(result.initialized).toBe(true);
    expect(result.grid?.Monday.Breakfast).toEqual({
      recipeId: null,
      recipeTitle: null,
    });
  });

  it("rejects duplicate recipe assignments anywhere else in the same week", async () => {
    (getPlannerRowsForUser as jest.Mock).mockResolvedValue({
      data: [
        // The duplicate lives in a different slot, which should cause the action
        // to reject the new assignment before any database update is attempted.
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

  it("adds a new planner slot and returns an add message", async () => {
    (getPlannerRowsForUser as jest.Mock)
      .mockResolvedValueOnce({
        // First read: the slot is empty before the write.
        data: [],
        error: null,
      })
      .mockResolvedValueOnce({
        // Second read: the action reloads the planner after the write succeeds.
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

  it("updates an existing planner slot and returns an update message", async () => {
    (getPlannerRowsForUser as jest.Mock)
      .mockResolvedValueOnce({
        data: [
          // This existing row makes the action treat the change as a replacement
          // rather than a brand-new slot assignment.
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

  it("clears an existing planner slot and returns a clear message", async () => {
    (getPlannerRowsForUser as jest.Mock)
      .mockResolvedValueOnce({
        data: [
          // The initial read shows a filled slot that will be deleted.
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
        // After the delete, the planner is empty again.
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
