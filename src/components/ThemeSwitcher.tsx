import { Palette } from 'lucide-react'
import { useState } from 'react'
import { useTheme } from '../ThemeContext'
import type { Theme } from '../ThemeContext'

const THEMES: { id: Theme; name: string; colors: string[] }[] = [
    {
        id: 'sunset',
        name: 'Sunset Spice',
        colors: ['#FFFCF9', '#D96C4A', '#3E2723']
    },
    {
        id: 'nordic',
        name: 'Nordic Slate',
        colors: ['#F8FAFC', '#475569', '#1E293B']
    },
    {
        id: 'lavender',
        name: 'Lavender Haze',
        colors: ['#FAF5FF', '#7C3AED', '#4C1D95']
    },
    {
        id: 'monochrome',
        name: 'Monochrome',
        colors: ['#FFFFFF', '#111827', '#000000']
    },
    {
        id: 'forest',
        name: 'Forest Whisper',
        colors: ['#F2FBF5', '#2E7D32', '#1B4D3E']
    },
    {
        id: 'midnight',
        name: 'Midnight Chef',
        colors: ['#0F172A', '#38BDF8', '#F8FAFC']
    },
    {
        id: 'citrus',
        name: 'Citrus Zest',
        colors: ['#FFFBEB', '#F59E0B', '#78350F']
    },
]

export function ThemeSwitcher() {
    const { theme, setTheme } = useTheme()
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 ${isOpen ? 'bg-accent text-white shadow-lg rotate-90' : 'bg-surface text-secondary hover:bg-white hover:shadow-md'
                    }`}
                title="Change Theme"
            >
                <Palette className="h-5 w-5" />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-14 z-50 w-64 origin-top-right animate-scale-in rounded-2xl border border-accent/10 bg-white/90 p-2 shadow-xl backdrop-blur-xl">
                    <div className="mb-2 px-2 py-1 text-xs font-bold uppercase tracking-widest text-secondary/50">
                        Select Theme
                    </div>
                    <div className="space-y-1">
                        {THEMES.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => {
                                    setTheme(t.id)
                                    setIsOpen(false)
                                }}
                                className={`flex w-full items-center gap-3 rounded-xl p-2 transition-all ${theme === t.id ? 'bg-accent/10' : 'hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex h-8 w-8 overflow-hidden rounded-full border border-gray-100 shadow-sm shrink-0">
                                    {t.colors.map((c, i) => (
                                        <div
                                            key={i}
                                            className="h-full flex-1"
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                                <div className="text-left">
                                    <div className={`font-serif text-sm font-bold ${theme === t.id ? 'text-accent' : 'text-primary'
                                        }`}>
                                        {t.name}
                                    </div>
                                </div>
                                {theme === t.id && (
                                    <div className="ml-auto h-2 w-2 rounded-full bg-accent" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
