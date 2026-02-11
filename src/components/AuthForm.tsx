import { useState } from 'react'
import { useAuthActions } from '@convex-dev/auth/react'
import { ChefHat, Mail, Lock, User } from 'lucide-react'

export function AuthForm() {
    const { signIn } = useAuthActions()
    const [isSignUp, setIsSignUp] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)
        console.log("Attempting sign in...", { isSignUp, email })

        try {
            const result = await signIn('password', {
                email,
                password,
                flow: isSignUp ? 'signUp' : 'signIn',
            })
            console.log("Sign in result:", result)
        } catch (err: any) {
            console.error("Sign in failed:", err)
            setError(err.message || 'Authentication failed. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            {/* Background decorations */}
            <div className="fixed inset-0 pointer-events-none opacity-40 z-0 bg-[radial-gradient(circle_at_50%_0%,var(--color-accent-light),transparent_70%)]"></div>
            <div className="fixed top-0 right-0 p-32 bg-accent/5 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
            <div className="fixed bottom-0 left-0 p-32 bg-accent/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8 animate-slide-up">
                    <div className="inline-flex items-center justify-center h-16 w-16 mb-4 rounded-2xl bg-accent-light border border-accent/10 shadow-lg">
                        <ChefHat className="h-8 w-8 text-accent" />
                    </div>
                    <h1 className="font-serif text-4xl font-bold text-primary mb-2">RecipeApp</h1>
                    <p className="text-secondary">Your personal culinary companion</p>
                </div>

                {/* Auth Card */}
                <div className="rounded-3xl border border-gray-100 bg-surface p-8 shadow-xl animate-slide-up [animation-delay:100ms]">
                    <h2 className="font-serif text-2xl font-bold text-primary mb-6">
                        {isSignUp ? 'Create Account' : 'Welcome Back'}
                    </h2>

                    {error && (
                        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-50 p-4 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        {isSignUp && (
                            <div>
                                <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                                        placeholder="Your name"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full rounded-xl bg-accent py-3 font-bold text-white shadow-lg shadow-accent/25 hover:bg-accent-hover active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isLoading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => {
                                setIsSignUp(!isSignUp)
                                setError('')
                            }}
                            className="text-sm text-secondary hover:text-accent transition-colors"
                        >
                            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                        </button>
                    </div>

                    <div className="mt-8 border-t border-gray-100 pt-6 text-center">
                        <p className="text-xs text-gray-400 mb-2">Having trouble?</p>
                        <button
                            onClick={() => {
                                console.log("Clearing all Convex tokens...");
                                // Clear all convex-related items from local storage
                                const keysToRemove = [];
                                for (let i = 0; i < localStorage.length; i++) {
                                    const key = localStorage.key(i);
                                    if (key && key.includes('convex')) {
                                        keysToRemove.push(key);
                                    }
                                }
                                keysToRemove.forEach(k => localStorage.removeItem(k));
                                console.log("Tokens cleared. Reloading...");
                                window.location.reload();
                            }}
                            type="button"
                            className="text-xs text-red-500 hover:text-red-700 underline"
                        >
                            Reset App & Clear Data
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
