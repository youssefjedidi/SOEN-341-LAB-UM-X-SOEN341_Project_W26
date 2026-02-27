"use client";

import { useState, useEffect, useRef } from "react";
import { formStyles, layoutStyles } from "@/lib/styles";
import { createRecipe, getRecipes, deleteRecipe, updateRecipe } from "./actions";
import { useAuth } from "@/lib/useAuth";
import { Recipe } from "@/lib/types";
import { useCallback } from "react";

export default function RecipePage() {
  const [prepTime, setPrepTime] = useState("");
  const [recipeTitle, setRecipeTitle] = useState("");
  const [ingeredientInput, setIngredientInput] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [restrictionInput, setRestrictionInput] = useState("");
  const [restrictions, setRestrictions] = useState<string[]>([]);
  // const [costMode, setCostMode] = useState("");
  const [cost, setCost] = useState("");
  const [prepSteps, setPrepSteps] = useState("");
  const [difficulty, setDifficulty] = useState(3);

  const [titleError, setTitleError] = useState("");
  const [ingredientsError, setIngredientsError] = useState("");
  const [stepsError, setStepsError] = useState("");

  const {user} = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);

  const loadRecipes = useCallback(async () => {
    if (!user) return;
    const result = await getRecipes();
    if (result.success && result.recipes) {
      // Filter for current user
      setRecipes(result.recipes.filter((r: Recipe) => r.user_id === user.id));
    }
  }, [user]);

  useEffect(() => {
    let ignore = false;
    async function startFetching() {
      const result = await getRecipes();
      if (!ignore && result.success && result.recipes && user) {
        setRecipes(result.recipes.filter((r: Recipe) => r.user_id === user.id));
      }
    }
    if (user) {
      startFetching();
    }
    return () => {
      ignore = true;
    };
  }, [user]);

  const addIngredient = () => {
    if (ingeredientInput.trim() === "") return;
    setIngredients([...ingredients, ingeredientInput]);
    setIngredientInput("");

     if (ingredientsError) setIngredientsError("");
  };

  const removeIngredient = (idx: number) => {
    setIngredients(ingredients.filter((_, i) => i !== idx));
  };

  const addRestriction = () => {
    if (restrictionInput.trim() === "") return;
    setRestrictions([...restrictions, restrictionInput]);
    setRestrictionInput("");
  };

  const removeRestriction = (idx: number) => {
    setRestrictions(restrictions.filter((_, i) => i !== idx));
  };
  const handleSubmit = async () => {
    if (!user) {
      console.error("User is not authenticated");
      return;
    }
    const titleOk = recipeTitle.trim() !== "";
    const ingredientsOk = ingredients.length > 0;
    const stepsOk = prepSteps.trim() !== "";

    setTitleError(titleOk ? "" : "Title cannot be empty");
    setIngredientsError(ingredientsOk ? "" : "Ingredients cannot be empty");
    setStepsError(stepsOk ? "" : "Instructions cannot be empty");

    if (!titleOk || !ingredientsOk || !stepsOk) return;
    
    try {
      if (editingRecipeId) {
        const result = await updateRecipe(editingRecipeId, {
          title: recipeTitle,
          prep_time: Number(prepTime),
          ingredients,
          restrictions,
          cost: Number(cost),
          prep_steps: prepSteps,
          difficulty,
        });

        if (result.success) {
          resetForm();
          loadRecipes();
        } else {
          console.error("Error updating recipe:", result.error);
        }
        return;
      }

      const result = await createRecipe({
        title: recipeTitle,
        prep_time: Number(prepTime),
        ingredients,
        restrictions,
        cost: Number(cost),
        prep_steps: prepSteps,
        difficulty,
        user_id: user.id ,
      });

      if (result.success) {
        console.log("Recipe created successfully:", result.recipe);
        resetForm();
        loadRecipes();
      } else {
        console.error("Error creating recipe:", result.error);
      }
      // Optionally, reset form or show success message
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  const resetForm = () => {
    setRecipeTitle("");
    setPrepTime("");
    setIngredients([]);
    setIngredientInput("");
    setRestrictions([]);
    setRestrictionInput("");
    setCost("");
    setPrepSteps("");
    setDifficulty(3);
    setEditingRecipeId(null);

    setTitleError("");
    setIngredientsError("");
    setStepsError("");

  };

  const handleEdit = (recipe: Recipe) => {
    setEditingRecipeId(recipe.id);
    setRecipeTitle(recipe.title);
    setPrepTime(recipe.prep_time?.toString() || "");
    setIngredients(recipe.ingredients || []);
    setRestrictions(recipe.restrictions || []);
    setCost(recipe.cost?.toString() || "");
    setPrepSteps(recipe.preparation_steps || "");
    setDifficulty(recipe.difficulty || 3);
  };

  return (
    <div className={layoutStyles.pageContainer}>
      <div className={layoutStyles.formCard}>
        <h1 className={layoutStyles.pageTitle}>{editingRecipeId ? "Edit Recipe" : "Create Recipe"}</h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          {/* recipe title */}
          <div className="mb-4">
            <label className={formStyles.label}> Recipe Title </label>
            <input
              className={formStyles.input}
              type="text"
              value={recipeTitle}
              onChange={(e) => setRecipeTitle(e.target.value)}
            />
            {titleError && <p className="text-red-600 text-sm mt-1">{titleError}</p>}  
          </div>
          {/* Prep Time */}
          <div className="mb-4">
            <label className={formStyles.label}>Prep Time (minutes)</label>
            <input
              className={formStyles.input}
              type="number"
              min="0"
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
            />
          </div>

          {/* Ingredients */}
          <div className="mb-4">
            <label className={formStyles.label}>Ingredients</label>

            <div className="flex gap-2">
              <input
                className={formStyles.input}
                type="text"
                value={ingeredientInput}
                onChange={(e) => setIngredientInput(e.target.value)}
              />
              <button
                type="button"
                onClick={addIngredient}
                className={formStyles.secondaryButton + " !py-2 !px-4 !flex-none"}
              >
                Add
              </button>
            </div>
            {ingredientsError && <p className="text-red-600 text-sm mt-1">{ingredientsError}</p>}
            {ingredients.length > 0 && (
              <ul className="mt-3 space-y-2">
                {ingredients.map((ing, idx) => (
                  <li
                    key={idx}
                    className="px-3 py-2 bg-gray-100 text-gray-900 rounded-md flex justify-between items-center"
                  >
                    <span>{ing}</span>
                    <button
                      type="button"
                      onClick={() => removeIngredient(idx)}
                      className={formStyles.dangerButton + " !flex-none !py-1 !px-2"}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Restrictions */}
          <div className="mb-4">
            <label className={formStyles.label}>Restrictions</label>

            <div className="flex gap-2">
              <input
                className={formStyles.input}
                type="text"
                value={restrictionInput}
                onChange={(e) => setRestrictionInput(e.target.value)}
              />
              <button
                type="button"
                onClick={addRestriction}
                className={formStyles.secondaryButton + " !py-2 !px-4 !flex-none"}
              >
                Add
              </button>
            </div>
            {restrictions.length > 0 && (
              <ul className="mt-3 space-y-2">
                {restrictions.map((res, idx) => (
                  <li
                    key={idx}
                    className="px-3 py-2 bg-gray-100 text-gray-900 rounded-md flex justify-between items-center"
                  >
                    <span>{res}</span>
                    <button
                      type="button"
                      onClick={() => removeRestriction(idx)}
                      className={formStyles.dangerButton + " !flex-none !py-1 !px-2"}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Cost*/}
          <div className="mb-4">
            <label className={formStyles.label}>Cost (per portion)</label>
            <input
              className={formStyles.input}
              type="number"
              min="0"
              placeholder="Enter cost"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />
          </div>

          {/* Prep Steps */}
          <div className="mb-4">
            <label className={formStyles.label}>Prep Steps</label>
            <textarea
              className={formStyles.input}
              rows={6}
              value={prepSteps}
              onChange={(e) => setPrepSteps(e.target.value)}
            />
             {stepsError && <p className="text-red-600 text-sm mt-1">{stepsError}</p>}
          </div>

          {/* Difficulty */}
          <div className="mb-4">
            <label className={formStyles.label}>Difficulty (/5)</label>
            <select
              className={formStyles.input}
              value={difficulty}
              onChange={(e) => setDifficulty(Number(e.target.value))}
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-between gap-4 mt-6">
            <button
              type="button"
              onClick={resetForm}
              className={formStyles.secondaryButton}
            >
              Cancel
            </button>

            <button
              type="submit"
              className={formStyles.button + " !w-auto !flex-1"}
            >
              {editingRecipeId ? "Update Recipe" : "Save Recipe"}
            </button>
          </div>
        </form>
      </div>

      {/* Recipe List */}
      <div className="mt-8 max-w-4xl w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">My Recipes</h2>
        {recipes.length === 0 ? (
          <p className="text-gray-500">No recipes found. Create one above!</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {recipes.map((recipe) => (
              <div key={recipe.id} className="bg-white p-4 rounded-lg shadow-md border border-emerald-100 flex flex-col">
                <h3 className="text-xl font-bold text-emerald-800 mb-2">{recipe.title}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Prep: {recipe.prep_time}m | Cost: ${recipe.cost} | Difficulty: {recipe.difficulty}/5
                </p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {recipe.ingredients?.map((ing: string, i: number) => (
                    <span key={i} className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full">{ing}</span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1 mb-4 flex-grow">
                  {recipe.restrictions?.map((res: string, i: number) => (
                    <span key={i} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">{res}</span>
                  ))}
                </div>
                <div className="flex justify-end gap-2 mt-auto">
                  <button 
                    onClick={() => handleEdit(recipe)}
                    className={formStyles.secondaryButton + " !py-1 !px-3 !flex-none"}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={async () => {
                      const res = await deleteRecipe(recipe.id);
                      if (res.success) {
                        loadRecipes();
                        if (editingRecipeId === recipe.id) {
                          resetForm();
                        }
                      } else {
                        console.error("Failed to delete recipe:", res.error);
                      }
                    }}
                    className={formStyles.dangerButton + " !py-1 !px-3 !flex-none"}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
