import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

interface DatePickerProps {
    value: Date
    onChange: (date: Date) => void
}

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export function DatePicker({ value, onChange }: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [viewDate, setViewDate] = useState(new Date(value))
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const daysInMonth = lastDay.getDate()
        const startingDayOfWeek = firstDay.getDay()

        const days: (number | null)[] = []
        
        // Add empty cells for days before the first of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null)
        }
        
        // Add all days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i)
        }

        return days
    }

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1))
    }

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1))
    }

    const handleSelectDate = (day: number) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
        onChange(newDate)
        setIsOpen(false)
    }

    const isSelectedDate = (day: number) => {
        return (
            day === value.getDate() &&
            viewDate.getMonth() === value.getMonth() &&
            viewDate.getFullYear() === value.getFullYear()
        )
    }

    const isToday = (day: number) => {
        const today = new Date()
        return (
            day === today.getDate() &&
            viewDate.getMonth() === today.getMonth() &&
            viewDate.getFullYear() === today.getFullYear()
        )
    }

    const days = getDaysInMonth(viewDate)

    return (
        <div ref={containerRef} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-primary hover:border-accent/50 hover:bg-accent/5 transition-all focus:outline-none focus:ring-2 focus:ring-accent/20"
            >
                <Calendar className="h-4 w-4 text-accent" />
                <span className="font-mono">
                    {value.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 z-50 rounded-2xl border border-gray-200 bg-white/95 backdrop-blur-xl shadow-2xl p-4 min-w-[320px] animate-scale-in">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                        <button
                            onClick={handlePrevMonth}
                            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-accent/10 text-primary hover:text-accent transition-all"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <span className="font-serif text-lg font-bold text-primary">
                            {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
                        </span>
                        <button
                            onClick={handleNextMonth}
                            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-accent/10 text-primary hover:text-accent transition-all"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Day headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {DAYS.map(day => (
                            <div key={day} className="text-center text-xs font-bold text-gray-400 py-1">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {days.map((day, index) => (
                            <div key={index} className="aspect-square">
                                {day ? (
                                    <button
                                        onClick={() => handleSelectDate(day)}
                                        className={`w-full h-full rounded-lg text-sm font-medium transition-all ${
                                            isSelectedDate(day)
                                                ? 'bg-accent text-white shadow-md scale-105'
                                                : isToday(day)
                                                ? 'bg-accent/10 text-accent border border-accent/30'
                                                : 'text-primary hover:bg-accent/5 hover:text-accent'
                                        }`}
                                    >
                                        {day}
                                    </button>
                                ) : (
                                    <div />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Quick actions */}
                    <div className="mt-4 pt-3 border-t border-gray-200 flex gap-2">
                        <button
                            onClick={() => {
                                onChange(new Date())
                                setIsOpen(false)
                            }}
                            className="flex-1 text-xs font-medium text-accent hover:text-accent-hover py-2 rounded-lg hover:bg-accent/5 transition-all"
                        >
                            Today
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
