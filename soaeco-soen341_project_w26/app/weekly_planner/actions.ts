"use server";

import { supabase, supabaseAdmin } from "@/lib/supabase";
import type {
    PlannerDayType,
    PlannerMealType,
    WeeklyPlannerGrid,
} from "@/lib/types";
import {
    applyPlannerUpdate,
    formatPlannerRowsAsGrid,
    getPlannerRowsForUser,
    isValidMealType,
    isValidPlannerDay,
    isUuidLike,
    type WeeklyPlannerRow,
} from "@/lib/weeklyPlanner";


const getAuthenticatedPlannerUser = async (accessToken: string) => {
    if (!accessToken) {
        return {
            success: false as const,
            status: "error" as const,
            message: "Authentication is required.",
        };
    }

    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error || !data.user) {
        return {
            success: false as const,
            status: "error" as const,
            message: "Invalid or expired authentication session.",
        };
    }

    return {
        success: true as const,
        user: data.user,
    };
};

type PlannerActionResult = {
    success: boolean;
    status: "success" | "error";
    message: string;
    grid?: WeeklyPlannerGrid;
    initialized?: boolean;
};

const getPlannerRowsWithAuth = async (accessToken: string) => {
    if (!supabaseAdmin) {
        return {
            success: false as const,
            status: "error" as const,
            message: "Planner service is unavailable.",
        };
    }

    const authResult = await getAuthenticatedPlannerUser(accessToken);

    if (!authResult.success) {
        return authResult;
    }

    // Every planner read goes through the authenticated user so we never trust
    // a client-provided user ID when loading weekly planner data.
    const { data, error } = await getPlannerRowsForUser(supabaseAdmin, authResult.user.id);

    if (error) {
        console.error("Failed to retrieve weekly planner:", error);
        return {
            success: false as const,
            status: "error" as const,
            message: "Unable to retrieve weekly planner data at this time.",
        };
    }

    return {
        success: true as const,
        userId: authResult.user.id,
        rows: (data ?? []) as WeeklyPlannerRow[],
    };
};

export const getWeeklyPlanner = async (
    accessToken: string,
): Promise<PlannerActionResult> => {
    const plannerRowsResult = await getPlannerRowsWithAuth(accessToken);

    if (!plannerRowsResult.success) {
        return plannerRowsResult;
    }

    return {
        success: true,
        status: "success",
        message: "Weekly planner data retrieved successfully.",
        grid: formatPlannerRowsAsGrid(plannerRowsResult.rows),
        initialized: plannerRowsResult.rows.length === 0,
    };
};

const hasDuplicateRecipeAssignment = (
    rows: WeeklyPlannerRow[],
    dayOfWeek: PlannerDayType,
    mealType: PlannerMealType,
    recipeId: string,
) =>
    // Duplicates are allowed only when the recipe stays in the same slot
    // during an edit; assigning it to any other slot in the same week is rejected.
    rows.some(
        (row) =>
            row.recipe_id === recipeId &&
            (row.day_of_week !== dayOfWeek || row.meal_type !== mealType),
    );

const getPlannerOperationMessage = (
    existingSlot: WeeklyPlannerRow | undefined,
    recipeId: string | null,
) => {
    if (!recipeId) {
        return "Weekly planner slot cleared successfully.";
    }

    if (!existingSlot?.recipe_id) {
        return "Weekly planner slot added successfully.";
    }

    return "Weekly planner slot updated successfully.";
};

export const updateWeeklyPlannerMeal = async (input: {
    accessToken: string;
    dayOfWeek: PlannerDayType;
    mealType: PlannerMealType;
    recipeId: string | null;
}): Promise<PlannerActionResult> => {
    if (!isValidPlannerDay(input.dayOfWeek)) {
        return {
            success: false,
            status: "error",
            message: "A valid day of week is required.",
        };
    }

    if (!isValidMealType(input.mealType)) {
        return {
            success: false,
            status: "error",
            message: "A valid meal type is required.",
        };
    }

    if (input.recipeId && !isUuidLike(input.recipeId)) {
        return {
            success: false,
            status: "error",
            message: "Recipe ID must be a valid UUID or null.",
        };
    }

    if (!supabaseAdmin) {
        return {
            success: false,
            status: "error",
            message: "Planner service is unavailable.",
        };
    }

    const plannerRowsResult = await getPlannerRowsWithAuth(input.accessToken);

    if (!plannerRowsResult.success) {
        return plannerRowsResult;
    }

    const existingSlot = plannerRowsResult.rows.find(
        (row) =>
            row.day_of_week === input.dayOfWeek && row.meal_type === input.mealType,
    );

    if (
        input.recipeId &&
        hasDuplicateRecipeAssignment(
            plannerRowsResult.rows,
            input.dayOfWeek,
            input.mealType,
            input.recipeId,
        )
    ) {
        return {
            success: false,
            status: "error",
            message: "This recipe is already assigned to another meal slot this week.",
        };
    }

    if (input.recipeId) {
        // Validate the referenced recipe before writing the planner row so we do
        // not persist planner slots pointing at missing recipes.
        const { data: recipe, error: recipeError } = await supabaseAdmin
            .from("recipes")
            .select("id")
            .eq("id", input.recipeId)
            .maybeSingle();

        if (recipeError) {
            console.error("Failed to validate recipe for weekly planner:", recipeError);
            return {
                success: false,
                status: "error",
                message: "Unable to update the weekly planner at this time.",
            };
        }

        if (!recipe) {
            return {
                success: false,
                status: "error",
                message: "The selected recipe does not exist.",
            };
        }
    }

    const { error } = await applyPlannerUpdate(supabaseAdmin, plannerRowsResult.userId, {
        dayOfWeek: input.dayOfWeek,
        mealType: input.mealType,
        recipeId: input.recipeId,
    });

    if (error) {
        console.error("Failed to update weekly planner:", error);
        return {
            success: false,
            status: "error",
            message: "Unable to update the weekly planner at this time.",
        };
    }

    const plannerResult = await getWeeklyPlanner(input.accessToken);

    if (!plannerResult.success) {
        return plannerResult;
    }

    return {
        ...plannerResult,
        // The response message tells the UI whether this was an add, edit, or clear
        // without forcing the page to infer that from previous local state.
        message: getPlannerOperationMessage(existingSlot, input.recipeId),
    };
};
export const resetWeeklyPlanner = async (
  accessToken: string,
): Promise<PlannerActionResult> => {
  if (!supabaseAdmin) {
    return {
      success: false,
      status: "error",
      message: "Planner service is unavailable.",
    };
  }

  const plannerRowsResult = await getPlannerRowsWithAuth(accessToken);

  if (!plannerRowsResult.success) {
    return plannerRowsResult;
  }

  const userId = plannerRowsResult.userId;

  const { error } = await supabaseAdmin
    .from("weekly_planner")
    .update({ recipe_id: null })
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to reset weekly planner:", error);
    return {
      success: false,
      status: "error",
      message: "Unable to reset weekly planner at this time.",
    };
  }

  const plannerResult = await getWeeklyPlanner(accessToken);

  if (!plannerResult.success) {
    return plannerResult;
  }

  return {
    ...plannerResult,
    message: "Weekly planner reset successfully.",
  };
};