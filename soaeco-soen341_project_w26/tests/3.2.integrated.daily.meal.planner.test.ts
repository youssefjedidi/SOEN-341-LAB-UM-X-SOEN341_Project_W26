/**
 * @jest-environment node
 */
import { createEmptyPlannerGrid } from "../lib/weeklyPlanner";
import {
  applyRecipeToPlanner,
  canAddRecipeToPlanner,
  getUsedRecipeIds,
  isRecipeAlreadyUsed,
} from "../lib/weeklyPlannerUi";

describe("3.2 integrated daily meal planner frontend duplicate tracking", () => {
  it("collects all used recipe ids currently assigned in the week", () => {
    let planner = createEmptyPlannerGrid();

    planner = applyRecipeToPlanner(
      planner,
      "Monday",
      "Breakfast",
      "recipe-1",
      "Omelette",
    );

    planner = applyRecipeToPlanner(
      planner,
      "Tuesday",
      "Lunch",
      "recipe-2",
      "Soup",
    );

    expect(Array.from(getUsedRecipeIds(planner)).sort()).toEqual([
      "recipe-1",
      "recipe-2",
    ]);
  });

  it("detects when a recipe is already assigned somewhere in the same week", () => {
    const planner = applyRecipeToPlanner(
      createEmptyPlannerGrid(),
      "Monday",
      "Breakfast",
      "recipe-1",
      "Omelette",
    );

    expect(isRecipeAlreadyUsed(planner, "recipe-1")).toBe(true);
    expect(isRecipeAlreadyUsed(planner, "recipe-2")).toBe(false);
  });

  it("allows adding a recipe only when user and slot are selected and the recipe is not already used", () => {
    const planner = applyRecipeToPlanner(
      createEmptyPlannerGrid(),
      "Monday",
      "Breakfast",
      "recipe-1",
      "Omelette",
    );

    expect(
      canAddRecipeToPlanner({
        hasUser: true,
        selectedDay: "Tuesday",
        selectedMeal: "Lunch",
        planner,
        recipeId: "recipe-2",
      }),
    ).toBe(true);

    expect(
      canAddRecipeToPlanner({
        hasUser: true,
        selectedDay: "Tuesday",
        selectedMeal: "Lunch",
        planner,
        recipeId: "recipe-1",
      }),
    ).toBe(false);

    expect(
      canAddRecipeToPlanner({
        hasUser: false,
        selectedDay: "Tuesday",
        selectedMeal: "Lunch",
        planner,
        recipeId: "recipe-2",
      }),
    ).toBe(false);
  });
});