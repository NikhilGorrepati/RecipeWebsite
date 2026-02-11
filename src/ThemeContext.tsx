import React, { createContext, useContext, useEffect, useState } from 'react'

export type Theme = 'sunset' | 'nordic' | 'lavender' | 'monochrome' | 'forest' | 'midnight' | 'citrus'

interface ThemeContextType {
    theme: Theme
    setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(() => {
        const saved = localStorage.getItem('app-theme')
        return (saved as Theme) || 'sunset'
    })

    useEffect(() => {
        localStorage.setItem('app-theme', theme)
        document.documentElement.setAttribute('data-theme', theme)
    }, [theme])

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme)
    }

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}
