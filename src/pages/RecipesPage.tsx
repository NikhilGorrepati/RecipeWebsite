import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { BookOpen, ChefHat, FileText, Search, Users } from 'lucide-react'
import type { Id } from '../../convex/_generated/dataModel'

interface RecipesPageProps {
    onNavigate: (page: string, recipeId?: Id<"recipes">) => void
}

function RecipeCard({ recipe, onNavigate, index }: { recipe: any, onNavigate: any, index: number }) {
    const variations = useQuery(api.recipes.getVariations, { parentId: recipe._id })
    const variationCount = variations ? variations.length : 0

    return (
        <div
            onClick={() => onNavigate('recipe-detail', recipe._id)}
            className="group relative cursor-pointer overflow-hidden rounded-3xl border border-gray-100 bg-surface p-8 transition-all duration-500 hover:-translate-y-2 hover:border-accent/20 hover:shadow-xl hover:shadow-black/5"
            style={{ animationDelay: `${index * 50}ms` }}
        >
            {/* Decorative gradient blob */}
            <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-accent/5 blur-3xl transition-all duration-700 group-hover:bg-accent/10"></div>

            <div className="relative z-10 flex h-full flex-col">
                <div className="flex justify-between items-start mb-3">
                    <h3 className="font-serif text-3xl font-bold leading-tight text-primary transition-colors group-hover:text-accent">
                        {recipe.title}
                    </h3>
                    {variationCount > 0 && (
                        <span className="flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent">
                            {variationCount} Var.
                        </span>
                    )}
                </div>

                {recipe.description && (
                    <p className="mb-6 line-clamp-2 text-sm leading-relaxed text-secondary">
                        {recipe.description}
                    </p>
                )}

                <div className="mt-auto flex items-center justify-between border-t border-gray-200/50 pt-6 text-sm font-medium text-gray-500">
                    <div className="flex gap-4">
                        <span className="flex items-center gap-1.5 transition-colors group-hover:text-accent">
                            <Users className="h-4 w-4" />
                            {recipe.servings}
                        </span>
                        <span className="flex items-center gap-1.5 transition-colors group-hover:text-accent">
                            <FileText className="h-4 w-4" />
                            {recipe.ingredients.length}
                        </span>
                    </div>
                    <span className="text-accent opacity-0 transition-all duration-300 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0">
                        View →
                    </span>
                </div>
            </div>
        </div>
    )
}

export function RecipesPage({ onNavigate }: RecipesPageProps) {
    const [searchTerm, setSearchTerm] = useState('')

    const searchResults = useQuery(api.recipes.search, searchTerm ? { searchTerm } : "skip")
    const allRecipes = useQuery(api.recipes.getForUser, !searchTerm ? {} : "skip")

    const recipes = searchTerm ? searchResults : allRecipes

    return (
        <div className="mx-auto max-w-7xl px-6 py-12">
            <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end animate-slide-up">
                <div>
                    <h1 className="font-serif text-5xl font-bold text-primary mb-2">My Collection</h1>
                    <p className="text-secondary font-light">
                        {recipes ? `${recipes.length} recipes curated` : 'Loading...'}
                    </p>
                </div>
                <button
                    onClick={() => onNavigate('add-recipe')}
                    className="group flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-medium text-white transition-all hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/25 active:scale-95"
                >
                    <span className="text-xl leading-none">+</span>
                    <span>Create Recipe</span>
                </button>
            </div>

            {/* Search Bar - Floating Glass */}
            <div className="sticky top-24 z-30 mb-12 -mx-2 px-2 animate-slide-up [animation-delay:100ms]">
                <div className="relative mx-auto max-w-2xl">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-full border border-gray-200 bg-white/90 py-4 pl-16 pr-6 text-lg text-primary placeholder-gray-400 backdrop-blur-xl transition-all focus:border-accent focus:bg-white focus:outline-none focus:ring-1 focus:ring-accent shadow-lg shadow-black/5"
                    />
                </div>
            </div>

            {!recipes ? (
                <div className="flex h-64 items-center justify-center text-gray-400 animate-pulse gap-2">
                    <ChefHat className="h-6 w-6 animate-bounce" />
                    Loading your culinary library...
                </div>
            ) : recipes.length === 0 ? (
                <div className="mx-auto max-w-md rounded-3xl border border-gray-100 bg-surface p-12 text-center shadow-sm animate-fade-in">
                    <div className="mb-6 flex justify-center opacity-20">
                        <BookOpen className="h-24 w-24 text-primary" />
                    </div>
                    <h3 className="mb-2 font-serif text-2xl text-primary">No recipes found</h3>
                    <p className="mb-8 text-secondary">
                        {searchTerm
                            ? `We couldn't find anything matching "${searchTerm}"`
                            : "Your collection is empty. Start your journey by creating a recipe."
                        }
                    </p>
                    {searchTerm ? (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="text-accent hover:text-accent-hover hover:underline"
                        >
                            Clear search
                        </button>
                    ) : (
                        <button
                            onClick={() => onNavigate('add-recipe')}
                            className="rounded-full bg-accent-light px-8 py-3 text-accent font-medium transition-colors hover:bg-accent/20"
                        >
                            Create First Recipe
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 animate-slide-up [animation-delay:200ms]">
                    {recipes.map((recipe, index) => (
                        <RecipeCard key={recipe._id} recipe={recipe} onNavigate={onNavigate} index={index} />
                    ))}
                </div>
            )}
        </div>
    )
}
