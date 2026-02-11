# Recipe App Development Plan

## Active Development

### 🚧 Phase 12: User Authentication System — IN PROGRESS (2026-02-10)

**Goal:** Implement user authentication with email/password login using Convex Auth, enabling data isolation between users.

**What has been built:**
- ✅ Installed dependencies: `@convex-dev/auth` and `@auth/core@0.37.0`
- ✅ Backend authentication setup:
  - Created `convex/auth.ts` with Password provider
  - Created `convex/http.ts` for auth HTTP routes
  - Updated `convex/schema.ts` to include `authTables`
  - Updated all backend queries/mutations to use `ctx.auth.getUserIdentity()`
  - Removed `userId` from all mutation/query arguments
- ✅ Frontend authentication setup:
  - Created `AuthForm.tsx` component for login/signup
  - Updated `main.tsx` to use `ConvexAuthProvider`
  - Updated `UserContext.tsx` to integrate with Convex Auth
  - Updated `App.tsx` to show AuthForm when not authenticated
  - Added logout button to header
  - Removed `userId` arguments from all frontend query/mutation calls
- ✅ Cleaned up unused imports across all page components

**Key Files Modified:**
- **Backend:** `convex/auth.ts`, `convex/http.ts`, `convex/schema.ts`, `convex/recipes.ts`, `convex/pantry.ts`, `convex/shoppingList.ts`, `convex/mealPlans.ts`, `convex/cooking.ts`
- **Frontend:** `src/main.tsx`, `src/UserContext.tsx`, `src/App.tsx`, `src/components/AuthForm.tsx`

**Next Steps:**
- Verify Convex types regeneration
- Test signup, login, and logout flows
- Verify data isolation between users
- Test session persistence

---

## Completed Phases

### ✅ Phase 11: Single User Mode — COMPLETED (2026-02-10)

**What was built:**
- ✅ Removed user switching functionality
- ✅ Updated `UserContext.tsx` to use hardcoded "shared" user
- ✅ Deleted `UserSwitcher.tsx` component
- ✅ Updated `App.tsx` to remove user switcher from UI
- ✅ Consolidated all data to single shared state

**Key Changes:**
- `src/UserContext.tsx` — Hardcoded to single "shared" user
- `src/App.tsx` — Removed UserSwitcher component
- `src/components/UserSwitcher.tsx` — Deleted

### ✅ Phase 10: Recipe Variations — COMPLETED

**What was built:**
- ✅ **Schema Update:** Added `parentRecipeId` to `recipes` table to link variations to original recipes.
- ✅ **Backend Logic:** Updated `getForUser` query to group variations or filter them appropriately.
- ✅ **Frontend Update:** Modified `RecipesPage.tsx` to separate main recipes from variations.
- ✅ **Creation Flow:** Updated `RecipeDetailPage.tsx` to allow "Swap & Save" - creating a variation based on an existing recipe.

**Key Files:**
- `convex/schema.ts` — Added `parentRecipeId` index
- `convex/recipes.ts` — Updated queries for hierarchy
- `src/pages/RecipesPage.tsx` — UI for displaying variations
- `src/pages/RecipeDetailPage.tsx` — UI for creating variations

### ✅ Phase 9: Shopping List from Plan — COMPLETED (2026-02-10)

**What was built:**
- ✅ **Backend Mutation:** Added `generateFromPlan` to aggregate ingredients from meal plans and subtract pantry stock.
- ✅ **Frontend Integration:** Added "Generate Shopping List" button to `MealPlanPage`.
- ✅ **User Experience:** One-click generation with confirmation and success feedback.

**Key Files:**
- `convex/shoppingList.ts` — Core logic for aggregation.
- `src/pages/MealPlanPage.tsx` — Button placement in header.

**Technical Checkpoint Met:**
Users can instantly populate their shopping list based on the week's meal plan, accounting for what they already have in the pantry.

### ✅ Phase 8: Aesthetic Overhaul & Theming — COMPLETED (2026-02-10)

**What was built:**
- ✅ **Complete Re-design:** Switched from "Night Kitchen" (Dark Mode) to "Fresh Kitchen" (Light Mode) editorial aesthetic.
- ✅ **Dynamic Theme Engine:**
  - Implemented `ThemeContext` for state management.
  - Refactored `index.css` to use CSS variables mapped to Tailwind.
  - Created 7 Distinct Themes (Sunset Spice, Nordic Slate, Lavender Haze, Monochrome, Forest Whisper, Midnight Chef, Citrus Zest).
- ✅ **UI Components:**
  - `ThemeSwitcher` floating menu with color palette previews.
  - Replaced all emojis with **Lucide React** vector icons.
  - Added subtle animated background gradients.
- ✅ **Technical Upgrades:**
  - Migrated to **Tailwind CSS v4**.
  - Removed legacy config files.

**Key Files:**
- `src/index.css` — Central theme definition
- `src/ThemeContext.tsx` — Theme state
- `src/components/ThemeSwitcher.tsx` — UI for switching themes

**Technical Checkpoint Met:**
User can instantly switch between 7 different aesthetic themes. The app persists the choice on reload.

### ✅ Phase 7: Meal Planning — COMPLETED (2026-02-10)

**What was built:**
- ✅ **Backend:** `mealPlans` table, `getWeek` API returning joined recipe data.
- ✅ **Frontend:** Weekly Calendar view with Breakfast/Lunch/Dinner slots.
- ✅ **Interactions:** Add via search modal, remove, click-to-view recipe.

**Key Files:**
- `convex/schema.ts` — Added mealPlans table
- `convex/mealPlans.ts` — CRUD logic
- `src/pages/MealPlanPage.tsx` — Main UI

**Technical Checkpoint Met:**
User can plan a full week of meals and navigate to them.

### ✅ Phase 6: Refinement & Mobile Experience — COMPLETED (2026-02-10)

**What was built:**
- ✅ **Backend:** Added search indexes to `recipes` table, created efficient `search` query.
- ✅ **Frontend (Search):** Instant debounced search bar on Recipes page.
- ✅ **Frontend (Mobile):** Wake Lock for cooking mode, enlarged touch targets, responsive layout.

**Key Files:**
- `convex/schema.ts` — Added searchIndex
- `convex/recipes.ts` — Added search query
- `src/pages/RecipesPage.tsx` — Added search UI
- `src/pages/RecipeDetailPage.tsx` — Added Wake Lock

**Technical Checkpoint Met:**
App is fully functional on mobile devices with search and screen management.

### ✅ Phase 5: Time Tracking & Reality Check — COMPLETED (2026-02-10)

**What was built:**
- ✅ **Backend:** `history` array in recipe schema, `lastCooked` timestamp.
- ✅ **Frontend:** Dedicated cooking timer view, stopwatch display, save real-world cook time.

**Key Files:**
- `convex/schema.ts` — Added history/lastCooked
- `convex/cooking.ts` — Updated mutation
- `src/pages/RecipeDetailPage.tsx` — Full cooking mode UI

**Technical Checkpoint Met:**
Users can time their cooking, save the result, and see their average speed over time.

### ✅ Phase 4: The View & The Cook — COMPLETED (2026-02-10)

**What was built:**
- ✅ **Backend:** `shoppingList` table, `cookRecipe` mutation logic (deduction vs missing).
- ✅ **Frontend:** Pantry checks (Green/Red indicators), Smart Cook Button, Shopping List view.

**Key Files:**
- `convex/schema.ts` — Added shoppingList
- `convex/cooking.ts` — Core cooking logic
- `convex/shoppingList.ts` — List management
- `src/pages/RecipeDetailPage.tsx` — UI for cooking & checks
- `src/pages/ShoppingListPage.tsx` — Shopping list view

**Technical Checkpoint Met:**
Can cook a recipe. If ingredients exist, they are removed from pantry. If not, they go to the shopping list.

### ✅ Phase 3: The Scaling Engine — COMPLETED (2026-02-10)

**What was built:**
- ✅ Servings control on Recipe Detail page (increment/decrement).
- ✅ Real-time ingredient scaling (client-side calculation).
- ✅ Visual indicators for scaled amounts (orange text).

**Key Files:**
- `src/pages/RecipeDetailPage.tsx` — Added servings control and scaling logic

**Technical Checkpoint Met:**
Can adjust servings and see ingredient amounts update in real-time.

### ✅ Phase 2: Recipe Management — COMPLETED (2026-02-10)

**What was built:**
- ✅ **Schema:** `recipes` table with ingredient array.
- ✅ **Backend:** CRUD functions with joins to fetch ingredient details.
- ✅ **Frontend:** Recipe list grid, Add/Edit form with dynamic ingredient picker, Detail page.

**Key Files:**
- `convex/schema.ts` — Added recipes table
- `convex/recipes.ts` — Recipe CRUD operations
- `src/pages/RecipesPage.tsx` — Recipe list
- `src/pages/AddRecipePage.tsx` — Create/edit form

**Technical Checkpoint Met:**
Can create "Fried Rice" recipe with linked ingredients like "Basmati Rice", view details, edit, and delete.

### ✅ Phase 1: The Ingredient Foundation — COMPLETED (2026-02-10)

**What was built:**
- ✅ **Schema:** `ingredients` (master list) and `pantry` (user inventory).
- ✅ **Backend:** CRUD operations, inventory management logic.
- ✅ **Frontend:** Master list UI, Personal pantry UI with inline editing.

**Key Files:**
- `convex/schema.ts`
- `convex/ingredients.ts`
- `convex/pantry.ts`
- `src/pages/IngredientsPage.tsx`
- `src/pages/PantryPage.tsx`

**Technical Checkpoint Met:**
Can add ingredients to master list, add to pantry, and adjust quantities.

### ✅ Phase 0: The Stack Setup — COMPLETED (2026-02-10)

**What was built:**
- ✅ Project scaffolded with Bun, React, Vite, TypeScript.
- ✅ Tailwind CSS 4.1.18 configured.
- ✅ Convex 1.31.7 initialized.
- ✅ User Switcher (since deprecated/removed in Phase 11).
- ✅ App shell and navigation.

**Key Files:**
- `vite.config.ts`
- `src/main.tsx`
- `src/App.tsx`

---

## Future Roadmap (Backlog)

- [ ] **Data Visualization:** Charts for ingredient usage over time.
- [ ] **Sharing:** Share recipes with other users via link (requires deeper auth logic).
- [ ] **Import:** Scrape recipes from URLs.
