"use client";

import { useMemo, useState } from "react";
import { formStyles, layoutStyles } from "@/lib/styles";
import { getUserCalorieGoals } from "./actions";
import { useEffect } from "react";
import { useAuth } from "@/lib/useAuth";



//Meal type slots and days
type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snack";
type DayType =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

type PlannerState = {
  [day in DayType]: {
    [meal in MealType]: string | null;
  };
};

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

//Temporary Recipes - to be replaced with database info
const sampleRecipes = [
  "Avocado Toast",
  "Greek Yogurt Bowl",
  "Chicken Caesar Wrap",
  "Tomato Basil Pasta",
  "Grilled Salmon",
  "Veggie Stir Fry",
  "Beef Tacos",
  "Berry Smoothie",
  "Mushroom Omelette",
  "Turkey Sandwich",
  "Lentil Soup",
  "Shrimp Rice Bowl",
];
//Start with empty planner
const createEmptyPlanner = (): PlannerState => ({
  Monday: { Breakfast: null, Lunch: null, Dinner: null, Snack: null },
  Tuesday: { Breakfast: null, Lunch: null, Dinner: null, Snack: null },
  Wednesday: { Breakfast: null, Lunch: null, Dinner: null, Snack: null },
  Thursday: { Breakfast: null, Lunch: null, Dinner: null, Snack: null },
  Friday: { Breakfast: null, Lunch: null, Dinner: null, Snack: null },
  Saturday: { Breakfast: null, Lunch: null, Dinner: null, Snack: null },
  Sunday: { Breakfast: null, Lunch: null, Dinner: null, Snack: null },
});
//Main planner component
export default function WeeklyPlanner() {

  const { user } = useAuth();

  const [dailyGoal, setDailyGoal] = useState<number | null>(null);
  const [weeklyGoal, setWeeklyGoal] = useState<number | null>(null);

  useEffect(() => {
    async function fetchGoals() {
      if (!user) return;

      const result = await getUserCalorieGoals(user.id);

      if (result.success) {
        setDailyGoal(result.dailyCalorieGoal);
        setWeeklyGoal(result.weeklyCalorieGoal);
      }
    }

    fetchGoals();
  }, [user]);

  const [planner, setPlanner] = useState<PlannerState>(createEmptyPlanner());
  const [selectedDay, setSelectedDay] = useState<DayType | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<MealType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const usedRecipes = useMemo(() => {
    const recipes = new Set<string>();

    for (const day of days) {
      for (const meal of meals) {
        const recipe = planner[day][meal];
        if (recipe) {
          recipes.add(recipe);
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
  const handleAddRecipe = (recipeName: string) => {
    if (!selectedDay || !selectedMeal) return;

    if (usedRecipes.has(recipeName)) {
      setErrorMessage("This recipe has already been added for this week.");
      return;
    }

    setPlanner((prev) => ({
      ...prev,
      [selectedDay]: {
        ...prev[selectedDay],
        [selectedMeal]: recipeName,
      },
    }));

    closeModal();
  };

  const handleRemoveRecipe = (day: DayType, meal: MealType) => {
    setPlanner((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [meal]: null,
      },
    }));
  };
  return (
    <div className={layoutStyles.pageContainer}>
      <div className={layoutStyles.contentWrapper}>
        <h1 className={layoutStyles.pageTitle}>Weekly Meal Planner</h1>

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
                <div
                  key={day}
                  className={layoutStyles.plannerDayHeaderCell}
                >
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
                        {recipe ? (
                          <div className="flex flex-col gap-3">
                            <div className={formStyles.cardListItem}>
                              <p className="text-sm font-black uppercase tracking-wide text-stone-900">
                                {recipe}
                              </p>
                              <p className="mt-2 text-xs font-bold text-stone-500">
                                {day} - {meal}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveRecipe(day, meal)}
                              className={formStyles.dangerButton}
                            >
                              Remove
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
          <div
            className={layoutStyles.modalOverlay}
            onClick={closeModal}
          />

          <div className={layoutStyles.modalWrapper}>
            <div
              className={layoutStyles.modalCard}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className={layoutStyles.modalTitle}>
                Add Recipe
              </h2>

              <p className={layoutStyles.modalSubtext}>
                {selectedDay} - {selectedMeal}
              </p>

              {errorMessage && (
                <div className={`mt-4 ${formStyles.errorBox}`}>{errorMessage}</div>
              )}

              <div className={layoutStyles.modalContent}>
                {sampleRecipes.map((recipe) => {
                  const isUsed = usedRecipes.has(recipe);

                  return (
                    <button
                      key={recipe}
                      type="button"
                      onClick={() => handleAddRecipe(recipe)}
                      disabled={isUsed}
                      className={`${formStyles.cardListItem} ${isUsed ? "opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-none hover:border-stone-200" : ""
                        }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-black uppercase tracking-wide">
                          {recipe}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">
                          {isUsed ? "Already Used" : "Available"}
                        </span>
                      </div>
                    </button>
                  );
                })}
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