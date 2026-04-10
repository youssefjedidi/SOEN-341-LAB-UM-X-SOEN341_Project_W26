"use client";

import { useCallback, useEffect, useState } from "react";
import { IngredientSelector } from "@/components/IngredientSelector";
import { formStyles, layoutStyles } from "@/lib/styles";
import { createRecipe, deleteRecipe, getRecipes, updateRecipe } from "./actions";
import { useAuth } from "@/lib/useAuth";
import { Ingredient, Recipe } from "@/lib/types";

export default function RecipePage() {
  const [prepTime, setPrepTime] = useState("");
  const [recipeTitle, setRecipeTitle] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [restrictionInput, setRestrictionInput] = useState("");
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [cost, setCost] = useState("");
  const [prepSteps, setPrepSteps] = useState("");
  const [difficulty, setDifficulty] = useState(3);

  const [titleError, setTitleError] = useState("");
  const [ingredientsError, setIngredientsError] = useState("");
  const [stepsError, setStepsError] = useState("");
  const [formError, setFormError] = useState("");

  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);

  const loadRecipes = useCallback(async () => {
    if (!user) return;
    const result = await getRecipes();
    if (result.success && result.recipes) {
      setRecipes(result.recipes.filter((recipe: Recipe) => recipe.user_id === user.id));
    }
  }, [user]);

  useEffect(() => {
    let ignore = false;

    async function startFetching() {
      const result = await getRecipes();
      if (!ignore && result.success && result.recipes && user) {
        setRecipes(result.recipes.filter((recipe: Recipe) => recipe.user_id === user.id));
      }
    }

    if (user) {
      startFetching();
    }

    return () => {
      ignore = true;
    };
  }, [user]);

  const addRestriction = () => {
    if (restrictionInput.trim() === "") return;
    setRestrictions([...restrictions, restrictionInput.trim()]);
    setRestrictionInput("");
  };

  const removeRestriction = (index: number) => {
    setRestrictions(restrictions.filter((_, currentIndex) => currentIndex !== index));
  };

  const handleSubmit = async () => {
    if (!user) {
      setFormError("User is not authenticated.");
      return;
    }

    const titleOk = recipeTitle.trim() !== "";
    const ingredientsOk = ingredients.length > 0;
    const stepsOk = prepSteps.trim() !== "";

    setTitleError(titleOk ? "" : "Title cannot be empty");
    setIngredientsError(ingredientsOk ? "" : "Ingredients cannot be empty");
    setStepsError(stepsOk ? "" : "Instructions cannot be empty");
    setFormError("");

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
          setFormError(result.error || "Could not update recipe.");
        }
        return;
      }

      const result = await createRecipe({
        title: recipeTitle,
        prep_time: Number(prepTime),
        ingredients,
        restrictions,
        cost: Number(cost),
        preparation_steps: prepSteps,
        difficulty,
        user_id: user.id,
      });

      if (result.success) {
        resetForm();
        loadRecipes();
      } else {
        setFormError(result.error || "Could not create recipe.");
      }
    } catch {
      setFormError("Unexpected error while saving the recipe.");
    }
  };

  const resetForm = () => {
    setRecipeTitle("");
    setPrepTime("");
    setIngredients([]);
    setRestrictions([]);
    setRestrictionInput("");
    setCost("");
    setPrepSteps("");
    setDifficulty(3);
    setEditingRecipeId(null);

    setTitleError("");
    setIngredientsError("");
    setStepsError("");
    setFormError("");
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
    setIngredientsError("");
  };

  return (
    <div className={layoutStyles.pageContainer}>
      <div className={layoutStyles.formCard}>
        <h1 className={layoutStyles.pageTitle}>
          {editingRecipeId ? "Edit Recipe" : "Create Recipe"}
        </h1>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}
        >
          {formError && <div className={formStyles.errorBox}>{formError}</div>}

          <div className="mb-4">
            <label className={formStyles.label}>Recipe Title</label>
            <input
              className={formStyles.input}
              type="text"
              value={recipeTitle}
              onChange={(event) => setRecipeTitle(event.target.value)}
            />
            {titleError && <p className="text-red-600 text-sm mt-1">{titleError}</p>}
          </div>

          <div className="mb-4">
            <label className={formStyles.label}>Prep Time (minutes)</label>
            <input
              className={formStyles.input}
              type="number"
              min="0"
              value={prepTime}
              onChange={(event) => setPrepTime(event.target.value)}
            />
          </div>

          <IngredientSelector
            ingredients={ingredients}
            error={ingredientsError}
            onChange={setIngredients}
            onClearError={() => setIngredientsError("")}
          />

          <div className="mb-4">
            <label className={formStyles.label}>Restrictions</label>

            <div className="flex gap-2">
              <input
                className={formStyles.input}
                type="text"
                value={restrictionInput}
                onChange={(event) => setRestrictionInput(event.target.value)}
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
                {restrictions.map((restriction, index) => (
                  <li
                    key={index}
                    className="px-3 py-2 bg-gray-100 text-gray-900 rounded-md flex justify-between items-center"
                  >
                    <span>{restriction}</span>
                    <button
                      type="button"
                      onClick={() => removeRestriction(index)}
                      className={formStyles.dangerButton + " !flex-none !py-1 !px-2"}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mb-4">
            <label className={formStyles.label}>Cost (per portion)</label>
            <input
              className={formStyles.input}
              type="number"
              min="0"
              placeholder="Enter cost"
              value={cost}
              onChange={(event) => setCost(event.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className={formStyles.label}>Prep Steps</label>
            <textarea
              className={formStyles.input}
              rows={6}
              value={prepSteps}
              onChange={(event) => setPrepSteps(event.target.value)}
            />
            {stepsError && <p className="text-red-600 text-sm mt-1">{stepsError}</p>}
          </div>

          <div className="mb-4">
            <label className={formStyles.label}>Difficulty (/5)</label>
            <select
              className={formStyles.input}
              value={difficulty}
              onChange={(event) => setDifficulty(Number(event.target.value))}
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </div>

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

      <div className="mt-8 max-w-4xl w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">My Recipes</h2>

        {recipes.length === 0 ? (
          <p className="text-gray-500">No recipes found. Create one above!</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {recipes.map((recipe) => {
              const recipeTotalCalories =
                recipe.total_calories ??
                recipe.ingredients?.reduce(
                  (sum: number, ingredient: Ingredient) => sum + (Number(ingredient.calories) || 0),
                  0,
                ) ??
                0;

              return (
                <div
                  key={recipe.id}
                  className="bg-white p-4 rounded-lg shadow-md border border-emerald-100 flex flex-col"
                >
                  <h3 className="text-xl font-bold text-emerald-800 mb-2">{recipe.title}</h3>

                  <p className="text-sm text-gray-600 mb-2">
                    Prep: {recipe.prep_time}m | Cost: ${recipe.cost} | Difficulty:{" "}
                    {recipe.difficulty}/5
                  </p>

                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Total Calories: {recipeTotalCalories}
                  </p>

                  <div className="flex flex-col gap-2 mb-2">
                    {recipe.ingredients?.map((ingredient: Ingredient, index: number) => (
                      <div
                        key={index}
                        className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full w-fit"
                      >
                        {ingredient.name} - {Number(ingredient.calories) || 0} cal
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4 flex-grow">
                    {recipe.restrictions?.map((restriction: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full"
                      >
                        {restriction}
                      </span>
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
                        const result = await deleteRecipe(recipe.id);
                        if (result.success) {
                          loadRecipes();
                          if (editingRecipeId === recipe.id) {
                            resetForm();
                          }
                        } else {
                          setFormError(result.error || "Could not delete recipe.");
                        }
                      }}
                      className={formStyles.dangerButton + " !py-1 !px-3 !flex-none"}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
