import type {
  PlannerDayType,
  PlannerMealType,
  WeeklyPlannerGrid,
} from "./types";
import { createEmptyPlannerGrid } from "./weeklyPlanner";

export const plannerDays: PlannerDayType[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const plannerMeals: PlannerMealType[] = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snack",
];

export const getPlannerSlotCount = (): number => {
  return plannerDays.length * plannerMeals.length;
};

export const isPlannerSlotEmpty = (
  planner: WeeklyPlannerGrid,
  day: PlannerDayType,
  meal: PlannerMealType,
): boolean => {
  return planner[day][meal].recipeId === null;
};

export const getFilledPlannerSlotsCount = (
  planner: WeeklyPlannerGrid,
): number => {
  let count = 0;

  for (const day of plannerDays) {
    for (const meal of plannerMeals) {
      if (planner[day][meal].recipeId) {
        count += 1;
      }
    }
  }

  return count;
};

export const getUsedRecipeIds = (
  planner: WeeklyPlannerGrid,
): Set<string> => {
  const usedRecipeIds = new Set<string>();

  for (const day of plannerDays) {
    for (const meal of plannerMeals) {
      const recipeId = planner[day][meal].recipeId;
      if (recipeId) {
        usedRecipeIds.add(recipeId);
      }
    }
  }

  return usedRecipeIds;
};

export const isRecipeAlreadyUsed = (
  planner: WeeklyPlannerGrid,
  recipeId: string,
): boolean => {
  return getUsedRecipeIds(planner).has(recipeId);
};

export const canAddRecipeToPlanner = (input: {
  hasUser: boolean;
  selectedDay: PlannerDayType | null;
  selectedMeal: PlannerMealType | null;
  planner: WeeklyPlannerGrid;
  recipeId: string;
}): boolean => {
  if (!input.hasUser) return false;
  if (!input.selectedDay || !input.selectedMeal) return false;
  if (isRecipeAlreadyUsed(input.planner, input.recipeId)) return false;

  return true;
};

export const applyRecipeToPlanner = (
  planner: WeeklyPlannerGrid,
  day: PlannerDayType,
  meal: PlannerMealType,
  recipeId: string,
  recipeTitle: string,
): WeeklyPlannerGrid => {
  return {
    ...planner,
    [day]: {
      ...planner[day],
      [meal]: {
        recipeId,
        recipeTitle,
      },
    },
  };
};

export const removeRecipeFromPlanner = (
  planner: WeeklyPlannerGrid,
  day: PlannerDayType,
  meal: PlannerMealType,
): WeeklyPlannerGrid => {
  return {
    ...planner,
    [day]: {
      ...planner[day],
      [meal]: {
        recipeId: null,
        recipeTitle: null,
      },
    },
  };
};

export const resetPlannerGrid = (): WeeklyPlannerGrid => {
  return createEmptyPlannerGrid();
};