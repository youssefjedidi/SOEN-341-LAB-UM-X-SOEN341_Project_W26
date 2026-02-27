'use client'

import { useRouter } from "next/navigation";
import { layoutStyles, formStyles } from '@/lib/styles';
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Recipe = {
    id: string;
    title: string;
    prep_time: number;
    ingredients: string[];
    cost: number;
    prep_steps: string;
    difficulty: number;
};



// Filter options
const restrictionOptions = ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Nut-Free", "Halal", "Kosher"];
const preferenceOptions = ["Quick & Easy", "Budget-Friendly", "High Protein", "Low Carb", "Spicy", "Kid-Friendly", "Meal Prep"];

// Toggle helper for multi-select
function toggleItem<T>(arr: T[], item: T): T[] {
    return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
}

export default function SearchPage() {
    const router = useRouter();

    // Recipe Listing state
    const [recipes, setRecipes] = useState<Recipe[]>([]);

    // Fetch recipes from Supabase when the page loads
    useEffect(() => {
        async function fetchRecipes() {
            const { data, error } = await supabase
                .from("recipes")
                .select("*");

            if (error) {
                console.error("Error fetching recipes:", error);
                return;
            }

            const formatted: Recipe[] = (data || []).map((r) => ({
                id: r.id,
                title: r.title,
                prep_time: r.prep_time,
                ingredients: r.ingredients,
                cost: r.cost,
                difficulty: r.difficulty,
                prep_steps: r.preparation_steps, // DB column -> your UI field
            }));

            setRecipes(formatted);
        }

        fetchRecipes();
    }, []);

    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

    // input box
    const [searchInput, setSearchInput] = useState("");
    // Filter state
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [filterDifficulty, setFilterDifficulty] = useState(0);
    const [filterMaxCost, setFilterMaxCost] = useState("");
    const [filterMaxTime, setFilterMaxTime] = useState("");
    const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>([]);
    const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
    const [restrictionsOpen, setRestrictionsOpen] = useState(false);
    const [preferencesOpen, setPreferencesOpen] = useState(false);

    const dropdownWrapRef = useRef<HTMLDivElement>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownWrapRef.current && !dropdownWrapRef.current.contains(e.target as Node)) {
                setRestrictionsOpen(false);
                setPreferencesOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Clear all filters
    function clearFilters() {
        setFilterDifficulty(0);
        setFilterMaxCost("");
        setFilterMaxTime("");
        setSelectedRestrictions([]);
        setSelectedPreferences([]);
        // Also clear applied filters
        setAppliedDifficulty(0);
        setAppliedMaxCost("");
        setAppliedMaxTime("");
    }


    //actually used for filtering ( only when clicking Search)
    const [searchTerm, setSearchTerm] = useState("");

    // Applied filter states (only update when clicking Apply)
    const [appliedDifficulty, setAppliedDifficulty] = useState(0);
    const [appliedMaxCost, setAppliedMaxCost] = useState("");
    const [appliedMaxTime, setAppliedMaxTime] = useState("");

    // Apply filters function
    function applyFilters() {
        setAppliedDifficulty(filterDifficulty);
        setAppliedMaxCost(filterMaxCost);
        setAppliedMaxTime(filterMaxTime);
        setFiltersOpen(false);
    }

    // filtering
    const filteredRecipes = recipes.filter((recipe) => {
        // Search term filter
        const q = searchTerm.trim().toLowerCase();
        if (q !== "" && !recipe.title.toLowerCase().includes(q)) return false;

        // Difficulty filter (show recipes at or below selected difficulty)
        if (appliedDifficulty > 0 && recipe.difficulty > appliedDifficulty) return false;

        // Max cost filter
        if (appliedMaxCost !== "" && recipe.cost > parseFloat(appliedMaxCost)) return false;

        // Max time filter
        if (appliedMaxTime !== "" && recipe.prep_time > parseInt(appliedMaxTime)) return false;

        return true;
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

            {/* ================= FILTERS SECTION ================= */}
            <div className="absolute top-6 left-[640px] z-10">
                {/* Toggle Button */}
                <button
                    type="button"
                    onClick={() => setFiltersOpen((prev) => !prev)}
                    className={`px-8 py-4 text-xl font-black rounded-2xl border-2 border-black bg-[#FDFBF7] hover:bg-[#FDFBF7] transition flex items-center gap-2`}
                >
                    <span>Filters</span>
                    <span className={`transition-transform ${filtersOpen ? 'rotate-180' : ''}`}>▾</span>
                </button>

                {/* Filter Panel */}
                {filtersOpen && (
                    <div
                        ref={dropdownWrapRef}
                        className={`${layoutStyles.formCard} !max-w-none mt-4 !p-6`}
                    >
                        <div className="flex flex-wrap gap-4 items-end">

                            {/* Difficulty */}
                            <div className="flex flex-col gap-2 min-w-[220px]">
                                <label className={formStyles.label}>Difficulty</label>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((d) => (
                                            <button
                                                key={d}
                                                type="button"
                                                onClick={() => setFilterDifficulty(filterDifficulty === d ? 0 : d)}
                                                className={`w-8 h-8 rounded-lg border-2 text-sm font-black transition-all ${filterDifficulty >= d
                                                    ? "bg-emerald-500 border-stone-900 text-stone-900 shadow-[2px_2px_0px_#1c1917]"
                                                    : "bg-white border-stone-200 text-stone-400 hover:border-stone-900 hover:text-stone-900"
                                                    }`}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                    <span className="text-stone-500 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                                        {filterDifficulty === 0 ? "Any" : `${filterDifficulty}+`}
                                    </span>
                                </div>
                            </div>

                            {/* Max Cost */}
                            <div className="flex flex-col gap-2 w-[120px]">
                                <label className={formStyles.label}>Max Cost</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold">$</span>
                                    <input
                                        type="number"
                                        value={filterMaxCost}
                                        onChange={(e) => setFilterMaxCost(e.target.value)}
                                        placeholder="Any"
                                        className={`${formStyles.input} !py-2 !pl-7 !pr-3`}
                                    />
                                </div>
                            </div>

                            {/* Max Time */}
                            <div className="flex flex-col gap-2 w-[120px]">
                                <label className={formStyles.label}>Max Time</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={filterMaxTime}
                                        onChange={(e) => setFilterMaxTime(e.target.value)}
                                        placeholder="Any"
                                        className={`${formStyles.input} !py-2 !px-3 !pr-12`}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-bold">min</span>
                                </div>
                            </div>

                            {/* Restrictions Dropdown */}
                            <div className="relative flex flex-col gap-2 min-w-[180px]">
                                <label className={formStyles.label}>Restrictions</label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setRestrictionsOpen((v) => !v);
                                        setPreferencesOpen(false);
                                    }}
                                    className={`${formStyles.input} !py-2 !px-3 flex items-center justify-between cursor-pointer`}
                                >
                                    <span className={selectedRestrictions.length > 0 ? "text-stone-900" : "text-stone-400"}>
                                        {selectedRestrictions.length === 0
                                            ? "Any"
                                            : `${selectedRestrictions.length} selected`}
                                    </span>
                                    <span className={`text-stone-400 transition-transform ${restrictionsOpen ? 'rotate-180' : ''}`}>▾</span>
                                </button>

                                {restrictionsOpen && (
                                    <div className="absolute top-full left-0 mt-2 min-w-[200px] w-max bg-white border-2 border-stone-900 rounded-2xl shadow-[6px_6px_0px_#1c1917] p-3 z-50">
                                        <div className="max-h-48 overflow-auto space-y-1">
                                            {restrictionOptions.map((opt) => (
                                                <label
                                                    key={opt}
                                                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-stone-50 cursor-pointer"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedRestrictions.includes(opt)}
                                                        onChange={() => setSelectedRestrictions((prev) => toggleItem(prev, opt))}
                                                        className="w-4 h-4 accent-emerald-600 rounded"
                                                    />
                                                    <span className="text-sm font-bold text-stone-800">{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                        <div className="pt-2 mt-2 border-t border-stone-200 flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() => setRestrictionsOpen(false)}
                                                className={`${formStyles.secondaryButton} !flex-none !py-1.5 !px-4 !text-[10px] !rounded-xl`}
                                            >
                                                Done
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Preferences Dropdown */}
                            <div className="relative flex flex-col gap-2 min-w-[180px]">
                                <label className={formStyles.label}>Preferences</label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPreferencesOpen((v) => !v);
                                        setRestrictionsOpen(false);
                                    }}
                                    className={`${formStyles.input} !py-2 !px-3 flex items-center justify-between cursor-pointer`}
                                >
                                    <span className={selectedPreferences.length > 0 ? "text-stone-900" : "text-stone-400"}>
                                        {selectedPreferences.length === 0
                                            ? "Any"
                                            : `${selectedPreferences.length} selected`}
                                    </span>
                                    <span className={`text-stone-400 transition-transform ${preferencesOpen ? 'rotate-180' : ''}`}>▾</span>
                                </button>

                                {preferencesOpen && (
                                    <div className="absolute top-full left-0 mt-2 min-w-[200px] w-max bg-white border-2 border-stone-900 rounded-2xl shadow-[6px_6px_0px_#1c1917] p-3 z-50">
                                        <div className="max-h-48 overflow-auto space-y-1">
                                            {preferenceOptions.map((opt) => (
                                                <label
                                                    key={opt}
                                                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-stone-50 cursor-pointer"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedPreferences.includes(opt)}
                                                        onChange={() => setSelectedPreferences((prev) => toggleItem(prev, opt))}
                                                        className="w-4 h-4 accent-emerald-600 rounded"
                                                    />
                                                    <span className="text-sm font-bold text-stone-800">{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                        <div className="pt-2 mt-2 border-t border-stone-200 flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() => setPreferencesOpen(false)}
                                                className={`${formStyles.secondaryButton} !flex-none !py-1.5 !px-4 !text-[10px] !rounded-xl`}
                                            >
                                                Done
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Clear Button */}
                            <div className="flex flex-col gap-2">
                                <label className={`${formStyles.label} invisible`}>Clear</label>
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className={`${formStyles.dangerButton} !flex-none !py-1.5 !px-4`}
                                >
                                    Clear All
                                </button>
                            </div>

                            {/* Apply Button */}
                            <div className="flex flex-col gap-2">
                                <label className={`${formStyles.label} invisible`}>Apply</label>
                                <button
                                    type="button"
                                    onClick={applyFilters}
                                    className={`${formStyles.button} !flex-none !py-1.5 !px-4`}
                                >
                                    Apply Filters
                                </button>
                            </div>

                        </div>
                    </div>
                )}
            </div>
            {/* ================= END FILTERS ================= */}

            {/* Recipe listing */}
            <div className="absolute top-24 left-6 w-150">
                <div
                    className={`${layoutStyles.formCard} max-h-[85vh] overflow-y-auto`}
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

                {/* Create Recipe Button */}
                <div className="w-full flex justify-start mt-4">
                    <button
                        onClick={() => router.push('/recipe')}
                        className={`${formStyles.button} w-full max-w-md rounded-2xl shadow-[8px_8px_0px_#1c1917]`}
                    >
                        + Create Recipe
                    </button>
                </div>
            </div>

            {/* Recipe details panel */}
            <div className="absolute top-24 right-6 w-[45%]">
                <div className={layoutStyles.formCard + " !max-w-none max-h-[85vh] overflow-y-auto"}>
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

        </div>
    );

}