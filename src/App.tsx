import { useState } from 'react'
import { UserProvider } from './UserContext'

import { HomePage } from './pages/HomePage'
import { IngredientsPage } from './pages/IngredientsPage'
import { PantryPage } from './pages/PantryPage'
import { RecipesPage } from './pages/RecipesPage'
import { AddRecipePage } from './pages/AddRecipePage'
import { RecipeDetailPage } from './pages/RecipeDetailPage'
import { ShoppingListPage } from './pages/ShoppingListPage'
import { MealPlanPage } from './pages/MealPlanPage'
import { ThemeProvider } from './ThemeContext'
import { ThemeSwitcher } from './components/ThemeSwitcher'
import { AuthForm } from './components/AuthForm'
import { BookOpen, Calendar, Carrot, ChefHat, Package, ShoppingCart, LogOut } from 'lucide-react'
import type { Id } from '../convex/_generated/dataModel'
import { useUser } from './UserContext'
import { useAuthActions } from '@convex-dev/auth/react'

type Page = 'home' | 'ingredients' | 'pantry' | 'recipes' | 'add-recipe' | 'edit-recipe' | 'recipe-detail' | 'shopping-list' | 'meal-plan'

function AppContent() {
  const { isAuthenticated, isLoading } = useUser()
  const { signOut } = useAuthActions()
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [selectedRecipeId, setSelectedRecipeId] = useState<Id<"recipes"> | undefined>()
  const [navigationExtra, setNavigationExtra] = useState<any>(null)

  const handleNavigate = (page: string, recipeId?: Id<"recipes">, extra?: any) => {
    setCurrentPage(page as Page)
    setSelectedRecipeId(recipeId)
    setNavigationExtra(extra)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <ChefHat className="h-12 w-12 text-accent animate-bounce mx-auto mb-4" />
          <p className="text-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  // Show auth form if not authenticated
  if (!isAuthenticated) {
    return <AuthForm />
  }

  // Floating Dock Navigation Item
  const NavItem = ({ page, label, icon: Icon }: { page: Page, label: string, icon: any }) => {
    const isActive = currentPage === page
    return (
      <button
        onClick={() => handleNavigate(page)}
        className={`group relative flex flex-col items-center gap-1 p-3 transition-all duration-300 hover:-translate-y-1 ${isActive ? 'text-accent' : 'text-gray-400 hover:text-primary'
          }`}
      >
        <Icon className={`h-6 w-6 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
        <span className="text-[10px] font-medium uppercase tracking-wider opacity-0 transition-opacity group-hover:opacity-100 absolute -bottom-8 whitespace-nowrap bg-white/90 px-2 py-0.5 rounded text-primary border border-red-100 shadow-sm">{label}</span>
        {isActive && (
          <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-accent shadow-[0_0_8px_rgba(217,108,74,0.4)]"></span>
        )}
      </button>
    )
  }

  return (
    <div className="min-h-screen bg-background text-primary font-sans selection:bg-accent/20 selection:text-accent">
      {/* Dynamic Background Noise & Gradient Mesh */}
      <div className="fixed inset-0 pointer-events-none opacity-40 z-0 bg-[radial-gradient(circle_at_50%_0%,var(--color-accent-light),transparent_70%)] transition-colors duration-700"></div>
      <div className="fixed top-0 right-0 p-32 bg-accent/5 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
      <div className="fixed bottom-0 left-0 p-32 bg-accent/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

      {/* Main Content Area */}
      <main className="relative z-10 mx-auto min-h-screen w-full max-w-7xl pb-32 pt-8 sm:px-6 lg:px-8">
        {/* Header / Logo */}
        <header className="mb-12 flex items-center justify-between px-6 sm:px-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleNavigate('home')}
              className="group flex items-center gap-3"
            >
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-accent-light border border-accent/10 shadow-sm transition-all group-hover:bg-accent/10 group-hover:shadow-md">
                <ChefHat className="h-6 w-6 text-accent" />
              </div>
              <div className="flex flex-col items-start bg-white/50 backdrop-blur-sm px-2 py-1 rounded-lg">
                <span className="font-serif text-xl font-bold tracking-tight text-primary group-hover:text-accent transition-colors">RecipeApp</span>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <button
              onClick={() => void signOut()}
              className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-accent transition-all"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </header>

        {/* Page Content with Key Transition */}
        <div key={currentPage} className="animate-fade-in">
          {currentPage === 'home' && <HomePage onNavigate={handleNavigate} />}
          {currentPage === 'recipes' && <RecipesPage onNavigate={handleNavigate} />}
          {currentPage === 'add-recipe' && <AddRecipePage onNavigate={handleNavigate} extra={navigationExtra} />}
          {currentPage === 'edit-recipe' && selectedRecipeId && (
            <AddRecipePage onNavigate={handleNavigate} recipeId={selectedRecipeId} />
          )}
          {currentPage === 'recipe-detail' && selectedRecipeId && (
            <RecipeDetailPage recipeId={selectedRecipeId} onNavigate={handleNavigate} />
          )}
          {currentPage === 'meal-plan' && <MealPlanPage onNavigate={handleNavigate} />}
          {currentPage === 'ingredients' && <IngredientsPage />}
          {currentPage === 'pantry' && <PantryPage />}
          {currentPage === 'shopping-list' && <ShoppingListPage />}
        </div>
      </main>

      {/* Floating Dock Navigation */}
      <nav className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
        <div className="flex items-center gap-2 rounded-2xl border border-red-100 bg-white/80 p-2 shadow-[0_4px_20px_rgba(62,39,35,0.08)] backdrop-blur-xl ring-1 ring-white/50">
          <NavItem page="recipes" label="Recipes" icon={BookOpen} />
          <NavItem page="meal-plan" label="Meal Plan" icon={Calendar} />
          <div className="h-8 w-px bg-red-100/50 mx-1"></div>
          <NavItem page="ingredients" label="Ingredients" icon={Carrot} />
          <NavItem page="pantry" label="Pantry" icon={Package} />
          <NavItem page="shopping-list" label="Shop" icon={ShoppingCart} />
        </div>
      </nav>
    </div>
  )
}

function App() {
  return (
    <UserProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </UserProvider>
  )
}

export default App
