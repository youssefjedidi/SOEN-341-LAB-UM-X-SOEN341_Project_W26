/**
 * @jest-environment node
 */
import { createEmptyPlannerGrid } from "../lib/weeklyPlanner";
import {
  applyRecipeToPlanner,
  removeRecipeFromPlanner,
  resetPlannerGrid,
} from "../lib/weeklyPlannerUi";

describe("3.3 add remove planned recipe frontend state changes", () => {
  it("adds a recipe to the selected planner slot", () => {
    const planner = applyRecipeToPlanner(
      createEmptyPlannerGrid(),
      "Wednesday",
      "Dinner",
      "recipe-9",
      "Pasta",
    );

    expect(planner.Wednesday.Dinner).toEqual({
      recipeId: "recipe-9",
      recipeTitle: "Pasta",
    });
  });

  it("removes a recipe from the selected planner slot", () => {
    const planner = applyRecipeToPlanner(
      createEmptyPlannerGrid(),
      "Wednesday",
      "Dinner",
      "recipe-9",
      "Pasta",
    );

    const updatedPlanner = removeRecipeFromPlanner(
      planner,
      "Wednesday",
      "Dinner",
    );

    expect(updatedPlanner.Wednesday.Dinner).toEqual({
      recipeId: null,
      recipeTitle: null,
    });

    expect(planner.Wednesday.Dinner).toEqual({
      recipeId: "recipe-9",
      recipeTitle: "Pasta",
    });
  });

  it("resets the weekly planner back to an empty grid", () => {
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
      "Friday",
      "Snack",
      "recipe-2",
      "Fruit Bowl",
    );

    const resetPlanner = resetPlannerGrid();

    expect(resetPlanner).toEqual(createEmptyPlannerGrid());
    expect(resetPlanner).not.toBe(planner);
  });
});