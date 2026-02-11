import { useState, useEffect } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react'
import type { Id } from '../../convex/_generated/dataModel'

interface AddRecipePageProps {
    onNavigate: (page: string) => void
    recipeId?: Id<"recipes">
    extra?: { sourceRecipeId?: Id<"recipes">, isVariation?: boolean }
}

export function AddRecipePage({ onNavigate, recipeId, extra }: AddRecipePageProps) {
    const allIngredients = useQuery(api.ingredients.getAll)

    // Fetch existing recipe if editing, or source recipe if creating variation
    const sourceId = recipeId || extra?.sourceRecipeId
    const sourceRecipe = useQuery(api.recipes.getById, sourceId ? { id: sourceId } : "skip")

    const createRecipe = useMutation(api.recipes.create)
    const updateRecipe = useMutation(api.recipes.update)

    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [servings, setServings] = useState(2)
    const [instructions, setInstructions] = useState('')
    const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>([])

    const [selectedIngredientId, setSelectedIngredientId] = useState<Id<"ingredients"> | ''>('')
    const [quantity, setQuantity] = useState('')

    // Load existing recipe data when editing OR creating variation
    useEffect(() => {
        if (sourceRecipe) {
            if (recipeId) {
                // Editing existing
                setTitle(sourceRecipe.title)
                setDescription(sourceRecipe.description || '')
                setServings(sourceRecipe.servings)
                setInstructions(sourceRecipe.instructions)
                setRecipeIngredients(sourceRecipe.ingredients)
            } else if (extra?.isVariation) {
                // Creating variation
                setTitle(`${sourceRecipe.title} (Variation)`)
                setDescription(`Variation of ${sourceRecipe.title}`)
                setServings(sourceRecipe.servings)
                setInstructions(sourceRecipe.instructions)
                setRecipeIngredients(sourceRecipe.ingredients)
            }
        }
    }, [sourceRecipe, recipeId, extra])

    const handleAddIngredient = () => {
        if (!selectedIngredientId || !quantity) return

        const ingredient = allIngredients?.find((ing) => ing._id === selectedIngredientId)
        if (!ingredient) return

        setRecipeIngredients([
            ...recipeIngredients,
            {
                ingredientId: selectedIngredientId,
                quantity: parseFloat(quantity),
                unit: ingredient.defaultUnit,
                ingredientName: ingredient.name,
            },
        ])

        setSelectedIngredientId('')
        setQuantity('')
    }

    const handleRemoveIngredient = (index: number) => {
        setRecipeIngredients(recipeIngredients.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!title || !instructions || recipeIngredients.length === 0) {
            alert('Please fill in all required fields and add at least one ingredient')
            return
        }

        const ingredientsData = recipeIngredients.map((ing) => ({
            ingredientId: ing.ingredientId,
            quantity: ing.quantity,
            unit: ing.unit,
        }))

        if (recipeId) {
            await updateRecipe({
                id: recipeId,
                title,
                description: description || undefined,
                instructions,
                servings,
                ingredients: ingredientsData,
            })
        } else {
            await createRecipe({
                title,
                description: description || undefined,
                instructions,
                servings,
                ingredients: ingredientsData,
                parentRecipeId: extra?.isVariation && extra?.sourceRecipeId ? extra.sourceRecipeId : undefined,
            })
        }

        onNavigate('recipes')
    }

    return (
        <div className="mx-auto max-w-4xl px-6 py-12 pb-32">
            <div className="mb-12 animate-slide-up">
                <button
                    onClick={() => onNavigate('recipes')}
                    className="group mb-6 flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500 hover:text-accent transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Cancel & Return
                </button>
                <h1 className="font-serif text-5xl font-bold text-primary">
                    {recipeId ? 'Edit Recipe' : 'New Recipe'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-12 animate-slide-up [animation-delay:100ms]">
                {/* Basic Info */}
                <div className="space-y-6">
                    <div>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Recipe Title"
                            className="w-full border-b border-gray-200 bg-transparent px-0 py-4 font-serif text-4xl font-bold text-primary placeholder-gray-300 focus:border-accent focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description or story behind the dish..."
                            rows={2}
                            className="w-full rounded-xl border border-gray-200 bg-surface px-4 py-3 text-lg text-primary placeholder-gray-400 focus:border-accent focus:bg-white focus:outline-none shadow-sm"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-xs uppercase tracking-wider text-gray-500">
                            Servings
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={servings}
                            onChange={(e) => setServings(parseFloat(e.target.value))}
                            className="w-32 rounded-xl border border-gray-200 bg-surface px-4 py-3 text-primary focus:border-accent focus:outline-none shadow-sm"
                            required
                        />
                    </div>
                </div>

                {/* Ingredients */}
                <div>
                    <h2 className="mb-6 font-serif text-2xl text-primary border-b border-gray-100 pb-2">Ingredients</h2>

                    <div className="mb-6 rounded-2xl border border-gray-100 bg-surface p-6 backdrop-blur-sm shadow-sm">
                        <div className="flex flex-col gap-4 md:flex-row">
                            <div className="flex-1">
                                <select
                                    value={selectedIngredientId}
                                    onChange={(e) => setSelectedIngredientId(e.target.value as Id<"ingredients">)}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                                >
                                    <option value="">Select ingredient...</option>
                                    {allIngredients?.map((ing) => (
                                        <option key={ing._id} value={ing._id}>
                                            {ing.name} ({ing.defaultUnit})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-32">
                                <input
                                    type="number"
                                    step="0.01"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    placeholder="Qty"
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleAddIngredient}
                                className="flex items-center gap-2 rounded-xl bg-accent px-6 py-3 font-medium text-white shadow-lg shadow-accent/20 hover:bg-accent-hover"
                            >
                                <Plus className="h-5 w-5" />
                                Add
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {recipeIngredients.length === 0 ? (
                            <p className="py-4 text-center text-sm text-gray-400 italic">No ingredients added yet</p>
                        ) : (
                            recipeIngredients.map((ing, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0"
                                >
                                    <span className="text-lg text-secondary">
                                        <span className="font-bold text-accent">{ing.quantity} {ing.unit}</span> {ing.ingredientName || 'Unknown'}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveIngredient(index)}
                                        className="text-sm text-red-500 hover:text-red-700 hover:underline flex items-center gap-1"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                        Remove
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Instructions */}
                <div>
                    <h2 className="mb-6 font-serif text-2xl text-primary border-b border-gray-100 pb-2">Instructions</h2>
                    <textarea
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        placeholder="1. Wash the rice..."
                        rows={10}
                        className="w-full rounded-2xl border border-gray-200 bg-surface px-6 py-4 text-lg leading-relaxed text-primary placeholder-gray-400 focus:border-accent focus:bg-white focus:outline-none shadow-sm"
                        required
                    />
                </div>

                {/* Submit */}
                <div className="sticky bottom-6 z-20 flex justify-end gap-4 border-t border-gray-200 bg-white/90 p-4 backdrop-blur-xl md:static md:border-0 md:bg-transparent md:p-0">
                    <button
                        type="submit"
                        className="flex items-center gap-2 rounded-full bg-accent px-10 py-4 font-bold text-white shadow-[0_0_20px_rgba(78,141,87,0.3)] hover:bg-accent-hover hover:shadow-[0_0_30px_rgba(78,141,87,0.5)] transition-all"
                    >
                        <Save className="h-5 w-5" />
                        {recipeId ? 'Update Recipe' : 'Save Recipe'}
                    </button>
                </div>
            </form>
        </div>
    )
}
