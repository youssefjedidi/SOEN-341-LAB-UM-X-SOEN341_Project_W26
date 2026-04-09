import { Ingredient } from "@/lib/types";

type IngredientLike = Partial<Ingredient> | string | null | undefined;

const roundToTwoDecimals = (value: number) => Math.round(value * 100) / 100;

const parseOptionalNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const normalizeIngredient = (ingredient: IngredientLike): Ingredient | null => {
if (ingredient === null || ingredient === undefined) {
  return null;
}

  if (typeof ingredient === "string") {
    return {
      ingredient_id: null,
      name: ingredient,
      grams: null,
      calories_per_100g: null,
      calories: 0,
    };
  }
// Normalize and validate ingredient name to ensure consistent formatting
  const name = typeof ingredient.name === "string" ? ingredient.name.trim() : "";
  if (!name) {
    return null;
  }

  const grams = parseOptionalNumber(ingredient.grams);
  const caloriesPer100g = parseOptionalNumber(ingredient.calories_per_100g);
  const fallbackCalories = parseOptionalNumber(ingredient.calories) ?? 0;

  const computedCalories =
    grams !== null && caloriesPer100g !== null
      ? roundToTwoDecimals((grams * caloriesPer100g) / 100)
      : roundToTwoDecimals(fallbackCalories);

  return {
    ingredient_id:
      typeof ingredient.ingredient_id === "string" && ingredient.ingredient_id.trim() !== ""
        ? ingredient.ingredient_id
        : null,
    name,
    grams,
    calories_per_100g: caloriesPer100g,
    calories: computedCalories,
  };
};

export const normalizeIngredients = (ingredients: IngredientLike[] | null | undefined): Ingredient[] => {
  if (!Array.isArray(ingredients)) {
    return [];
  }

  return ingredients
    .map((ingredient) => normalizeIngredient(ingredient))
    .filter((ingredient): ingredient is Ingredient => ingredient !== null);
};

export const calculateRecipeTotalCalories = (ingredients: Ingredient[] | null | undefined): number => {
  if (!Array.isArray(ingredients)) {
    return 0;
  }

  return roundToTwoDecimals(
    ingredients.reduce((sum, ingredient) => sum + (Number(ingredient.calories) || 0), 0),
  );
};
