import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all ingredients
export const getAll = query({
    handler: async (ctx) => {
        return await ctx.db.query("ingredients").collect();
    },
});

// Create a new ingredient
export const create = mutation({
    args: {
        name: v.string(),
        defaultUnit: v.union(
            v.literal("grams"),
            v.literal("ml"),
            v.literal("count"),
            v.literal("tsp"),
            v.literal("tbsp")
        ),
    },
    handler: async (ctx, args) => {
        const ingredientId = await ctx.db.insert("ingredients", {
            name: args.name,
            defaultUnit: args.defaultUnit,
        });
        return ingredientId;
    },
});

// Update an existing ingredient
export const update = mutation({
    args: {
        id: v.id("ingredients"),
        name: v.string(),
        defaultUnit: v.union(
            v.literal("grams"),
            v.literal("ml"),
            v.literal("count"),
            v.literal("tsp"),
            v.literal("tbsp")
        ),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            name: args.name,
            defaultUnit: args.defaultUnit,
        });
    },
});

// Delete an ingredient
export const remove = mutation({
    args: {
        id: v.id("ingredients"),
    },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
