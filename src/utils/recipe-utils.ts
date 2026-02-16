/**
 * Recipe utility functions for scaling, formatting, and calculations
 */

/**
 * Scale a quantity based on serving size change
 * @param baseQuantity - Original quantity in the recipe
 * @param baseServings - Original serving size
 * @param selectedServings - Target serving size
 * @returns Scaled quantity
 */
export function scaleQuantity(
  baseQuantity: number,
  baseServings: number,
  selectedServings: number
): number {
  return (baseQuantity / baseServings) * selectedServings
}

/**
 * Format a number to 2 decimal places, removing trailing zeros
 * @param num - Number to format
 * @returns Formatted number as a number (not string)
 */
export function formatQuantity(num: number): number {
  return parseFloat(num.toFixed(2))
}

/**
 * Format seconds into MM:SS format
 * @param seconds - Time in seconds
 * @returns Formatted time string (e.g., "5:30")
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Calculate average cooking time from history
 * @param history - Array of cooking history entries with duration
 * @returns Average time in minutes, or null if no history
 */
export function calculateAverageTime(
  history: { duration: number }[] | undefined
): number | null {
  if (!history || history.length === 0) return null
  const total = history.reduce((acc, curr) => acc + curr.duration, 0)
  return Math.round(total / history.length)
}

/**
 * Check if pantry has enough of an ingredient
 * @param available - Available quantity in pantry
 * @param required - Required quantity for recipe
 * @returns Object with availability status
 */
export function checkPantryAvailability(
  available: number,
  required: number
): { available: number; hasEnough: boolean } {
  return {
    available,
    hasEnough: available >= required,
  }
}
