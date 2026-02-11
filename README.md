# Recipe Website

A modern recipe management app built with React, TypeScript, Vite, and Convex. Manage recipes, pantry inventory, meal plans, and shopping lists with a polished, themeable UI.

## Features

- Recipes with ingredients, servings scaling, and cooking history
- Pantry inventory and ingredient master list
- Weekly meal planning with fast recipe lookup
- Smart cooking flow that deducts pantry items or adds missing items to the shopping list
- Shopping list generation from meal plans
- Multiple visual themes with persistent selection
- Email/password authentication with Convex Auth (in progress)

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS v4
- Convex (database, queries/mutations, auth)

## Getting Started

1. Install dependencies:
   - npm install
   - bun install
2. Start Convex:
   - npx convex dev
3. Start the frontend:
   - npm run dev

## Project Structure

- convex/ — backend schema, queries, mutations, auth
- src/ — React app
- src/pages/ — main screens
- src/components/ — reusable UI components

## Status

Active development is tracked in [Agents.md](Agents.md).
