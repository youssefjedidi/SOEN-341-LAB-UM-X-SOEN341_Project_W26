"use client";

import { useMemo, useState, useTransition } from "react";
import { formStyles, layoutStyles } from "@/lib/styles";
import {
  // getUserCalorieGoals,
  getWeeklyPlanner,
  updateWeeklyPlannerMeal,
} from "./actions";
import { useEffect } from "react";
import { useAuth } from "@/lib/useAuth";
import { supabase } from "@/lib/supabase";
import { getRecipes } from "@/app/recipe/actions";
import type {
  PlannerDayType,
  PlannerMealType,
  Recipe,
  WeeklyPlannerGrid,
} from "@/lib/types";
import { createEmptyPlannerGrid } from "@/lib/weeklyPlanner";

//Meal type slots and days
type MealType = PlannerMealType;
type DayType = PlannerDayType;

const days: DayType[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const meals: MealType[] = ["Breakfast", "Lunch", "Dinner", "Snack"];

//Main planner component
export default function WeeklyPlanner() {
  const { user } = useAuth();
  // const [dailyGoal, setDailyGoal] = useState<number | null>(null);
  // const [weeklyGoal, setWeeklyGoal] = useState<number | null>(null);
  const [planner, setPlanner] = useState<WeeklyPlannerGrid>(
    createEmptyPlannerGrid(),
  );
  const [availableRecipes, setAvailableRecipes] = useState<Recipe[]>([]);
  const [isPlannerLoading, setIsPlannerLoading] = useState(true);
  const [isSaving, startSavingTransition] = useTransition();
  const [infoMessage, setInfoMessage] = useState("");
  const [selectedDay, setSelectedDay] = useState<DayType | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<MealType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const getAccessToken = async () => {
    // Server actions authenticate planner requests with the Supabase access token,
    // so the page fetches the current browser session token before calling them.
    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session?.access_token) {
      return null;
    }

    return data.session.access_token;
  };

  useEffect(() => {
    async function fetchPlannerPageData() {
      if (!user) {
        setPlanner(createEmptyPlannerGrid());
        setAvailableRecipes([]);
        setIsPlannerLoading(false);
        return;
      }

      setIsPlannerLoading(true);
      setErrorMessage("");

      const accessToken = await getAccessToken();

      if (!accessToken) {
        setPlanner(createEmptyPlannerGrid());
        setAvailableRecipes([]);
        setErrorMessage("You must be logged in to load your planner.");
        setIsPlannerLoading(false);
        return;
      }

      const [plannerResult, recipesResult] = await Promise.all([
        getWeeklyPlanner(accessToken),
        getRecipes(),
      ]);

      // if (goalsResult.success) {
      //   setDailyGoal(goalsResult.dailyCalorieGoal);
      //   setWeeklyGoal(goalsResult.weeklyCalorieGoal);
      // }

      if (plannerResult.success && plannerResult.grid) {
        setPlanner(plannerResult.grid);
        setInfoMessage(plannerResult.message);
      } else {
        setPlanner(createEmptyPlannerGrid());
        setErrorMessage(plannerResult.message);
      }

      if (recipesResult.success && recipesResult.recipes) {
        setAvailableRecipes(recipesResult.recipes);
      } else {
        setAvailableRecipes([]);
      }

      setIsPlannerLoading(false);
    }

    fetchPlannerPageData();
  }, [user]);

  const recipeTitleById = useMemo(() => {
    const titles = new Map<string, string>();

    for (const recipe of availableRecipes) {
      titles.set(recipe.id, recipe.title);
    }

    return titles;
  }, [availableRecipes]);

  const usedRecipeIds = useMemo(() => {
    const recipes = new Set<string>();

    // The UI blocks duplicate selections early, while the server action performs
    // the real enforcement before any database write.
    for (const day of days) {
      for (const meal of meals) {
        const recipeId = planner[day][meal].recipeId;
        if (recipeId) {
          recipes.add(recipeId);
        }
      }
    }

    return recipes;
  }, [planner]);

  //Modal control functions
  const openAddModal = (day: DayType, meal: MealType) => {
    setSelectedDay(day);
    setSelectedMeal(meal);
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedDay(null);
    setSelectedMeal(null);
    setErrorMessage("");
    setIsModalOpen(false);
  };

  //Add/remove recipe functions with duplicate prevention
  const handleAddRecipe = (recipe: Recipe) => {
    if (!selectedDay || !selectedMeal) return;
    if (!user) {
      setErrorMessage("You must be logged in to update your planner.");
      return;
    }

    if (usedRecipeIds.has(recipe.id)) {
      setErrorMessage("This recipe has already been added for this week.");
      return;
    }

    setErrorMessage("");

    startSavingTransition(async () => {
      const accessToken = await getAccessToken();

      if (!accessToken) {
        setErrorMessage("You must be logged in to update your planner.");
        return;
      }

      const result = await updateWeeklyPlannerMeal({
        accessToken,
        dayOfWeek: selectedDay,
        mealType: selectedMeal,
        recipeId: recipe.id,
      });

      if (!result.success || !result.grid) {
        setErrorMessage(result.message);
        return;
      }

      setPlanner(result.grid);
      setInfoMessage(result.message);
      closeModal();
    });
  };

  const handleRemoveRecipe = (day: DayType, meal: MealType) => {
    if (!user) {
      setErrorMessage("You must be logged in to update your planner.");
      return;
    }

    startSavingTransition(async () => {
      const accessToken = await getAccessToken();

      if (!accessToken) {
        setErrorMessage("You must be logged in to update your planner.");
        return;
      }

      const result = await updateWeeklyPlannerMeal({
        accessToken,
        dayOfWeek: day,
        mealType: meal,
        recipeId: null,
      });

      if (!result.success || !result.grid) {
        setErrorMessage(result.message);
        return;
      }

      setPlanner(result.grid);
      setInfoMessage(result.message);
    });
  };
  return (
    <div className={layoutStyles.pageContainer}>
      <div className={layoutStyles.contentWrapper}>
        <h1 className={layoutStyles.pageTitle}>Weekly Meal Planner</h1>
        {infoMessage && (
          <div
            className={`${formStyles.statusMessage} ${formStyles.successBox}`}
          >
            {infoMessage}
          </div>
        )}
        {errorMessage && !isModalOpen && (
          <div className={`${formStyles.statusMessage} ${formStyles.errorBox}`}>
            {errorMessage}
          </div>
        )}

        {/* All styling added to /lib/styles.ts */}
        <div className={layoutStyles.sectionSpacing}>
          <div className={layoutStyles.responsiveTableWrapper}>
            <div className={layoutStyles.plannerGrid}>
              <div className={layoutStyles.plannerHeaderCell}>
                <span className="text-xs md:text-sm font-black uppercase tracking-widest text-stone-800">
                  Meal Type
                </span>
              </div>

              {days.map((day) => (
                <div key={day} className={layoutStyles.plannerDayHeaderCell}>
                  <span className="text-xs md:text-sm font-black uppercase tracking-widest text-stone-900">
                    {day}
                  </span>
                </div>
              ))}

              {meals.map((meal) => (
                <div key={meal} className="contents">
                  <div className="border-b-2 border-r-2 border-stone-900 bg-stone-50 p-4 flex items-center justify-center text-center">
                    <span className="text-xs md:text-sm font-black uppercase tracking-widest text-stone-800">
                      {meal}
                    </span>
                  </div>

                  {days.map((day, dayIndex) => {
                    const recipe = planner[day][meal];
                    const isLastRow = meal === meals[meals.length - 1];
                    const isLastColumn = dayIndex === days.length - 1;

                    return (
                      <div
                        key={`${day}-${meal}`}
                        className={[
                          "bg-[#FDFBF7] p-4 min-h-[170px] flex flex-col justify-between gap-4",
                          !isLastRow ? "border-b-2 border-stone-900" : "",
                          !isLastColumn ? "border-r-2 border-stone-900" : "",
                        ].join(" ")}
                      >
                        {/* Meal with remove or add button */}
                        {recipe.recipeId ? (
                          <div className="flex flex-col gap-3">
                            <div className={formStyles.cardListItem}>
                              <p className="text-sm font-black uppercase tracking-wide text-stone-900">
                                {recipe.recipeTitle ??
                                  recipeTitleById.get(recipe.recipeId) ??
                                  "Saved Recipe"}
                              </p>
                              <p className="mt-2 text-xs font-bold text-stone-500">
                                {day} - {meal}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveRecipe(day, meal)}
                              disabled={isSaving}
                              className={formStyles.dangerButton}
                            >
                              {isSaving ? "Saving..." : "Remove"}
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3 h-full justify-center">
                            {/* Extra empty-slot styling because styles.ts does not define placeholder panels */}
                            <div className="border-2 border-dashed border-stone-300 rounded-2xl p-5 bg-stone-50 text-center">
                              <p className="text-xs font-black uppercase tracking-widest text-stone-400">
                                No Recipe Added
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => openAddModal(day, meal)}
                              disabled={isPlannerLoading || isSaving}
                              className={formStyles.button}
                            >
                              Add
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && selectedDay && selectedMeal && (
        <>
          <div className={layoutStyles.modalOverlay} onClick={closeModal} />

          <div className={layoutStyles.modalWrapper}>
            <div
              className={layoutStyles.modalCard}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className={layoutStyles.modalTitle}>Add Recipe</h2>

              <p className={layoutStyles.modalSubtext}>
                {selectedDay} - {selectedMeal}
              </p>

              {errorMessage && (
                <div className={`mt-4 ${formStyles.errorBox}`}>
                  {errorMessage}
                </div>
              )}

              <div className={layoutStyles.modalContent}>
                {availableRecipes.map((recipe) => {
                  const isUsed = usedRecipeIds.has(recipe.id);

                  return (
                    <button
                      key={recipe.id}
                      type="button"
                      onClick={() => handleAddRecipe(recipe)}
                      disabled={isUsed || isSaving}
                      className={`${formStyles.cardListItem} ${
                        isUsed
                          ? "opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-none hover:border-stone-200"
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-black uppercase tracking-wide">
                          {recipe.title}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">
                          {isSaving
                            ? "Saving"
                            : isUsed
                              ? "Already Used"
                              : "Available"}
                        </span>
                      </div>
                    </button>
                  );
                })}
                {availableRecipes.length === 0 && (
                  <div className="border-2 border-dashed border-stone-300 rounded-2xl p-5 bg-stone-50 text-center">
                    <p className="text-xs font-black uppercase tracking-widest text-stone-400">
                      No recipes available yet
                    </p>
                  </div>
                )}
              </div>

              {/* Extra button row because styles.ts does not define modal action layouts */}
              <div className={layoutStyles.modalActions}>
                <button
                  type="button"
                  onClick={closeModal}
                  className={formStyles.secondaryButton}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
