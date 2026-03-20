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
    isUuidLike,
} from "@/lib/weeklyPlanner";

// Change this function to fetch real calorie goals 
// Once backend for weekly planner is implemented.
export const getUserCalorieGoals = async (userId: string) => {
    void userId;

    return {
        success: true,
        dailyCalorieGoal: 2000,
        weeklyCalorieGoal: 14000,
    };
};

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

export const getWeeklyPlanner = async (
    accessToken: string,
): Promise<PlannerActionResult> => {
    if (!supabaseAdmin) {
        return {
            success: false,
            status: "error",
            message: "Planner service is unavailable.",
        };
    }

    const authResult = await getAuthenticatedPlannerUser(accessToken);

    if (!authResult.success) {
        return authResult;
    }

    const userId = authResult.user.id;
    const { data, error } = await getPlannerRowsForUser(supabaseAdmin, userId);

    if (error) {
        console.error("Failed to retrieve weekly planner:", error);
        return {
            success: false,
            status: "error",
            message: "Unable to retrieve weekly planner data at this time.",
        };
    }

    return {
        success: true,
        status: "success",
        message: "Weekly planner data retrieved successfully.",
        grid: formatPlannerRowsAsGrid(data),
        initialized: (data?.length ?? 0) === 0,
    };
};

export const updateWeeklyPlannerMeal = async (input: {
    accessToken: string;
    dayOfWeek: PlannerDayType;
    mealType: PlannerMealType;
    recipeId: string | null;
}): Promise<PlannerActionResult> => {
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

    const authResult = await getAuthenticatedPlannerUser(input.accessToken);

    if (!authResult.success) {
        return authResult;
    }

    const userId = authResult.user.id;

    if (input.recipeId) {
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

    const { error } = await applyPlannerUpdate(supabaseAdmin, userId, {
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
        message: "Weekly planner updated successfully.",
    };
};
