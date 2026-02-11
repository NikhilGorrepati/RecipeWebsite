import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get ingredients for authenticated user
export const getAll = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }
        const userId = identity.subject;

        return await ctx.db
            .query("ingredients")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();
    },
});

// Create a new ingredient for authenticated user
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
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }
        const userId = identity.subject;

        const ingredientId = await ctx.db.insert("ingredients", {
            name: args.name,
            defaultUnit: args.defaultUnit,
            userId,
        });
        return ingredientId;
    },
});

// Update an existing ingredient (ownership check)
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
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }
        const ingredient = await ctx.db.get(args.id);
        if (!ingredient || ingredient.userId !== identity.subject) {
            throw new Error("Not authorized");
        }

        await ctx.db.patch(args.id, {
            name: args.name,
            defaultUnit: args.defaultUnit,
        });
    },
});

// Delete an ingredient (ownership check)
export const remove = mutation({
    args: {
        id: v.id("ingredients"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }
        const ingredient = await ctx.db.get(args.id);
        if (!ingredient || ingredient.userId !== identity.subject) {
            throw new Error("Not authorized");
        }

        await ctx.db.delete(args.id);
    },
});
