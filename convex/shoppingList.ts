import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get shopping list for authenticated user
export const getForUser = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }
        const userId = identity.subject;

        const items = await ctx.db
            .query("shoppingList")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        // Join with ingredient details
        const itemsWithIngredients = await Promise.all(
            items.map(async (item) => {
                const ingredient = await ctx.db.get(item.ingredientId);
                return {
                    ...item,
                    ingredient,
                };
            })
        );

        return itemsWithIngredients;
    },
});

// Add item to shopping list for authenticated user
export const add = mutation({
    args: {
        ingredientId: v.id("ingredients"),
        quantity: v.number(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }
        const userId = identity.subject;

        // Check if item already exists
        const existing = await ctx.db
            .query("shoppingList")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .filter((q) => q.eq(q.field("ingredientId"), args.ingredientId))
            .first();

        if (existing) {
            // Increase quantity
            await ctx.db.patch(existing._id, {
                quantity: existing.quantity + args.quantity,
            });
            return existing._id;
        } else {
            // Create new
            const id = await ctx.db.insert("shoppingList", {
                userId,
                ingredientId: args.ingredientId,
                quantity: args.quantity,
                addedAt: Date.now(),
            });
            return id;
        }
    },
});

// Remove item from shopping list (ownership check)
export const remove = mutation({
    args: {
        id: v.id("shoppingList"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }
        const item = await ctx.db.get(args.id);
        if (!item || item.userId !== identity.subject) {
            throw new Error("Not authorized");
        }

        await ctx.db.delete(args.id);
    },
});

// Clear all items for authenticated user
export const clear = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }
        const userId = identity.subject;

        const items = await ctx.db
            .query("shoppingList")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        await Promise.all(items.map((item) => ctx.db.delete(item._id)));
    },
});

// Generate shopping list from meal plan for authenticated user
export const generateFromPlan = mutation({
    args: {
        startDate: v.string(),
        endDate: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }
        const userId = identity.subject;
        // 1. Get all meal plans for the date range
        const plans = await ctx.db
            .query("mealPlans")
            .withIndex("by_user_date", (q) =>
                q.eq("userId", userId).gte("date", args.startDate).lte("date", args.endDate)
            )
            .collect();

        // 2. Calculate total required ingredients
        const requiredIngredients = new Map<string, number>(); // ingredientId -> quantity

        for (const plan of plans) {
            const recipe = await ctx.db.get(plan.recipeId);
            if (!recipe) continue;

            for (const ingredient of recipe.ingredients) {
                const current = requiredIngredients.get(ingredient.ingredientId) || 0;
                requiredIngredients.set(ingredient.ingredientId, current + ingredient.quantity);
            }
        }

        // 3. Process each required ingredient against pantry
        for (const [ingredientId, requiredAmount] of requiredIngredients) {
            // Check pantry
            const pantryItem = await ctx.db
                .query("pantry")
                .withIndex("by_user_and_ingredient", (q) =>
                    q.eq("userId", userId).eq("ingredientId", ingredientId as any)
                )
                .first();

            const pantryAmount = pantryItem ? pantryItem.quantity : 0;
            const missingAmount = requiredAmount - pantryAmount;

            if (missingAmount > 0) {
                // Check if already in shopping list
                const shoppingItem = await ctx.db
                    .query("shoppingList")
                    .withIndex("by_user", (q) => q.eq("userId", userId))
                    .filter((q) => q.eq(q.field("ingredientId"), ingredientId))
                    .first();

                if (shoppingItem) {
                    // Update existing item to ensure we have at least the missing amount
                    // Strategy: If current list amount < missing amount, update to missing amount.
                    // OR: Just add to it? "Generate" implies ensuring we have enough for the plan.
                    // Let's go with: Ensure the list has *at least* the deficit.
                    if (shoppingItem.quantity < missingAmount) {
                        await ctx.db.patch(shoppingItem._id, {
                            quantity: missingAmount,
                        });
                    }
                } else {
                    // Add new item
                    await ctx.db.insert("shoppingList", {
                        userId,
                        ingredientId: ingredientId as any,
                        quantity: missingAmount,
                        addedAt: Date.now(),
                    });
                }
            }
        }
    },
});
