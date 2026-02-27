import { filterRecipesBySearch } from "../app/utils/recipeUtils";

const mockRecipes = [
  { id: "1", title: "Chicken Pasta" },
  { id: "2", title: "Beef Burger" },
];

test("returns all recipes when search is empty", () => {
  expect(filterRecipesBySearch(mockRecipes, "")).toEqual(mockRecipes);
});

test("filters case-insensitively", () => {
  const result = filterRecipesBySearch(mockRecipes, "chicken");
  expect(result.length).toBe(1);
  expect(result[0].title).toBe("Chicken Pasta");
});

test("returns empty array if no match", () => {
  expect(filterRecipesBySearch(mockRecipes, "pizza")).toEqual([]);
});