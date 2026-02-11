import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { ShoppingCart, Check, Trash2, Lightbulb, Loader2 } from 'lucide-react'

export function ShoppingListPage() {
    const shoppingList = useQuery(api.shoppingList.getForUser, {})
    const removeItem = useMutation(api.shoppingList.remove)
    const clearAll = useMutation(api.shoppingList.clear)

    const handleRemove = async (id: any) => {
        await removeItem({ id })
    }

    const handleClearAll = async () => {
        if (confirm('Clear all items from shopping list?')) {
            await clearAll({})
        }
    }

    return (
        <div className="mx-auto max-w-4xl px-6 py-12 pb-32">
            <div className="mb-12 flex items-end justify-between animate-slide-up">
                <div>
                    <h1 className="font-serif text-5xl font-bold text-primary mb-2">Shopping List</h1>
                    <p className="text-secondary font-light">Items to buy for upcoming meals.</p>
                </div>
                {shoppingList && shoppingList.length > 0 && (
                    <button
                        onClick={handleClearAll}
                        className="flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-6 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-100"
                    >
                        <Trash2 className="h-4 w-4" />
                        Clear List
                    </button>
                )}
            </div>

            <div className="rounded-3xl border border-gray-100 bg-surface backdrop-blur-sm animate-slide-up [animation-delay:100ms] min-h-[300px]">
                {!shoppingList ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Loader2 className="h-8 w-8 animate-spin mb-4" />
                        Loading list...
                    </div>
                ) : shoppingList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <ShoppingCart className="mb-6 h-20 w-20 opacity-10 text-primary" />
                        <h3 className="mb-2 font-serif text-2xl text-primary">All caught up!</h3>
                        <p className="max-w-md text-secondary">
                            Your list is empty. Ingredients missing from recipes you want to cook will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {shoppingList.map((item) => (
                            <div
                                key={item._id}
                                className="group flex items-center justify-between p-6 transition-all hover:bg-gray-50"
                            >
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => handleRemove(item._id)}
                                        className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-gray-300 text-transparent transition-all hover:border-green-500 hover:bg-green-50 hover:text-green-500"
                                    >
                                        <Check className="h-4 w-4" />
                                    </button>
                                    <div>
                                        <h3 className="font-serif text-xl text-primary decoration-gray-400 group-hover:line-through transition-all">{item.ingredient?.name}</h3>
                                        <p className="font-mono text-xs text-accent font-bold">
                                            {item.quantity} {item.ingredient?.defaultUnit}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRemove(item._id)}
                                    className="opacity-0 text-sm text-gray-400 hover:text-red-500 group-hover:opacity-100 transition-all flex items-center gap-2"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {shoppingList && shoppingList.length > 0 && (
                <div className="mt-8 flex items-center gap-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-700 animate-fade-in shadow-sm">
                    <Lightbulb className="h-6 w-6" />
                    <p className="text-sm">
                        Tip: Once purchased, add these items to your Pantry to track them, then verify they are removed here.
                    </p>
                </div>
            )}
        </div>
    )
}
