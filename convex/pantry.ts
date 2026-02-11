import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get pantry items for authenticated user
export const getForUser = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }
        const userId = identity.subject;

        const pantryItems = await ctx.db
            .query("pantry")
            .withIndex("by_user_and_ingredient", (q) => q.eq("userId", userId))
            .collect();

        // Join with ingredient details
        const itemsWithIngredients = await Promise.all(
            pantryItems.map(async (item) => {
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

// Set pantry quantity (create or update) for authenticated user
export const set = mutation({
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
            .query("pantry")
            .withIndex("by_user_and_ingredient", (q) =>
                q.eq("userId", userId).eq("ingredientId", args.ingredientId)
            )
            .unique();

        if (existing) {
            // Update existing
            await ctx.db.patch(existing._id, { quantity: args.quantity });
            return existing._id;
        } else {
            // Create new
            const id = await ctx.db.insert("pantry", {
                userId,
                ingredientId: args.ingredientId,
                quantity: args.quantity,
            });
            return id;
        }
    },
});

// Adjust pantry quantity by a delta for authenticated user
export const adjust = mutation({
    args: {
        ingredientId: v.id("ingredients"),
        delta: v.number(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }
        const userId = identity.subject;

        const existing = await ctx.db
            .query("pantry")
            .withIndex("by_user_and_ingredient", (q) =>
                q.eq("userId", userId).eq("ingredientId", args.ingredientId)
            )
            .unique();

        if (existing) {
            const newQuantity = Math.max(0, existing.quantity + args.delta);
            await ctx.db.patch(existing._id, { quantity: newQuantity });
            return existing._id;
        } else {
            // Create new if delta is positive
            if (args.delta > 0) {
                const id = await ctx.db.insert("pantry", {
                    userId,
                    ingredientId: args.ingredientId,
                    quantity: args.delta,
                });
                return id;
            }
            return null;
        }
    },
});
