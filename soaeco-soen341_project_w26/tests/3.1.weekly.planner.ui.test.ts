/**
 * @jest-environment node
 */
import { createEmptyPlannerGrid } from "../src/lib/weeklyPlanner";
import {
  applyRecipeToPlanner,
  getFilledPlannerSlotsCount,
  getPlannerSlotCount,
  isPlannerSlotEmpty,
} from "../src/lib/weeklyPlannerUi";

describe("3.1 weekly planner frontend ui state", () => {
  it("starts with 28 empty planner slots", () => {
    const planner = createEmptyPlannerGrid();

    expect(getPlannerSlotCount()).toBe(28);
    expect(getFilledPlannerSlotsCount(planner)).toBe(0);
    expect(isPlannerSlotEmpty(planner, "Monday", "Breakfast")).toBe(true);
    expect(isPlannerSlotEmpty(planner, "Sunday", "Snack")).toBe(true);
  });

  it("marks a slot as filled after a recipe is placed in the planner", () => {
    const planner = applyRecipeToPlanner(
      createEmptyPlannerGrid(),
      "Monday",
      "Breakfast",
      "recipe-1",
      "Omelette",
    );

    expect(getFilledPlannerSlotsCount(planner)).toBe(1);
    expect(isPlannerSlotEmpty(planner, "Monday", "Breakfast")).toBe(false);
    expect(planner.Monday.Breakfast).toEqual({
      recipeId: "recipe-1",
      recipeTitle: "Omelette",
    });
  });
});