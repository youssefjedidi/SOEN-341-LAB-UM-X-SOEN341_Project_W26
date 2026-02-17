"use server";

import {  supabaseAdmin } from "@/lib/supabase";

export const createRecipe = async (data: {
  title: string;
  prep_time: number;
  ingredients: string[];
  cost: number;
  prep_steps: string;
  difficulty: number;
  user_id: string;
}) => {
  const { data: recipe, error } = await supabaseAdmin.from("recipes").insert({
    title: data.title,
    prep_time: data.prep_time,
    ingredients: data.ingredients,
    cost: data.cost,
    preparation_steps: data.prep_steps,
    difficulty: data.difficulty,
    user_id: data.user_id,
  }).select().single();

  if (error) return { success: false, error: error.message };
  return { success: true, recipe };

};

export const getRecipes = async () => {
  const { data: recipes, error } = await supabaseAdmin.from("recipes").select("*");
  if (error) return { success: false, error: error.message };
  return { success: true, recipes };
};

export const deleteRecipe = async (id: string) => {
  const { data, error } = await supabaseAdmin.from("recipes").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true, data };
};

export const updateRecipe = async (
  id: string,
  data: {
    title?: string;
    prep_time?: number;
    ingredients?: string[];
    cost?: number;
    prep_steps?: string;
    difficulty?: number;
  },
) => {
  const updateData: any = { ...data };
  if (data.prep_steps) {
    updateData.preparation_steps = data.prep_steps;
    delete updateData.prep_steps;
  }
  const { data: recipe, error } = await supabaseAdmin
    .from("recipes")
    .update(updateData)
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  return { success: true, recipe };
};
