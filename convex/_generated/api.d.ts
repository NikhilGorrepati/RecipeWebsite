/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as cooking from "../cooking.js";
import type * as http from "../http.js";
import type * as ingredients from "../ingredients.js";
import type * as mealPlans from "../mealPlans.js";
import type * as pantry from "../pantry.js";
import type * as recipes from "../recipes.js";
import type * as shoppingList from "../shoppingList.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  cooking: typeof cooking;
  http: typeof http;
  ingredients: typeof ingredients;
  mealPlans: typeof mealPlans;
  pantry: typeof pantry;
  recipes: typeof recipes;
  shoppingList: typeof shoppingList;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
