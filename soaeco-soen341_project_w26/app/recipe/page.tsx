"use client";

import { useState } from "react";
import { formStyles, layoutStyles } from "@/lib/styles";
import { createRecipe } from "./actions";
import {useAuth} from "@/lib/useAuth";

export default function RecipePage() {
  const [prepTime, setPrepTime] = useState("");
  const [recipeTitle, setRecipeTitle] = useState("");
  const [ingeredientInput, setIngredientInput] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  // const [costMode, setCostMode] = useState("");
  const [cost, setCost] = useState("");
  const [prepSteps, setPrepSteps] = useState("");
  const [difficulty, setDifficulty] = useState(3);

  const {user} = useAuth();
  const addIngredient = () => {
    if (ingeredientInput.trim() === "") return;
    setIngredients([...ingredients, ingeredientInput]);
    setIngredientInput("");
  };

  const removeIngredient = (idx: number) => {
    setIngredients(ingredients.filter((_, i) => i !== idx));
  };
  const handleSubmit = async () => {
    if (!user) {
      console.error("User is not authenticated");
      return;
    }
    try {
      const result = await createRecipe({
        title: recipeTitle,
        prep_time: Number(prepTime),
        ingredients,
        cost: Number(cost),
        prep_steps: prepSteps,
        difficulty,
        user_id: user.id ,
      });

      if (result.success) {
        console.log("Recipe created successfully:", result.recipe);
        alert("Recipe saved successfully!");
      } else {
        console.error("Error creating recipe:", result.error);
        alert("Error: " + result.error);
      }
      // Optionally, reset form or show success message
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  return (
    <div className={layoutStyles.pageContainer}>
      <div className={layoutStyles.formCard}>
        <h1 className={layoutStyles.pageTitle}>Create Recipe</h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          {/* recipie title */}
          <div className="mb-4">
            <label className={formStyles.label}> Recipe Title </label>
            <input
              className={formStyles.input}
              type="text"
              value={recipeTitle}
              onChange={(e) => setRecipeTitle(e.target.value)}
            />
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
                className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Add
              </button>
            </div>

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
                      className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
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
            <label className={formStyles.label}>Cost</label>
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
              className="flex-1 px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition"
            >
              Save Recipe
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
