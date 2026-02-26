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

    // input box
    const [searchInput, setSearchInput] = useState("");

    //actually used for filtering ( only when clicking Search)
    const [searchTerm, setSearchTerm] = useState("");

    // Mock recipe data, to be used for testing */ }
    //{/* In the future, this should be replaced with an API call to fetch recipes based on the search */ }
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
// filtering
    const filteredRecipes = mockRecipes.filter((recipe) => {
    const q = searchTerm.trim().toLowerCase();
    if (q === "") return true;
    return recipe.title.toLowerCase().includes(q);
});


    //Recipe listing with search bar
    return (
        <div className={`${layoutStyles.pageContainer} relative`}>

{/* SEARCH BAR */}
<div className="absolute top-6 left-6 w-150">
    <div className="flex gap-4 items-center">

        <input
            type="text"
            placeholder="Type recipe name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="
                flex-1
                px-6 py-4
                text-xl
                font-bold
                rounded-2xl
                border-2 border-black
                outline-none
            "
        />

        <button
            type="button"
            onClick={() => {
                setSearchTerm(searchInput);
                setSelectedRecipe(null);
            }}
            className="
                px-8 py-4
                text-xl
                font-black
                rounded-2xl
                border-2 border-black
                bg-emerald-500
                hover:bg-emerald-600
                transition
            "
        >
            SEARCH
        </button>

    </div>
</div>

            <div className="absolute top-24 left-6 w-150">
                <div
                    className={`${layoutStyles.formCard} max-h-[75vh] overflow-y-auto`}
                    dir="rtl"   // scrollbar on the left 
                >

                    <ul className="space-y-3" dir="ltr">
                     {filteredRecipes.map((recipe) => ( // i used filtered recipes instead of mock

                            <li
                                key={recipe.id}
                                onClick={() => setSelectedRecipe(recipe)}
                                className={formStyles.cardListItem}
                            >
                                <h2 className="font-black text-xl mb-1">{recipe.title}</h2>
                                <p className={formStyles.label + " mb-0"}>
                                    ⏱ {recipe.prep_time} min • ⭐ {recipe.difficulty}/5 • 💰 ${recipe.cost}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Recipe details panel */}
            <div className="absolute top-24 right-6 w-[45%]">
                <div className={layoutStyles.formCard + " !max-w-none"}>
                    {!selectedRecipe ? (
                        <p className={formStyles.helperText + " mt-0 normal-case"}>
                            Select a recipe to view its details.
                        </p>
                    ) : (
                        <>
                            <h2 className={layoutStyles.pageTitle + " w-full text-center"}>
                                {selectedRecipe.title}
                            </h2>

                            <p className={formStyles.label + " text-center mb-6"}>
                                ⏱ {selectedRecipe.prep_time}m • ⭐ Level {selectedRecipe.difficulty} • 💰 ${selectedRecipe.cost}
                            </p>

                            <div className="mb-6">
                                <h3 className={formStyles.label}>Ingredients</h3>
                                <ul className="list-disc list-inside text-stone-700 font-bold space-y-1">
                                    {selectedRecipe.ingredients.map((ing: string, idx: number) => (

                                        <li key={idx}>{ing}</li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h3 className={formStyles.label}>Preparation Steps</h3>
                                <p className="text-stone-700 font-bold whitespace-pre-line leading-relaxed">
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