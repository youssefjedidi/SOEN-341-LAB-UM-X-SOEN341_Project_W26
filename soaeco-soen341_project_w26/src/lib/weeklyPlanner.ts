import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  PlannerDayType,
  PlannerMealType,
  WeeklyPlannerGrid,
} from "@/src/lib/types";

export const PLANNER_DAYS: PlannerDayType[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const PLANNER_MEAL_TYPES: PlannerMealType[] = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snack",
];

type PlannerRecipeRow = {
  title: string | null;
};

export type WeeklyPlannerRow = {
  day_of_week: PlannerDayType;
  meal_type: PlannerMealType;
  recipe_id: string | null;
  recipes?: PlannerRecipeRow | PlannerRecipeRow[] | null;
};

export type PlannerUpdateInput = {
  dayOfWeek: PlannerDayType;
  mealType: PlannerMealType;
  recipeId: string | null;
};

export const createEmptyPlannerGrid = (): WeeklyPlannerGrid => ({
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
});

const normalizeRecipe = (
  recipe: WeeklyPlannerRow["recipes"],
): PlannerRecipeRow | null => {
  if (Array.isArray(recipe)) {
    return recipe[0] ?? null;
  }

  return recipe ?? null;
};

export const formatPlannerRowsAsGrid = (
  rows: WeeklyPlannerRow[] | null | undefined,
): WeeklyPlannerGrid => {
  const grid = createEmptyPlannerGrid();

  for (const row of rows ?? []) {
    grid[row.day_of_week][row.meal_type] = {
      recipeId: row.recipe_id,
      recipeTitle: normalizeRecipe(row.recipes)?.title ?? null,
    };
  }

  return grid;
};

export const isValidPlannerDay = (value: string): value is PlannerDayType =>
  PLANNER_DAYS.includes(value as PlannerDayType);

export const isValidMealType = (value: string): value is PlannerMealType =>
  PLANNER_MEAL_TYPES.includes(value as PlannerMealType);

export const isUuidLike = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );

export const getPlannerRowsForUser = async (
  client: SupabaseClient,
  userId: string,
) => {
  return client
    .from("weekly_planner")
    .select("day_of_week, meal_type, recipe_id, recipes(title)")
    .eq("user_id", userId)
    .order("day_of_week", { ascending: true })
    .order("meal_type", { ascending: true });
};

export const applyPlannerUpdate = async (
  client: SupabaseClient,
  userId: string,
  input: PlannerUpdateInput,
) => {
  if (input.recipeId) {
    const { error } = await client.from("weekly_planner").upsert(
      {
        user_id: userId,
        day_of_week: input.dayOfWeek,
        meal_type: input.mealType,
        recipe_id: input.recipeId,
      },
      {
        onConflict: "user_id,day_of_week,meal_type",
      },
    );

    return { error };
  }

  const { error } = await client
    .from("weekly_planner")
    .delete()
    .eq("user_id", userId)
    .eq("day_of_week", input.dayOfWeek)
    .eq("meal_type", input.mealType);

  return { error };
};
