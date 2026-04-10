"use server";

import { supabaseAdmin } from "@/src/lib/supabase";
import { Ingredient, IngredientCatalogItem, Recipe } from "@/src/lib/types";
import { calculateRecipeTotalCalories, normalizeIngredients } from "@/src/lib/recipeIngredients";

type RecipeIngredientInput = Partial<Ingredient>;

const formatRecipe = (recipe: Recipe) => {
  const normalizedIngredients = normalizeIngredients(recipe.ingredients);

  return {
    ...recipe,
    ingredients: normalizedIngredients,
    total_calories: calculateRecipeTotalCalories(normalizedIngredients),
  };
};

export const createRecipe = async (data: {
  title: string;
  prep_time: number;
  ingredients: RecipeIngredientInput[];
  restrictions: string[];
  cost: number;
  preparation_steps: string;
  difficulty: number;
  user_id: string;
  tags?: string[];
}) => {
  if (!supabaseAdmin) return { success: false, error: "Server error: Database connection not available" };

  const normalizedIngredients = normalizeIngredients(data.ingredients);

  const { data: recipe, error } = await supabaseAdmin.from("recipes").insert({
    title: data.title,
    prep_time: data.prep_time,
    ingredients: normalizedIngredients,
    restrictions: data.restrictions,
    tags: data.tags || [],
    cost: data.cost,
    preparation_steps: data.preparation_steps,
    difficulty: data.difficulty,
    user_id: data.user_id,
  }).select().single();

  if (error) return { success: false, error: error.message };
  return { success: true, recipe: formatRecipe(recipe as Recipe) };

};

export const getRecipes = async () => {
  if (!supabaseAdmin) return { success: false, error: "Server error" };
  const { data: recipes, error } = await supabaseAdmin.from("recipes").select("*");
  if (error) return { success: false, error: error.message };

  const recipesWithCalories = (recipes || []).map((recipe) => formatRecipe(recipe as Recipe));

  return { success: true, recipes: (recipesWithCalories || []) as Recipe[] };
};

export const deleteRecipe = async (id: string) => {
  if (!supabaseAdmin) return { success: false, error: "Server error" };
  const { data, error } = await supabaseAdmin.from("recipes").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true, data };
};

export const updateRecipe = async (
  id: string,
  data: {
    title?: string;
    prep_time?: number;
    ingredients?: RecipeIngredientInput[];
    restrictions?: string[];
    cost?: number;
    prep_steps?: string;
    difficulty?: number;
    tags?: string[];
  },
) => {
  if (!supabaseAdmin) return { success: false, error: "Server error" };

  const updateData: Partial<Recipe> & { preparation_steps?: string } = {};

  if (data.title !== undefined) {
    updateData.title = data.title;
  }

  if (data.prep_time !== undefined) {
    updateData.prep_time = data.prep_time;
  }

if (data.ingredients !== undefined) {
  updateData.ingredients = normalizeIngredients(data.ingredients);
}

  if (data.restrictions !== undefined) {
    updateData.restrictions = data.restrictions;
  }

  if (data.cost !== undefined) {
    updateData.cost = data.cost;
  }

  if (data.prep_steps) {
    updateData.preparation_steps = data.prep_steps;
  }

  if (data.difficulty !== undefined) {
    updateData.difficulty = data.difficulty;
  }

  // Ensure tags are always included (even empty array)
  updateData.tags = data.tags ?? [];
  const { data: recipe, error } = await supabaseAdmin
    .from("recipes")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, recipe: formatRecipe(recipe as Recipe) };
};

export const searchIngredients = async (keyword: string, limit = 20) => {
  if (!supabaseAdmin) return { success: false, error: "Server error" };

  const trimmedKeyword = keyword.trim();
  if (!trimmedKeyword) {
    return { success: true, ingredients: [] as IngredientCatalogItem[] };
  }

  const { data, error } = await supabaseAdmin.rpc("search_ingredients", {
    search_term: trimmedKeyword,
    result_limit: limit,
  });

  if (error) return { success: false, error: error.message };
  return { success: true, ingredients: (data || []) as IngredientCatalogItem[] };
};
