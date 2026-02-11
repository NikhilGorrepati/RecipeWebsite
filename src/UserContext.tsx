import { createContext, useContext, type ReactNode } from 'react'
import { useConvexAuth } from 'convex/react'

type UserContextType = {
    currentUser: string
    isAuthenticated: boolean
    isLoading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading } = useConvexAuth()

    // Use a placeholder user ID for now - this will be replaced with actual user ID from backend
    const currentUser = isAuthenticated ? "authenticated-user" : "anonymous"

    return (
        <UserContext.Provider value={{ currentUser, isAuthenticated, isLoading }}>
            {children}
        </UserContext.Provider>
    )
}

export function useUser() {
    const context = useContext(UserContext)
    if (!context) {
        throw new Error('useUser must be used within a UserProvider')
    }
    return context
}
