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



    return (
        <div className={`${layoutStyles.pageContainer} relative`}>

            {/* Search bar */}

            {/* Recipe listing */}
            <div className="absolute top-24 left-6 w-150">
                <div
                    className={`${layoutStyles.formCard} max-h-[75vh] overflow-y-auto`}
                    dir="rtl"   // scrollbar on the left
                >
                    <ul className="space-y-3" dir="ltr">
                        {mockRecipes.map((recipe) => (

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
    );

}