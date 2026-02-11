import { BookOpen, Calendar, List, Package } from 'lucide-react'
import type { Id } from '../../convex/_generated/dataModel'

interface HomePageProps {
    onNavigate: (page: string, recipeId?: Id<"recipes">) => void
}

export function HomePage({ onNavigate }: HomePageProps) {
    return (
        <div className="mx-auto max-w-4xl px-6 py-12 text-center">
            <div className="mb-8 animate-slide-up">
                <h1 className="mb-6 font-serif text-5xl font-bold leading-tight text-primary sm:text-7xl">
                    Master Your <br />
                    <span className="text-gradient">Culinary Craft</span>
                </h1>
                <p className="mx-auto max-w-2xl text-lg text-secondary leading-relaxed font-light">
                    Your personal kitchen operating system. Manage ingredients, plan meals, and cook with precision in a distraction-free environment.
                </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 animate-slide-up [animation-delay:200ms]">
                <button
                    onClick={() => onNavigate('recipes')}
                    className="group relative overflow-hidden rounded-full bg-accent px-8 py-4 font-medium text-white shadow-lg shadow-accent/25 transition-all hover:scale-105 hover:shadow-accent/40 active:scale-95 hover:bg-accent-hover"
                >
                    <span className="relative z-10">Browse Recipes</span>
                </button>
                <button
                    onClick={() => onNavigate('meal-plan')}
                    className="group rounded-full border border-gray-200 bg-white px-8 py-4 font-medium text-primary shadow-sm transition-all hover:bg-gray-50 hover:border-gray-300 active:scale-95"
                >
                    Plan My Week
                </button>
            </div>

            <div className="mt-20 grid grid-cols-2 gap-4 sm:grid-cols-4 animate-slide-up [animation-delay:400ms]">
                {[
                    { label: 'Recipes', value: 'Library', icon: BookOpen },
                    { label: 'Pantry', value: 'Stocked', icon: Package },
                    { label: 'Planning', value: 'Weekly', icon: Calendar },
                    { label: 'Lists', value: 'Smart', icon: List },
                ].map((stat, i) => (
                    <div key={i} className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-mint-cream p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 hover:border-accent/20 bg-surface">
                        <div className="mb-4 flex justify-center">
                            <stat.icon className="h-8 w-8 text-gray-400 transition-colors group-hover:text-accent" />
                        </div>
                        <div className="text-sm text-secondary">{stat.label}</div>
                        <div className="font-serif text-xl font-bold text-primary">{stat.value}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}
