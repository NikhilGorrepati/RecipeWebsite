import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
    ...authTables,
    ingredients: defineTable({
        name: v.string(),
        defaultUnit: v.union(
            v.literal("grams"),
            v.literal("ml"),
            v.literal("count"),
            v.literal("tsp"),
            v.literal("tbsp")
        ),
    }).index("by_name", ["name"]),

    pantry: defineTable({
        ingredientId: v.id("ingredients"),
        userId: v.string(),
        quantity: v.number(),
    }).index("by_user_and_ingredient", ["userId", "ingredientId"]),

    recipes: defineTable({
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
        userId: v.string(),
        history: v.optional(v.array(
            v.object({
                date: v.number(),
                duration: v.number(),
            })
        )),
        lastCooked: v.optional(v.number()),
        parentRecipeId: v.optional(v.id("recipes")),
    })
        .index("by_user", ["userId"])
        .index("by_parent", ["parentRecipeId"])
        .searchIndex("search_title", {
            searchField: "title",
            filterFields: ["userId"],
        }),

    shoppingList: defineTable({
        userId: v.string(),
        ingredientId: v.id("ingredients"),
        quantity: v.number(),
        addedAt: v.number(),
    }).index("by_user", ["userId"]),

    mealPlans: defineTable({
        userId: v.string(),
        recipeId: v.id("recipes"),
        date: v.string(), // ISO date string YYYY-MM-DD
        mealType: v.string(), // "breakfast", "lunch", "dinner"
    }).index("by_user_date", ["userId", "date"]),
});
