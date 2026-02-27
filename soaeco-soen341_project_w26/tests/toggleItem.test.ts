import { toggleItem } from "../app/utils/recipeUtils";


test("adds item when not present", () => {
  expect(toggleItem([1, 2], 3)).toEqual([1, 2, 3]);
});

test("removes item when present", () => {
  expect(toggleItem([1, 2, 3], 2)).toEqual([1, 3]);
});

test("removes the only element", () => {
  expect(toggleItem(["Vegan"], "Vegan")).toEqual([]);
});