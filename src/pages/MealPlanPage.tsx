import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { ChevronLeft, ChevronRight, Plus, Search, X, Loader2, Utensils } from 'lucide-react'
import type { Id } from '../../convex/_generated/dataModel'
import { DatePicker } from '../components/DatePicker'

interface MealPlanPageProps {
    onNavigate: (page: string, recipeId?: Id<"recipes">) => void
}

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner']

export function MealPlanPage({ onNavigate }: MealPlanPageProps) {
    const [startDate, setStartDate] = useState(() => {
        // Default to next Sunday or today if it's Sunday
        const today = new Date()
        const dayOfWeek = today.getDay()
        const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek
        const nextSunday = new Date(today)
        nextSunday.setDate(today.getDate() + daysUntilSunday)
        nextSunday.setHours(0, 0, 0, 0)
        return nextSunday
    })
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedSlot, setSelectedSlot] = useState<{ date: string, type: string } | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    // Calculate 7-day range from start date
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 6)
    
    const startDateStr = startDate.toISOString().split('T')[0]
    const endDateStr = endDate.toISOString().split('T')[0]

    // Fetch meal plans for the week
    const mealPlans = useQuery(api.mealPlans.getWeek, {
        startDate: startDateStr,
        endDate: endDateStr,
    })

    // Search query for modal
    const searchResults = useQuery(api.recipes.search, searchTerm ? { searchTerm } : "skip")
    const allRecipes = useQuery(api.recipes.getForUser, !searchTerm ? {} : "skip")
    const recipes = searchTerm ? searchResults : allRecipes

    const addMeal = useMutation(api.mealPlans.add)
    const removeMeal = useMutation(api.mealPlans.remove)
    const generateList = useMutatstartDate)
        newDate.setDate(newDate.getDate() - 7)
        setStartDate(newDate)
    }

    const handleNextWeek = () => {
        const newDate = new Date(startDate)
        newDate.setDate(newDate.getDate() + 7)
        setStarateJump = (dateStr: string) => {
        if (!dateStr) return
        const newDate = new Date(dateStr)
        setCurrentDate(newDate)
    }

    const openAddModal = (date: string, type: string) => {
        setSelectedSlot({ date, type })
        setIsModalOpen(true)
        setSearchTerm('')
    }

    const handleSelectRecipe = async (recipeId: Id<"recipes">) => {
        if (selectedSlot) {
            await addMeal({
                recipeId,
                date: selectedSlot.date,
                mealType: selectedSlot.type,
            })
            setIsModalOpen(false)
            setSelectedSlot(null)
        }
    }

    const handleRemoveMeal = async (id: Id<"mealPlans">) => {
        if (confirm('Remove this meal from your plan?')) {
            await removeMeal({ id })
        }
    }

    // Generate array of days for the week
    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start)
        d.setDate(start.getDate() + i)
        return d.toISOString().split('T')[0]
    })
7 days starting from startDate
    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(startDate)
        d.setDate(startDate*/}
            <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end justify-between animate-slide-up">
                <div>
                    <h1 className="font-serif text-5xl font-bold text-primary mb-2">Weekly Menu</h1>
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4 text-secondary">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handlePrevWeek}
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50 hover:text-accent transition-all shadow-sm"
                            >7-Day Menu</h1>
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4 text-secondary">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handlePrevWeek}
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50 hover:text-accent transition-all shadow-sm"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <span className="font-mono text-lg tracking-wider">
                                {startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toUpperCase()} — {endDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toUpperCase()}
                            </span>
                            <button
                                onClick={handleNextWeek}
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50 hover:text-accent transition-all shadow-sm"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium uppercase tracking-wider text-gray-400">Start Date:</span>
                            <DatePicker value={startDate} onChange={setStartDate}(confirm('Generate shopping list from this week\'s meals? This will add missing ingredients to your list.')) {
                            await generateList({
                                startDate: startDateStr,
                                endDate: endDateStr,
                            })
                            alert('Shopping list updated!')
                        }
                    }}
                    className="flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-medium text-white shadow-lg shadow-accent/20 transition-all hover:bg-accent-hover hover:shadow-xl hover:-translate-y-0.5"
                >
                    <Utensils className="h-5 w-5" />
                    Generate Shopping List
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid gap-6 md:grid-cols-7 animate-slide-up [animation-delay:100ms]">
                {weekDays.map((dateStr, index) => {
                    const date = new Date(dateStr)
                    const isToday = new Date().toISOString().split('T')[0] === dateStr
                    const dayPlans = mealPlans?.filter(p => p.date === dateStr)

                    return (
                        <div
                            key={dateStr}
                            className={`flex flex-col gap-4 rounded-3xl border p-4 transition-all duration-300 ${isToday ? 'border-accent/50 bg-accent-light ring-1 ring-accent/20' : 'border-gray-100 bg-surface hover:border-accent/30 hover:shadow-lg'}`}
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className="text-center border-b border-gray-200 pb-4">
                                <div className="text-xs font-bold uppercase tracking-widest text-gray-400">{date.toLocaleDateString(undefined, { weekday: 'short' })}</div>
                                <div className={`font-serif text-2xl ${isToday ? 'text-accent' : 'text-primary'}`}>{date.getDate()}</div>
                            </div>

                            <div className="flex flex-col gap-4 flex-1">
                                {MEAL_TYPES.map(type => {
                                    const plan = dayPlans?.find(p => p.mealType === type)
                                    return (
                                        <div key={type} className="flex flex-col gap-2 min-h-[80px]">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 pl-1">{type}</span>
                                            {plan ? (
                                                <div className="group relative flex-1 rounded-2xl bg-white p-3 transition-all hover:bg-white hover:shadow-md border border-gray-100 hover:border-accent/20">
                                                    <div
                                                        onClick={() => onNavigate('recipe-detail', plan.recipeId)}
                                                        className="cursor-pointer"
                                                    >
                                                        <div className="font-serif font-bold text-primary line-clamp-2 leading-tight group-hover:text-accent transition-colors">
                                                            {plan.recipe?.title || 'Loading...'}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveMeal(plan._id as Id<"mealPlans">)}
                                                        className="absolute -right-2 -top-2 flex h-6 w-6 scale-0 items-center justify-center rounded-full bg-red-100 text-red-500 shadow-sm transition-transform group-hover:scale-100 hover:bg-red-200"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => openAddModal(dateStr, type)}
                                                    className="flex-1 flex items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-transparent p-2 text-gray-300 transition-all hover:border-accent/40 hover:bg-accent/5 hover:text-accent"
                                                >
                                                    <Plus className="h-5 w-5" />
                                                </button>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Add Meal Modal - Glassmorphism Light */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="w-full max-w-2xl rounded-3xl border border-white/50 bg-white/90 p-8 shadow-2xl animate-scale-in backdrop-blur-xl">
                        <div className="mb-8 flex items-center justify-between">
                            <div>
                                <h2 className="font-serif text-3xl font-bold text-primary">Add Meal</h2>
                                <p className="text-secondary">Planning for <span className="text-accent font-bold">{selectedSlot?.type}</span></p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-primary transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="relative mb-6">
                            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search your recipes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-2xl border border-gray-200 bg-white py-4 pl-12 pr-4 text-lg text-primary placeholder-gray-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                                autoFocus
                            />
                        </div>

                        <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {recipes?.map(recipe => (
                                <button
                                    key={recipe._id}
                                    onClick={() => handleSelectRecipe(recipe._id)}
                                    className="group flex w-full items-center justify-between rounded-xl border border-transparent hover:border-accent/20 bg-gray-50 p-4 text-left transition-all hover:bg-accent-light"
                                >
                                    <span className="font-serif text-lg font-medium text-primary">{recipe.title}</span>
                                    <span className="flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs uppercase tracking-wider text-gray-500 group-hover:text-accent transition-all shadow-sm">
                                        Select <Plus className="h-3 w-3" />
                                    </span>
                                </button>
                            ))}
                            {recipes === undefined && (
                                <div className="py-12 text-center text-gray-400 flex items-center justify-center gap-2">
                                    <Loader2 className="h-5 w-5 animate-spin" /> Loading
                                </div>
                            )}
                            {recipes?.length === 0 && (
                                <div className="py-12 text-center text-gray-400">
                                    <Utensils className="mx-auto h-12 w-12 opacity-20 mb-2" />
                                    No recipes found matching your search.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
