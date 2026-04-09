/**
 * @jest-environment node
 */
import { getWeeklyPlanner } from "../app/weekly_planner/actions";
import { getPlannerRowsForUser } from "../lib/weeklyPlanner";
import { supabase } from "../lib/supabase";

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

describe("3.1 weekly planner backend retrieval and initialization", () => {
  const accessToken = "token";
  const userId = "550e8400-e29b-41d4-a716-446655440000";

  beforeEach(() => {
    jest.clearAllMocks();
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
});
