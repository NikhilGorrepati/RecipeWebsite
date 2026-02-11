import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all recipes
export const getAll = query({
    handler: async (ctx) => {
        return await ctx.db.query("recipes").collect();
    },
});

// Get recipes for authenticated user (only main recipes)
export const getForUser = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }
        const userId = identity.subject;

        const recipes = await ctx.db
            .query("recipes")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        // Filter out variations (recipes with a parent)
        return recipes.filter((r) => !r.parentRecipeId);
    },
});

// Get variations of a recipe
export const getVariations = query({
    args: {
        parentId: v.id("recipes"),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("recipes")
            .withIndex("by_parent", (q) => q.eq("parentRecipeId", args.parentId))
            .collect();
    },
});

// Search recipes for authenticated user
export const search = query({
    args: {
        searchTerm: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }
        const userId = identity.subject;

        return await ctx.db
            .query("recipes")
            .withSearchIndex("search_title", (q) =>
                q.search("title", args.searchTerm).eq("userId", userId)
            )
            .collect();
    },
});

// Get a single recipe by ID with ingredient details and parent info
export const getById = query({
    args: {
        id: v.id("recipes"),
    },
    handler: async (ctx, args) => {
        const recipe = await ctx.db.get(args.id);
        if (!recipe) return null;

        // Fetch ingredient details for each ingredient in the recipe
        const ingredientsWithDetails = await Promise.all(
            recipe.ingredients.map(async (ing) => {
                const ingredient = await ctx.db.get(ing.ingredientId);
                return {
                    ...ing,
                    ingredient,
                };
            })
        );

        // Fetch parent recipe if it's a variation
        let parentRecipe = null;
        if (recipe.parentRecipeId) {
            parentRecipe = await ctx.db.get(recipe.parentRecipeId);
        }

        return {
            ...recipe,
            ingredientsWithDetails,
            parentRecipe,
        };
    },
});

// Create a new recipe
export const create = mutation({
    args: {
        title: v.string(),
        description: v.optional(v.string()),
        instructions: v.string(),
        servings: v.number(),
        ingredients: v.array(
            v.object({
                ingredientId: v.id("ingredients"),
                quantity: v.number(),
                unit: v.string(),
            })
        ),
        parentRecipeId: v.optional(v.id("recipes")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }
        const userId = identity.subject;

        const recipeId = await ctx.db.insert("recipes", {
            title: args.title,
            description: args.description,
            instructions: args.instructions,
            servings: args.servings,
            ingredients: args.ingredients,
            userId,
            parentRecipeId: args.parentRecipeId,
        });
        return recipeId;
    },
});

// Update an existing recipe
export const update = mutation({
    args: {
        id: v.id("recipes"),
        title: v.string(),
        description: v.optional(v.string()),
        instructions: v.string(),
        servings: v.number(),
        ingredients: v.array(
            v.object({
                ingredientId: v.id("ingredients"),
                quantity: v.number(),
                unit: v.string(),
            })
        ),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        await ctx.db.patch(id, updates);
    },
});

// Delete a recipe
export const remove = mutation({
    args: {
        id: v.id("recipes"),
    },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
