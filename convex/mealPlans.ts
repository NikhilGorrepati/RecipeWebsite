import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get meal plans for authenticated user's week
export const getWeek = query({
    args: {
        startDate: v.string(), // YYYY-MM-DD
        endDate: v.string(),   // YYYY-MM-DD
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }
        const userId = identity.subject;

        const plans = await ctx.db
            .query("mealPlans")
            .withIndex("by_user_date", (q) =>
                q.eq("userId", userId).gte("date", args.startDate).lte("date", args.endDate)
            )
            .collect();

        // Fetch recipe details for each plan
        const plansWithRecipes = await Promise.all(
            plans.map(async (plan) => {
                const recipe = await ctx.db.get(plan.recipeId);
                return {
                    ...plan,
                    recipe,
                };
            })
        );

        return plansWithRecipes;
    },
});

// Add a meal plan for authenticated user
export const add = mutation({
    args: {
        recipeId: v.id("recipes"),
        date: v.string(),
        mealType: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }
        const userId = identity.subject;

        return await ctx.db.insert("mealPlans", {
            userId,
            recipeId: args.recipeId,
            date: args.date,
            mealType: args.mealType,
        });
    },
});

// Remove a meal plan
export const remove = mutation({
    args: {
        id: v.id("mealPlans"),
    },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
