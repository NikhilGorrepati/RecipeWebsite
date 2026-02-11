import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Plus, Trash2, X, Database, Loader2 } from 'lucide-react'

const UNIT_OPTIONS = ['grams', 'ml', 'count', 'tsp', 'tbsp'] as const

export function IngredientsPage() {
    const ingredients = useQuery(api.ingredients.getAll)
    const createIngredient = useMutation(api.ingredients.create)
    const removeIngredient = useMutation(api.ingredients.remove)

    const [name, setName] = useState('')
    const [unit, setUnit] = useState<typeof UNIT_OPTIONS[number]>('grams')
    const [isAdding, setIsAdding] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return

        await createIngredient({ name: name.trim(), defaultUnit: unit })
        setName('')
        setUnit('grams')
        setIsAdding(false)
    }

    const handleDelete = async (id: any) => {
        if (confirm('Are you sure you want to delete this ingredient?')) {
            await removeIngredient({ id })
        }
    }

    return (
        <div className="mx-auto max-w-4xl px-6 py-12 pb-32">
            <div className="mb-12 flex items-end justify-between animate-slide-up">
                <div>
                    <h1 className="font-serif text-5xl font-bold text-primary mb-2">Ingredients</h1>
                    <p className="text-secondary font-light">Global database of items.</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-3 font-medium text-primary transition-all hover:bg-gray-50 hover:border-accent/50 hover:text-accent shadow-sm"
                >
                    {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {isAdding ? 'Close' : 'New Item'}
                </button>
            </div>

            {isAdding && (
                <div className="mb-12 animate-fade-in">
                    <form
                        onSubmit={handleSubmit}
                        className="rounded-3xl border border-accent/20 bg-accent-light/50 p-8 backdrop-blur-sm"
                    >
                        <h2 className="mb-6 font-serif text-2xl text-primary">Define New Ingredient</h2>
                        <div className="grid gap-6 md:grid-cols-[1fr,150px,auto]">
                            <div>
                                <label className="mb-2 block text-xs uppercase tracking-wider text-gray-500">
                                    Ingredient Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Saffron"
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent shadow-sm"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-xs uppercase tracking-wider text-gray-500">
                                    Default Unit
                                </label>
                                <select
                                    value={unit}
                                    onChange={(e) => setUnit(e.target.value as typeof UNIT_OPTIONS[number])}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent shadow-sm"
                                >
                                    {UNIT_OPTIONS.map((u) => (
                                        <option key={u} value={u}>
                                            {u}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-end">
                                <button
                                    type="submit"
                                    className="flex h-[50px] items-center gap-2 rounded-xl bg-accent px-8 font-bold text-white shadow-lg shadow-accent/20 hover:bg-accent-hover"
                                >
                                    <Plus className="h-5 w-5" />
                                    Create
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            <div className="rounded-3xl border border-gray-100 bg-surface p-8 backdrop-blur-sm animate-slide-up [animation-delay:100ms] min-h-[400px]">
                {!ingredients ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Loader2 className="h-8 w-8 animate-spin mb-4" />
                        Loading database...
                    </div>
                ) : ingredients.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Database className="mb-6 h-20 w-20 opacity-10 text-primary" />
                        <h3 className="mb-2 font-serif text-2xl text-primary">Database Empty</h3>
                        <p className="text-secondary">Add basic ingredients to start building recipes.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {ingredients.map((ingredient) => (
                            <div
                                key={ingredient._id}
                                className="group flex items-center justify-between py-4 transition-all hover:pl-4 hover:bg-gray-50"
                            >
                                <div>
                                    <h3 className="font-serif text-lg text-primary group-hover:text-accent transition-colors">{ingredient.name}</h3>
                                    <p className="text-xs uppercase tracking-wider text-gray-500">Base Unit: {ingredient.defaultUnit}</p>
                                </div>
                                <button
                                    onClick={() => handleDelete(ingredient._id)}
                                    className="opacity-0 rounded-lg px-3 py-1 text-sm text-red-500 transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 flex items-center gap-2"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
