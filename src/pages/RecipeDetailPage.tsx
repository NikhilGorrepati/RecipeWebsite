import { useState, useEffect, useRef } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { ArrowLeft, ChefHat, Clock, Trash2, Edit2, Check, ExternalLink, Calendar, FileText, Minus, Plus, RefreshCw, X } from 'lucide-react'
import type { Id } from '../../convex/_generated/dataModel'

interface RecipeDetailPageProps {
    recipeId: Id<"recipes">
    onNavigate: (page: string, recipeId?: Id<"recipes">, extra?: any) => void
}

function VariationsList({ parentId, currentId, onNavigate }: { parentId: Id<"recipes">, currentId: Id<"recipes">, onNavigate: any }) {
    const variations = useQuery(api.recipes.getVariations, { parentId })
    const parent = useQuery(api.recipes.getById, { id: parentId })

    // We want to show: Parent | Var 1 | Var 2
    // If we are looking at a child, we already have the parentId.
    // If we are looking at the parent, parentId is the current ID.

    if (!variations || !parent) return null

    // Combine parent and variations into a list
    const all = [parent, ...variations]

    if (all.length <= 1) return null

    return (
        <div className="mb-8 flex flex-wrap gap-2">
            {all.map((r) => (
                <button
                    key={r._id}
                    onClick={() => onNavigate('recipe-detail', r._id)}
                    className={`rounded-full px-4 py-1 text-sm font-medium transition-all ${r._id === currentId
                        ? 'bg-accent text-white shadow-md'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                >
                    {r.title.replace(parent.title, '').replace(/^[-( ]+/, '').replace(/[) ]+$/, '') || 'Original'}
                    {/* Heuristic cleanup: remove parent title from variation name for shorter tabs if possible, else show full title */}
                    {/* Actually, let's just show full title for clarity unless it's SUPER long, but user logic creates separate names */}
                    {/* Let's just use the title, simpler. */}
                </button>
            ))}
        </div>
    )
}

export function RecipeDetailPage({ recipeId, onNavigate }: RecipeDetailPageProps) {
    const recipe = useQuery(api.recipes.getById, { id: recipeId })
    const pantryItems = useQuery(api.pantry.getForUser, {})
    const deleteRecipe = useMutation(api.recipes.remove)
    const cookRecipe = useMutation(api.cooking.cookRecipe)

    // State for servings scaling
    const [selectedServings, setSelectedServings] = useState<number | null>(null)
    const [isCooking, setIsCooking] = useState(false)
    const [cookResult, setCookResult] = useState<{ success: boolean; message: string } | null>(null)

    // State for Cooking Mode
    const [isCookingMode, setIsCookingMode] = useState(false)
    const [elapsedTime, setElapsedTime] = useState(0) // in seconds
    const timerRef = useRef<number | null>(null)

    // Use selected servings or default to recipe servings
    const displayServings = selectedServings ?? recipe?.servings ?? 2

    // Timer Logic & Wake Lock
    useEffect(() => {
        let wakeLock: any = null

        const requestWakeLock = async () => {
            try {
                if ('wakeLock' in navigator) {
                    wakeLock = await (navigator as any).wakeLock.request('screen')
                }
            } catch (err) {
                console.error(`${err} - Wake Lock failed`)
            }
        }

        if (isCookingMode) {
            // Start Timer
            timerRef.current = setInterval(() => {
                setElapsedTime((prev) => prev + 1)
            }, 1000)

            // Request Wake Lock
            requestWakeLock()
        } else {
            // Stop Timer
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
            // Release Wake Lock
            if (wakeLock) {
                wakeLock.release()
                wakeLock = null
            }
        }

        // Cleanup
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
            if (wakeLock) {
                wakeLock.release()
            }
        }
    }, [isCookingMode])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const calculateAverageTime = (history: { duration: number }[] | undefined) => {
        if (!history || history.length === 0) return null
        const total = history.reduce((acc, curr) => acc + curr.duration, 0)
        return Math.round(total / history.length)
    }

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this recipe?')) {
            await deleteRecipe({ id: recipeId })
            onNavigate('recipes')
        }
    }

    const handleStartCooking = () => {
        setIsCookingMode(true)
        setElapsedTime(0)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleCancelCooking = () => {
        if (confirm('Stop cooking? Progress will be lost.')) {
            setIsCookingMode(false)
            setElapsedTime(0)
        }
    }

    const handleFinishCooking = async () => {
        setIsCookingMode(false)
        const durationMinutes = Math.ceil(elapsedTime / 60)
        await handleCook(durationMinutes)
    }

    const handleCook = async (duration?: number) => {
        setIsCooking(true)
        setCookResult(null)
        try {
            const result = await cookRecipe({
                recipeId,
                servings: displayServings,
                duration,
            })
            setCookResult({
                success: result.success,
                message: result.message + (duration ? ` (Cooked in ${duration} mins)` : ''),
            })
            // Auto-dismiss success message after 4 seconds
            if (result.success) {
                setTimeout(() => setCookResult(null), 4000)
            }
        } catch (error) {
            setCookResult({
                success: false,
                message: 'Failed to cook recipe. Please try again.',
            })
        } finally {
            setIsCooking(false)
        }
    }

    // Calculate scaled quantity
    const scaleQuantity = (baseQuantity: number, baseServings: number, selectedServings: number) => {
        return (baseQuantity / baseServings) * selectedServings
    }

    // Format number to 2 decimal places, removing trailing zeros
    const formatQuantity = (num: number) => {
        return parseFloat(num.toFixed(2))
    }

    const adjustServings = (delta: number) => {
        const current = selectedServings ?? recipe?.servings ?? 2
        const newValue = Math.max(0.5, current + delta)
        setSelectedServings(newValue)
    }

    const resetServings = () => {
        setSelectedServings(null)
    }

    // Check pantry availability
    const checkPantryAvailability = (ingredientId: Id<"ingredients">, requiredQty: number) => {
        const pantryItem = pantryItems?.find(item => item.ingredientId === ingredientId)
        const available = pantryItem?.quantity || 0
        return {
            available,
            hasEnough: available >= requiredQty,
        }
    }

    if (!recipe) {
        return (
            <div className="mx-auto max-w-4xl px-6 py-8">
                <div className="text-center text-gray-400 animate-pulse flex items-center justify-center gap-2">
                    <ChefHat className="h-6 w-6 animate-bounce" />
                    Loading recipe...
                </div>
            </div>
        )
    }

    const isScaled = selectedServings !== null && selectedServings !== recipe.servings
    const averageTime = calculateAverageTime(recipe.history)

    return (
        <div className="mx-auto max-w-4xl px-4 py-8 pb-32">
            {/* Immersive Header */}
            <div className="mb-12 animate-slide-up">
                <div className="mb-6 flex items-center justify-between">
                    <button
                        onClick={() => onNavigate('recipes')}
                        className="group flex items-center gap-2 text-sm uppercase tracking-widest text-gray-500 hover:text-accent transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 opacity-50 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                        <span className="group-hover:translate-x-1 transition-transform">Back to Library</span>
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onNavigate('edit-recipe', recipeId)}
                            className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-medium uppercase tracking-wider text-gray-500 hover:bg-gray-50 hover:text-accent transition-all"
                        >
                            <Edit2 className="h-3 w-3" />
                            Edit
                        </button>
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 rounded-full border border-red-500/20 bg-red-50 px-4 py-2 text-xs font-medium uppercase tracking-wider text-red-500 hover:bg-red-100 hover:text-red-600 transition-all"
                        >
                            <Trash2 className="h-3 w-3" />
                            Delete
                        </button>
                    </div>
                </div>

                <h1 className="mb-4 font-serif text-5xl font-bold leading-tight text-primary md:text-7xl">
                    {recipe.title}
                </h1>

                {/* Variations Badge/Nav */}
                {recipe.parentRecipeId && recipe.parentRecipe && (
                    <div className="mb-4 flex items-center gap-2 text-sm text-secondary">
                        <span>Variation of:</span>
                        <button
                            onClick={() => onNavigate('recipe-detail', recipe.parentRecipeId)}
                            className="font-bold underline hover:text-accent"
                        >
                            {recipe.parentRecipe.title}
                        </button>
                    </div>
                )}

                <VariationsList parentId={recipe.parentRecipeId || recipe._id} currentId={recipeId} onNavigate={onNavigate} />

                {recipe.description && (
                    <p className="text-xl font-light leading-relaxed text-secondary md:text-2xl">
                        {recipe.description}
                    </p>
                )}

                <div className="mt-8 flex flex-wrap gap-12 border-y border-gray-200 py-6">
                    <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-400">
                            <Calendar className="h-3 w-3" /> History
                        </span>
                        <span className="font-serif text-xl text-primary">
                            {recipe.lastCooked ? new Date(recipe.lastCooked).toLocaleDateString() : 'Never cooked'}
                        </span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-400">
                            <Clock className="h-3 w-3" /> Avg Time
                        </span>
                        <span className="font-serif text-xl text-primary">
                            {averageTime ? `${averageTime} min` : '—'}
                        </span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-400">
                            <FileText className="h-3 w-3" /> Ingredients
                        </span>
                        <span className="font-serif text-xl text-primary">{recipe.ingredients.length} items</span>
                    </div>
                </div>
            </div>

            {/* Cook Result Message */}
            {cookResult && (
                <div className={`mb-8 animate-fade-in rounded-2xl border p-6 ${cookResult.success ? 'border-green-500/30 bg-green-50 text-green-700' : 'border-red-500/30 bg-red-50 text-red-700'}`}>
                    <div className="flex items-center gap-3">
                        {cookResult.success ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                        <p className="font-medium text-lg">{cookResult.message}</p>
                    </div>
                    {!cookResult.success && (
                        <button
                            onClick={() => onNavigate('shopping-list')}
                            className="mt-2 flex items-center gap-2 text-sm underline hover:text-red-600"
                        >
                            View Shopping List <ExternalLink className="h-3 w-3" />
                        </button>
                    )}
                </div>
            )}

            {/* Cooking Mode Overlay - Light High Contrast */}
            {isCookingMode && (
                <div className="fixed inset-0 z-50 flex flex-col bg-white text-primary animate-fade-in">
                    {/* Focus Header */}
                    <div className="flex items-center justify-between border-b border-gray-100 bg-white/95 p-6 backdrop-blur-md">
                        <div>
                            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-accent">
                                <ChefHat className="h-4 w-4" /> Cooking Mode
                            </h2>
                            <p className="text-xs text-gray-400 pl-6">Screen Lock Active • Focus On</p>
                        </div>
                        <div className="font-mono text-4xl font-bold text-accent tabular-nums">
                            {formatTime(elapsedTime)}
                        </div>
                    </div>

                    {/* Scrollable Content for Cooking */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-12">
                        <div className="mx-auto max-w-3xl">
                            <h1 className="mb-12 font-serif text-4xl font-bold text-gray-300">{recipe.title}</h1>

                            <div className="mb-12">
                                <h3 className="mb-6 font-serif text-2xl text-primary">Ingredients</h3>
                                <ul className="space-y-4">
                                    {recipe.ingredientsWithDetails?.map((ing, i) => (
                                        <li key={i} className="flex items-center gap-4 text-xl text-secondary group">
                                            <div className="relative flex items-center justify-center">
                                                <input type="checkbox" className="peer h-6 w-6 appearance-none rounded border border-gray-300 bg-white checked:border-accent checked:bg-accent focus:ring-2 focus:ring-accent/50 transition-all cursor-pointer" />
                                                <Check className="pointer-events-none absolute h-4 w-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                                            </div>
                                            <span className="peer-checked:text-gray-300 peer-checked:line-through transition-colors">
                                                <span className="font-bold text-primary peer-checked:text-gray-300">{formatQuantity(scaleQuantity(ing.quantity, recipe.servings, displayServings))} {ing.unit}</span> {ing.ingredient?.name}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h3 className="mb-6 font-serif text-2xl text-primary">Instructions</h3>
                                <div className="space-y-8 text-2xl leading-relaxed text-secondary font-serif">
                                    {recipe.instructions.split('\n').filter(Boolean).map((step, i) => (
                                        <div key={i} className="flex gap-6">
                                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-accent/20 text-lg font-bold text-accent">
                                                {i + 1}
                                            </span>
                                            <p>{step}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="border-t border-gray-100 bg-white/95 p-6 backdrop-blur-md">
                        <div className="mx-auto flex max-w-3xl justify-between gap-4">
                            <button
                                onClick={handleCancelCooking}
                                className="rounded-full px-8 py-4 font-bold text-gray-400 hover:bg-gray-100 hover:text-primary transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleFinishCooking}
                                className="flex items-center gap-2 rounded-full bg-accent px-8 py-4 font-bold text-white shadow-[0_0_20px_rgba(78,141,87,0.3)] hover:bg-accent-hover hover:shadow-[0_0_30px_rgba(78,141,87,0.5)] transition-all"
                            >
                                <Check className="h-5 w-5" />
                                Finish & Record Time
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Layout Grid for Details */}
            <div className="grid gap-12 lg:grid-cols-[1fr,350px]">
                {/* Main Content: Instructions */}
                <div>
                    <h2 className="mb-6 flex items-center gap-4 font-serif text-3xl text-primary">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-bold text-white font-sans">1</span>
                        Instructions
                    </h2>
                    <div className="prose prose-lg max-w-none font-serif text-secondary leading-relaxed">
                        {recipe.instructions.split('\n').map((line, i) => (
                            line.trim() && <p key={i} className="mb-4">{line}</p>
                        ))}
                    </div>
                </div>

                {/* Sidebar: Ingredients & Tools */}
                <div className="space-y-8">
                    {/* Action Card */}
                    {!isCookingMode && (
                        <div className="rounded-3xl bg-accent p-6 shadow-xl shadow-accent/20">
                            <h3 className="mb-2 font-serif text-xl font-bold text-white">Ready to Cook?</h3>
                            <button
                                onClick={handleStartCooking}
                                className="mb-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-white/20 py-4 text-lg font-bold text-white backdrop-blur-sm transition-all hover:bg-white/30 active:scale-95 border border-white/10"
                            >
                                <ChefHat className="h-5 w-5" />
                                Enter Cooking Mode
                            </button>
                            <button
                                onClick={() => handleCook()}
                                disabled={isCooking}
                                className="w-full text-sm font-medium text-white/80 hover:text-white transition-opacity"
                            >
                                {isCooking ? 'Processing...' : 'Quick Log (No Timer)'}
                            </button>
                        </div>
                    )}

                    {/* Ingredients Card */}
                    <div className="rounded-3xl border border-gray-100 bg-surface p-6 shadow-sm">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="font-serif text-xl font-bold text-primary">Ingredients</h3>

                            {/* Servings Stepper */}
                            <div className="flex items-center gap-2 rounded-full bg-white border border-gray-200 p-1 shadow-sm">
                                <button
                                    onClick={() => adjustServings(-0.5)}
                                    className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors"
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                <span className="text-sm font-bold text-primary w-8 text-center">{displayServings}</span>
                                <button
                                    onClick={() => adjustServings(0.5)}
                                    className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {recipe.ingredientsWithDetails?.map((ing, index) => {
                                const scaledQty = scaleQuantity(ing.quantity, recipe.servings, displayServings)
                                const formattedQty = formatQuantity(scaledQty)
                                const { hasEnough } = checkPantryAvailability(ing.ingredientId, scaledQty)

                                return (
                                    <div
                                        key={index}
                                        className="flex items-start gap-4 border-b border-gray-200/50 pb-4 last:border-0 group/ing"
                                    >
                                        <div className={`mt-1 flex h-4 w-4 items-center justify-center rounded-full ${hasEnough ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                            {hasEnough ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between">
                                                <span className="font-medium text-primary">{ing.ingredient?.name}</span>
                                                <span className="font-mono text-accent font-bold">{formattedQty} <span className="text-xs text-secondary font-sans font-normal">{ing.unit}</span></span>
                                            </div>
                                        </div>
                                        {/* Hover Action to Swap - Placeholder for full visual editor logic.
                                            For now, let's keep it simple: We encourage them to 'Edit' to make a variation.
                                            Actually, let's add a proper "Make Variation" button at the bottom of the card.
                                        */}
                                    </div>
                                )
                            })}
                        </div>

                        <button
                            onClick={() => onNavigate('add-recipe', undefined, {
                                sourceRecipeId: recipe._id,
                                isVariation: true
                            })}
                            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 py-3 text-sm font-medium text-gray-500 hover:border-accent hover:bg-accent/5 hover:text-accent transition-all"
                        >
                            <span className="text-lg">+</span>
                            Create Variation (Substitute Ingredients)
                        </button>

                        {isScaled && (
                            <button
                                onClick={resetServings}
                                className="mt-4 flex w-full items-center justify-center gap-2 text-xs text-gray-400 hover:text-accent transition-colors"
                            >
                                <RefreshCw className="h-3 w-3" />
                                Reset Scaling
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
