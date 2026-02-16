'use client'

import { useRouter } from "next/navigation";
import { layoutStyles, formStyles } from '@/lib/styles';


export default function SearchPage() {
    const router = useRouter();

    {/* Mock recipe data, to be used to test the search bar later */ }
    {/* In the future, this should be replaced with an API call to fetch recipes based on the search */ }
    const mockRecipes = [
        { id: 1, title: "Chicken Stir Fry", prepTime: 20, ingredients: [], cost: 12.5, prepSteps: "", difficulty: 2 },
        { id: 2, title: "Spaghetti Bolognese", prepTime: 45, ingredients: [], cost: 10, prepSteps: "", difficulty: 3 },
        { id: 3, title: "Vegetarian Tacos", prepTime: 25, ingredients: [], cost: 8, prepSteps: "", difficulty: 1 },

        { id: 4, title: "Chicken Alfredo", prepTime: 30, ingredients: [], cost: 11, prepSteps: "", difficulty: 2 },
        { id: 5, title: "Beef Burrito", prepTime: 35, ingredients: [], cost: 9, prepSteps: "", difficulty: 3 },
        { id: 6, title: "Tofu Stir Fry", prepTime: 25, ingredients: [], cost: 7, prepSteps: "", difficulty: 1 },
        { id: 7, title: "Salmon Bowl", prepTime: 20, ingredients: [], cost: 13, prepSteps: "", difficulty: 2 },
        { id: 8, title: "Pesto Pasta", prepTime: 15, ingredients: [], cost: 6, prepSteps: "", difficulty: 1 },
    ];

    return (
        <div className={`${layoutStyles.pageContainer} relative`}>



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
                                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer shadow-sm"
                            >
                                <h2 className="font-semibold text-lg text-gray-900">{recipe.title}</h2>
                                <p className="text-sm text-gray-600">
                                    Prep: {recipe.prepTime} min • Difficulty: {recipe.difficulty}/5 • Cost: ${recipe.cost}
                                </p>
                            </li>
                        ))}
                    </ul>
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