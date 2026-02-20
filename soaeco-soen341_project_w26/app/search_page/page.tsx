'use client'

import { useRouter } from "next/navigation";
import { layoutStyles, formStyles } from '@/lib/styles';
import { useState } from "react";

type Recipe = {
    id: string;
    title: string;
    prep_time: number;
    ingredients: string[];
    cost: number;
    prep_steps: string;
    difficulty: number;
};

export default function SearchPage() {
    const router = useRouter();
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [maxPrepTime, setMaxPrepTime] = useState('');
    const [maxCost, setMaxCost] = useState('');
    const [dietaryQuery, setDietaryQuery] = useState('');
    const [ingredientQuery, setIngredientQuery] = useState('');
    const [difficulty, setDifficulty] = useState(0); // 0 = any


    {/* Mock recipe data, to be used for testing */ }
    {/* In the future, this should be replaced with an API call to fetch recipes based on the search */ }
    const mockRecipes: Recipe[] = [
        {
            id: "1",
            title: "Chicken Stir Fry",
            prep_time: 20,
            ingredients: ["Chicken breast", "Bell peppers", "Soy sauce", "Garlic", "Rice"],
            cost: 12.5,
            prep_steps: "Slice chicken.\nChop vegetables.\nStir-fry chicken until cooked.\nAdd vegetables and sauce.\nServe over rice.",
            difficulty: 2,
        },
        {
            id: "2",
            title: "Spaghetti Bolognese",
            prep_time: 45,
            ingredients: ["Spaghetti", "Ground beef", "Tomato sauce", "Onion", "Olive oil"],
            cost: 10,
            prep_steps: "Boil spaghetti.\nSauté onion in olive oil.\nAdd ground beef and cook.\nPour in tomato sauce.\nSimmer and serve over pasta.",
            difficulty: 3,
        },
        {
            id: "3",
            title: "Vegetarian Tacos",
            prep_time: 25,
            ingredients: ["Tortillas", "Black beans", "Corn", "Avocado", "Salsa"],
            cost: 8,
            prep_steps: "Warm tortillas.\nHeat beans and corn.\nAssemble fillings in tortillas.\nTop with avocado and salsa.",
            difficulty: 1,
        },
        {
            id: "4",
            title: "Chicken Alfredo",
            prep_time: 30,
            ingredients: ["Chicken", "Fettuccine", "Cream", "Parmesan", "Garlic"],
            cost: 11,
            prep_steps: "Cook pasta.\nGrill chicken.\nPrepare cream sauce with garlic.\nMix pasta with sauce.\nTop with sliced chicken and parmesan.",
            difficulty: 2,
        },
        {
            id: "5",
            title: "Beef Burrito",
            prep_time: 35,
            ingredients: ["Tortillas", "Ground beef", "Rice", "Beans", "Cheese"],
            cost: 9,
            prep_steps: "Cook beef with seasoning.\nWarm tortillas.\nAdd rice, beans, and beef.\nRoll burritos and serve.",
            difficulty: 3,
        },
        {
            id: "6",
            title: "Tofu Stir Fry",
            prep_time: 25,
            ingredients: ["Tofu", "Broccoli", "Carrots", "Soy sauce", "Sesame oil"],
            cost: 7,
            prep_steps: "Cube tofu.\nStir-fry tofu until golden.\nAdd vegetables.\nDrizzle with soy sauce and sesame oil.\nServe hot.",
            difficulty: 1,
        },
        {
            id: "7",
            title: "Salmon Bowl",
            prep_time: 20,
            ingredients: ["Salmon fillet", "Rice", "Avocado", "Cucumber", "Teriyaki sauce"],
            cost: 13,
            prep_steps: "Cook rice.\nPan-sear salmon.\nSlice avocado and cucumber.\nAssemble bowl and drizzle with sauce.",
            difficulty: 2,
        },
        {
            id: "8",
            title: "Pesto Pasta",
            prep_time: 15,
            ingredients: ["Pasta", "Pesto sauce", "Cherry tomatoes", "Parmesan"],
            cost: 6,
            prep_steps: "Boil pasta.\nDrain and mix with pesto.\nAdd tomatoes.\nTop with parmesan and serve.",
            difficulty: 1,
        },
    ];

const normalize = (s: string) => s.trim().toLowerCase();

const filteredRecipes = mockRecipes.filter((r) => {
  if (maxPrepTime !== '') {
    const t = Number(maxPrepTime);
    if (!Number.isNaN(t) && r.prep_time > t) return false;
  }

  if (maxCost !== '') {
    const c = Number(maxCost);
    if (!Number.isNaN(c) && r.cost > c) return false;
  }

  if (difficulty > 0 && r.difficulty > difficulty) return false;

  if (normalize(dietaryQuery) !== '') {
    const q = normalize(dietaryQuery);
    const hay = r.ingredients.map(normalize).join(' ');
    if (!hay.includes(q)) return false;
  }

  if (normalize(ingredientQuery) !== '') {
    const q = normalize(ingredientQuery);
    const hay = r.ingredients.map(normalize).join(' ');
    if (!hay.includes(q)) return false;
  }

  return true;
});

    return (
        <div className="relative w-screen min-h-screen">
    {/* TOP BAR (spans screen) */}
    <div className="absolute top-6 left-6 right-6 z-20">
      <div className={`${layoutStyles.formCard} p-3`}>
        <div className="flex items-end gap-3">
  {/* Max time */}
  <div className="col-span-1 flex flex-col">
    <label className="text-xs text-gray-500">Max time</label>
    <input
      value={maxPrepTime}
      onChange={(e) => setMaxPrepTime(e.target.value)}
      inputMode="numeric"
      placeholder="30"
      className="border rounded-md px-2 py-1 text-sm w-full"
    />
  </div>

  {/* Max price */}
  <div className="col-span-1 flex flex-col">
    <label className="text-xs text-gray-500">Max price</label>
    <input
      value={maxCost}
      onChange={(e) => setMaxCost(e.target.value)}
      inputMode="decimal"
      placeholder="12"
      className="border rounded-md px-2 py-1 text-sm w-full"
    />
  </div>

  {/* Dietary restriction */}
  <div className="col-span-2 flex flex-col">
    <label className="text-xs text-gray-500">Restriction</label>
    <input
      value={dietaryQuery}
      onChange={(e) => setDietaryQuery(e.target.value)}
      placeholder="gluten"
      className="border rounded-md px-2 py-1 text-sm w-full"
    />
  </div>

  {/* Ingredient */}
  <div className="col-span-2 flex flex-col">
    <label className="text-xs text-gray-500">Ingredient</label>
    <input
      value={ingredientQuery}
      onChange={(e) => setIngredientQuery(e.target.value)}
      placeholder="garlic"
      className="border rounded-md px-2 py-1 text-sm w-full"
    />
  </div>

  {/* Difficulty */}
  <div className="col-span-1 flex flex-col">
    <label className="text-xs text-gray-500">Difficulty</label>
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((d) => (
        <button
          key={d}
          type="button"
          onClick={() => setDifficulty(difficulty === d ? 0 : d)}
          className={`px-2 py-1 rounded-md text-sm border ${
            difficulty >= d
              ? "bg-emerald-600 text-white border-emerald-700"
              : "bg-white text-gray-700"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  </div>

  {/* Clear button */}
  <div className="col-span-1 flex flex-col">
    <label className="text-xs text-transparent">.</label>
    <button
      type="button"
      onClick={() => {
        setMaxPrepTime('');
        setMaxCost('');
        setDietaryQuery('');
        setIngredientQuery('');
        setDifficulty(0);
      }}
      className="text-sm border rounded-md px-3 py-1 hover:bg-gray-50 w-full"
    >
      Clear
    </button>
  </div>
</div>
      </div>
    </div>
        <div className={`${layoutStyles.pageContainer} relative`}>

            {/* Search bar */}

            {/* Recipe listing */}
            <div className="absolute top-24 left-6 w-150">
                <div
                    className={`${layoutStyles.formCard} max-h-[65vh] overflow-y-auto`}
                    dir="rtl"   // scrollbar on the left
                >
                    <ul className="space-y-3" dir="ltr">
                        {filteredRecipes.map((recipe) => (

                            <li
                                key={recipe.id}
                                onClick={() => setSelectedRecipe(recipe)}
                                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer shadow-sm"
                            >
                                <h2 className="font-semibold text-lg text-gray-900">{recipe.title}</h2>
                                <p className="text-sm text-gray-600">
                                    Prep: {recipe.prep_time} min • Difficulty: {recipe.difficulty}/5 • Cost: ${recipe.cost}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Recipe details panel */}
            <div className="absolute top-24 right-6 w-[45%]">
                <div className={layoutStyles.formCard}>
                    {!selectedRecipe ? (
                        <p className="text-gray-500 text-center">
                            Select a recipe to view its details.
                        </p>
                    ) : (
                        <>
                            <h2 className="text-3xl font-bold text-center mb-3 text-gray-900">
                                {selectedRecipe.title}
                            </h2>

                            <p className="text-md text-gray-600 mb-4 text-center">
                                Prep: {selectedRecipe.prep_time} min • Difficulty: {selectedRecipe.difficulty}/5 • Cost: ${selectedRecipe.cost}
                            </p>

                            <div className="mb-4">
                                <h3 className="font-semibold text-lg text-gray-900">Ingredients</h3>
                                <ul className="list-disc list-inside text-gray-700">
                                    {selectedRecipe.ingredients.map((ing: string, idx: number) => (

                                        <li key={idx}>{ing}</li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg text-gray-900">Preparation Steps</h3>
                                <p className="text-gray-700 whitespace-pre-line">
                                    {selectedRecipe.prep_steps}
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>


            {/* Lower Navigation Panel */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between">

                {/* Create Recipe Button */}
                <button
                    onClick={() => router.push('/recipe')}
                    className={`${formStyles.button} w-[20%] rounded-none py-8 shadow-lg border-black border-1`}
                >
                    Create Recipe
                </button>

                {/* Profile Button*/}
                <button
                    onClick={() => router.push('/profile_management')}
                    className={`${formStyles.button} w-[20%] rounded-none py-8 shadow-lg border-black border-1`}
                >
                    Profile
                </button>
            </div>

        </div>
    </div>
    );

}