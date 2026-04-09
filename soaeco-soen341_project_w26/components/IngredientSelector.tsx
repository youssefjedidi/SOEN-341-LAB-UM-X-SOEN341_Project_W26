"use client";

import { Dispatch, SetStateAction, useDeferredValue, useEffect, useMemo, useState } from "react";
import { formStyles } from "@/lib/styles";
import { Ingredient, IngredientCatalogItem } from "@/lib/types";

type IngredientSelectorProps = {
  ingredients: Ingredient[];
  error?: string;
  onChange: Dispatch<SetStateAction<Ingredient[]>>;
  onClearError?: () => void;
};

const roundToTwoDecimals = (value: number) => Math.round(value * 100) / 100;

const calculateCalories = (grams: number | null | undefined, caloriesPer100g: number | null | undefined) => {
  if (grams === null || grams === undefined || caloriesPer100g === null || caloriesPer100g === undefined) {
    return 0;
  }

  return roundToTwoDecimals((grams * caloriesPer100g) / 100);
};

export function IngredientSelector({
  ingredients,
  error,
  onChange,
  onClearError,
}: IngredientSelectorProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<IngredientCatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const deferredQuery = useDeferredValue(query.trim());

  useEffect(() => {
    if (!deferredQuery) {
      setResults([]);
      setIsLoading(false);
      setSearchError("");
      return;
    }

    let ignore = false;
    const timeoutId = window.setTimeout(async () => {
      setIsLoading(true);

      try {
        const response = await fetch(
          `/api/ingredients?keyword=${encodeURIComponent(deferredQuery)}&limit=8`,
        );
        const payload = await response.json();

        if (ignore) {
          return;
        }

        if (!response.ok) {
          setResults([]);
          setSearchError(payload.error || "Could not load ingredients.");
          return;
        }

        setResults(payload);
        setSearchError("");
      } catch {
        if (!ignore) {
          setResults([]);
          setSearchError("Could not load ingredients.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }, 250);

    return () => {
      ignore = true;
      window.clearTimeout(timeoutId);
    };
  }, [deferredQuery]);

  const totalCalories = useMemo(
    () => roundToTwoDecimals(ingredients.reduce((sum, ingredient) => sum + (Number(ingredient.calories) || 0), 0)),
    [ingredients],
  );

  const addIngredient = (ingredient: IngredientCatalogItem) => {
    const alreadySelected = ingredients.some((item) => item.ingredient_id === ingredient.id);
    if (alreadySelected) {
      setSearchError("This ingredient is already in the recipe.");
      return;
    }

    onChange([
      ...ingredients,
      {
        ingredient_id: ingredient.id,
        name: ingredient.name,
        grams: 0,
        calories_per_100g: ingredient.calories_per_100g,
        calories: 0,
      },
    ]);

    onClearError?.();
    setQuery("");
    setResults([]);
    setSearchError("");
  };

  const updateGrams = (index: number, value: string) => {
    const grams = value === "" ? null : Number(value);
    const updatedIngredients = [...ingredients];
    const current = updatedIngredients[index];
const safeGrams =
  grams !== null && Number.isFinite(grams) && grams >= 0 ? grams : null;

    updatedIngredients[index] = {
      ...current,
      grams: safeGrams,
      calories: calculateCalories(safeGrams, current.calories_per_100g),
    };

    onChange(updatedIngredients);
    onClearError?.();
  };

  const updateLegacyCalories = (index: number, value: string) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      calories: value === "" ? 0 : Number(value) || 0,
    };

    onChange(updatedIngredients);
    onClearError?.();
  };

  const removeIngredient = (index: number) => {
    onChange(ingredients.filter((_, currentIndex) => currentIndex !== index));
  };

  const showResults = query.trim().length > 0;

  return (
    <div className="mb-4">
      <label className={formStyles.label}>Ingredients</label>

      <div className="relative">
        <input
          className={formStyles.input}
          type="text"
          placeholder="Search ingredients"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        {showResults && (
          <div className={formStyles.searchResults}>
            {isLoading ? (
              <p className={formStyles.ingredientMeta}>Loading ingredients...</p>
            ) : searchError ? (
              <p className="text-sm font-bold text-red-600">{searchError}</p>
            ) : results.length === 0 ? (
              <p className={formStyles.ingredientMeta}>No ingredients found.</p>
            ) : (
              <ul className="space-y-2">
                {results.map((result) => (
                  <li key={result.id}>
                    <button
                      type="button"
                      onClick={() => addIngredient(result)}
                      className={formStyles.searchResultButton}
                    >
                      <span className="block text-sm font-black text-stone-900">{result.name}</span>
                      <span className={formStyles.ingredientMeta}>
                        {result.calories_per_100g} cal per 100g
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}

      {ingredients.length > 0 && (
        <div className="mt-4 space-y-3">
          {ingredients.map((ingredient, index) => {
            const hasCatalogNutrition = ingredient.calories_per_100g !== null && ingredient.calories_per_100g !== undefined;

            return (
              <div key={`${ingredient.ingredient_id ?? ingredient.name}-${index}`} className={formStyles.ingredientRow}>
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-stone-900">{ingredient.name}</p>
                    <p className={`${formStyles.ingredientMeta} mt-1`}>
                      {hasCatalogNutrition
                        ? `${ingredient.calories_per_100g} cal per 100g`
                        : "Legacy ingredient entry"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className={formStyles.dangerButton + " !flex-none !py-1 !px-3"}
                  >
                    Remove
                  </button>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {hasCatalogNutrition ? (
                    <div>
                      <label className={formStyles.label}>Grams</label>
                      <input
                        className={formStyles.input}
                        type="number"
                        min="0"
                        value={ingredient.grams ?? ""}
                        onChange={(event) => updateGrams(index, event.target.value)}
                      />
                    </div>
                  ) : (
                    <div>
                      <label className={formStyles.label}>Calories</label>
                      <input
                        className={formStyles.input}
                        type="number"
                        min="0"
                        value={ingredient.calories ?? 0}
                        onChange={(event) => updateLegacyCalories(index, event.target.value)}
                      />
                    </div>
                  )}

                  <div className="rounded-2xl border-2 border-stone-900 bg-white px-4 py-3">
                    <p className={formStyles.ingredientMeta}>Ingredient Calories</p>
                    <p className={`${formStyles.ingredientValue} mt-1`}>
                      {ingredient.calories ?? 0} cal
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="rounded-2xl border-2 border-stone-900 bg-white px-4 py-3">
            <p className={formStyles.ingredientMeta}>Total Recipe Calories</p>
            <p className={`${formStyles.ingredientValue} mt-1`}>{totalCalories} cal</p>
          </div>
        </div>
      )}
    </div>
  );
}
