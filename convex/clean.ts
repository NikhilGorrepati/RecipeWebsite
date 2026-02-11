import { mutation } from "./_generated/server";

export const all = mutation({
    args: {},
    handler: async (ctx) => {
        const tables = ["recipes", "ingredients", "pantry", "shoppingList", "mealPlans", "authAccounts", "authSessions", "authRefreshTokens", "authVerificationCodes", "authVerifiers", "authRateLimits", "users"];
        let count = 0;

        for (const table of tables) {
            const docs = await ctx.db.query(table as any).collect();
            for (const doc of docs) {
                await ctx.db.delete(doc._id);
                count++;
            }
        }

        return `Deleted ${count} records across ${tables.join(", ")}`;
    },
});
