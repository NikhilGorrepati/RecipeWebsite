import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useUser } from '../UserContext'
import { Plus, Minus, Edit2, Loader2, Package, X } from 'lucide-react'
import type { Id } from '../../convex/_generated/dataModel'

interface PantryItemProps {
    item: {
        _id: Id<"pantry">
        ingredientId: Id<"ingredients">
        quantity: number
        ingredient: {
            name: string
            defaultUnit: string
        } | null
    }
    userId: string
    setPantry: any
    adjustPantry: any
}

function PantryItem({ item, userId, setPantry, adjustPantry }: PantryItemProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [editValue, setEditValue] = useState(item.quantity.toString())

    const handleSave = async () => {
        const newQuantity = parseFloat(editValue)
        if (!isNaN(newQuantity) && newQuantity >= 0) {
            await setPantry({
                userId,
                ingredientId: item.ingredientId,
                quantity: newQuantity,
            })
            setIsEditing(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave()
        } else if (e.key === 'Escape') {
            setEditValue(item.quantity.toString())
            setIsEditing(false)
        }
    }

    const handleAdjust = async (delta: number) => {
        await adjustPantry({
            userId,
            ingredientId: item.ingredientId,
            delta,
        })
    }

    return (
        <div className="group flex items-center justify-between border-b border-gray-100 py-4 transition-all hover:bg-gray-50 hover:pl-4">
            <div className="flex-1">
                <h3 className="font-serif text-lg text-primary">{item.ingredient?.name}</h3>
                {isEditing ? (
                    <div className="mt-1 flex items-center gap-2">
                        <input
                            type="number"
                            step="0.01"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={handleSave}
                            autoFocus
                            className="w-24 rounded border border-accent bg-white px-2 py-1 text-sm text-primary focus:outline-none"
                        />
                        <span className="text-sm text-gray-500">{item.ingredient?.defaultUnit}</span>
                    </div>
                ) : (
                    <button
                        onClick={() => {
                            setIsEditing(true)
                            setEditValue(item.quantity.toString())
                        }}
                        className="group/edit mt-1 flex items-center gap-2 text-sm text-secondary transition-colors hover:text-accent"
                    >
                        <span className="font-mono text-accent/80 font-bold">{item.quantity}</span>
                        {item.ingredient?.defaultUnit}
                        <Edit2 className="h-3 w-3 opacity-0 transition-opacity group-hover/edit:opacity-100" />
                    </button>
                )}
            </div>

            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex items-center rounded-lg bg-white border border-gray-200 p-1 shadow-sm">
                    <button
                        onClick={() => handleAdjust(-1)}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-primary transition-colors"
                        title="-1"
                    >
                        <Minus className="h-4 w-4" />
                    </button>
                    <div className="h-4 w-px bg-gray-200 mx-1"></div>
                    <button
                        onClick={() => handleAdjust(1)}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-primary transition-colors"
                        title="+1"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}


export function PantryPage() {
    const { currentUser } = useUser()
    const pantryItems = useQuery(api.pantry.getForUser, {})
    const allIngredients = useQuery(api.ingredients.getAll)
    const setPantry = useMutation(api.pantry.set)
    const adjustPantry = useMutation(api.pantry.adjust)

    const [selectedIngredientId, setSelectedIngredientId] = useState<Id<"ingredients"> | ''>('')
    const [quantity, setQuantity] = useState('')
    const [isAdding, setIsAdding] = useState(false)

    const handleAddToPantry = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedIngredientId || !quantity) return

        await setPantry({
            ingredientId: selectedIngredientId,
            quantity: parseFloat(quantity),
        })

        setSelectedIngredientId('')
        setQuantity('')
        setIsAdding(false)
    }

    // Get ingredients not already in pantry
    const availableIngredients = allIngredients?.filter(
        (ing) => !pantryItems?.some((item) => item.ingredientId === ing._id)
    )

    return (
        <div className="mx-auto max-w-4xl px-6 py-12 pb-32">
            <div className="mb-12 flex items-end justify-between animate-slide-up">
                <div>
                    <h1 className="font-serif text-5xl font-bold text-primary mb-2">Pantry</h1>
                    <p className="text-secondary font-light">Manage your kitchen inventory.</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-primary transition-all hover:bg-gray-50 hover:border-accent/50 hover:text-accent shadow-sm sm:gap-2 sm:px-6 sm:py-3 sm:text-base"
                >
                    {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {isAdding ? 'Close' : 'Add Item'}
                </button>
            </div>

            {isAdding && availableIngredients && availableIngredients.length > 0 && (
                <div className="mb-12 animate-fade-in">
                    <form
                        onSubmit={handleAddToPantry}
                        className="rounded-3xl border border-accent/20 bg-accent-light/50 p-8 backdrop-blur-sm"
                    >
                        <h2 className="mb-6 font-serif text-2xl text-primary">Stock Up</h2>
                        <div className="grid gap-6 md:grid-cols-[1fr,150px,auto]">
                            <div>
                                <label className="mb-2 block text-xs uppercase tracking-wider text-gray-500">
                                    Ingredient
                                </label>
                                <select
                                    value={selectedIngredientId}
                                    onChange={(e) => setSelectedIngredientId(e.target.value as Id<"ingredients">)}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent shadow-sm"
                                    required
                                >
                                    <option value="">Select item...</option>
                                    {availableIngredients.map((ing) => (
                                        <option key={ing._id} value={ing._id}>
                                            {ing.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-xs uppercase tracking-wider text-gray-500">
                                    Quantity
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent shadow-sm"
                                    required
                                />
                            </div>
                            <div className="flex items-end">
                                <button
                                    type="submit"
                                    className="flex h-[50px] items-center gap-2 rounded-xl bg-accent px-8 font-bold text-white shadow-lg shadow-accent/20 hover:bg-accent-hover"
                                >
                                    <Plus className="h-5 w-5" />
                                    Add
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            <div className="rounded-3xl border border-gray-100 bg-surface p-8 backdrop-blur-sm animate-slide-up [animation-delay:100ms] min-h-[400px]">
                {!pantryItems ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Loader2 className="h-8 w-8 animate-spin mb-4" />
                        Loading inventory...
                    </div>
                ) : pantryItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Package className="mb-6 h-20 w-20 opacity-10 text-primary" />
                        <h3 className="mb-2 font-serif text-2xl text-primary">Pantry is empty</h3>
                        <p className="text-secondary">Start adding items to track what you have.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {pantryItems.map((item) => (
                            <PantryItem
                                key={item._id}
                                item={item}
                                userId={currentUser}
                                setPantry={setPantry}
                                adjustPantry={adjustPantry}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
