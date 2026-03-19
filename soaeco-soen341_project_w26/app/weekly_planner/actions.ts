"use server";

// Change this function to fetch real calorie goals 
// Once backend for weekly planner is implemented.
export const getUserCalorieGoals = async (userId: string) => {
    return {
        success: true,
        dailyCalorieGoal: 2000,
        weeklyCalorieGoal: 14000,
    };
};