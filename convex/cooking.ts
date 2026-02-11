import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Cook a recipe for authenticated user
export const cookRecipe = mutation({
    args: {
        recipeId: v.id("recipes"),
        servings: v.number(),
        duration: v.optional(v.number()), // Duration in minutes
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }
        const userId = identity.subject;
        // Fetch the recipe
        const recipe = await ctx.db.get(args.recipeId);
        if (!recipe) {
            throw new Error("Recipe not found");
        }

        // Update history if duration is provided
        if (args.duration) {
            const historyEntry = {
                date: Date.now(),
                duration: args.duration,
            };

            await ctx.db.patch(args.recipeId, {
                history: [...(recipe.history || []), historyEntry],
                lastCooked: Date.now(),
            });
        } else {
            // Just update last cooked date
            await ctx.db.patch(args.recipeId, {
                lastCooked: Date.now(),
            });
        }

        const results = [];
        let allAvailable = true;

        // Process each ingredient
        for (const recipeIngredient of recipe.ingredients) {
            // Calculate scaled quantity needed
            const scaledQuantity = (recipeIngredient.quantity / recipe.servings) * args.servings;

            // Get current pantry amount
            const pantryItem = await ctx.db
                .query("pantry")
                .withIndex("by_user_and_ingredient", (q) =>
                    q.eq("userId", userId).eq("ingredientId", recipeIngredient.ingredientId)
                )
                .unique();

            const currentAmount = pantryItem?.quantity || 0;

            if (currentAmount >= scaledQuantity) {
                // We have enough - deduct from pantry
                if (pantryItem) {
                    await ctx.db.patch(pantryItem._id, {
                        quantity: currentAmount - scaledQuantity,
                    });
                }
                results.push({
                    ingredientId: recipeIngredient.ingredientId,
                    status: "deducted",
                    needed: scaledQuantity,
                    had: currentAmount,
                });
            } else {
                // Not enough - add deficit to shopping list
                const deficit = scaledQuantity - currentAmount;
                allAvailable = false;

                // Add to shopping list
                const existingShoppingItem = await ctx.db
                    .query("shoppingList")
                    .withIndex("by_user", (q) => q.eq("userId", userId))
                    .filter((q) => q.eq(q.field("ingredientId"), recipeIngredient.ingredientId))
                    .first();

                if (existingShoppingItem) {
                    await ctx.db.patch(existingShoppingItem._id, {
                        quantity: existingShoppingItem.quantity + deficit,
                    });
                } else {
                    await ctx.db.insert("shoppingList", {
                        userId,
                        ingredientId: recipeIngredient.ingredientId,
                        quantity: deficit,
                        addedAt: Date.now(),
                    });
                }

                // Deduct whatever we had
                if (pantryItem && currentAmount > 0) {
                    await ctx.db.patch(pantryItem._id, {
                        quantity: 0,
                    });
                }

                results.push({
                    ingredientId: recipeIngredient.ingredientId,
                    status: "missing",
                    needed: scaledQuantity,
                    had: currentAmount,
                    deficit: deficit,
                });
            }
        }

        return {
            success: allAvailable,
            results,
            message: allAvailable
                ? "Recipe cooked successfully! Pantry updated."
                : "Some ingredients were missing and added to your shopping list.",
        };
    },
});
