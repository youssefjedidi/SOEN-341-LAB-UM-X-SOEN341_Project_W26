export interface Ingredient {
  ingredient_id?: string | null;
  name: string;
  grams?: number | null;
  calories_per_100g?: number | null;
  calories: number;
}

export interface IngredientCatalogItem {
  id: string;
  name: string;
  calories_per_100g: number;
  source?: string;
  source_food_id?: number;
}

export interface Recipe {
  id: string;
  title: string;
  prep_time: number;
  tags?: string[];
  ingredients: Ingredient[];
  restrictions: string[];
  cost: number;
  preparation_steps: string;
  difficulty: number;
  user_id: string;
  created_at?: string;
  total_calories?: number;
}

export type PlannerMealType = "Breakfast" | "Lunch" | "Dinner" | "Snack";

export type PlannerDayType =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export type WeeklyPlannerGrid = {
  [day in PlannerDayType]: {
    [meal in PlannerMealType]: {
      recipeId: string | null;
      recipeTitle: string | null;
    };
  };
};
