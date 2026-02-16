import { describe, it, expect } from 'vitest'
import {
  scaleQuantity,
  formatQuantity,
  formatTime,
  calculateAverageTime,
  checkPantryAvailability,
} from '../../utils/recipe-utils'

describe('scaleQuantity', () => {
  it('should scale quantity proportionally', () => {
    expect(scaleQuantity(100, 4, 2)).toBe(50)
    expect(scaleQuantity(100, 4, 8)).toBe(200)
    expect(scaleQuantity(100, 2, 4)).toBe(200)
  })

  it('should return same quantity when servings are unchanged', () => {
    expect(scaleQuantity(100, 4, 4)).toBe(100)
  })

  it('should handle decimal quantities', () => {
    expect(scaleQuantity(1.5, 2, 4)).toBe(3)
    expect(scaleQuantity(0.5, 2, 3)).toBe(0.75)
  })

  it('should handle zero base servings gracefully', () => {
    expect(scaleQuantity(100, 0, 4)).toBe(Infinity)
  })
})

describe('formatQuantity', () => {
  it('should round to 2 decimal places', () => {
    expect(formatQuantity(1.234)).toBe(1.23)
    expect(formatQuantity(1.235)).toBe(1.24)
    expect(formatQuantity(1.999)).toBe(2)
  })

  it('should remove trailing zeros', () => {
    expect(formatQuantity(2.0)).toBe(2)
    expect(formatQuantity(2.50)).toBe(2.5)
    expect(formatQuantity(2.500)).toBe(2.5)
  })

  it('should handle integers', () => {
    expect(formatQuantity(5)).toBe(5)
    expect(formatQuantity(100)).toBe(100)
  })

  it('should handle zero', () => {
    expect(formatQuantity(0)).toBe(0)
  })
})

describe('formatTime', () => {
  it('should format seconds to MM:SS', () => {
    expect(formatTime(0)).toBe('0:00')
    expect(formatTime(5)).toBe('0:05')
    expect(formatTime(30)).toBe('0:30')
    expect(formatTime(60)).toBe('1:00')
    expect(formatTime(90)).toBe('1:30')
  })

  it('should handle large times', () => {
    expect(formatTime(3600)).toBe('60:00')
    expect(formatTime(3661)).toBe('61:01')
  })

  it('should pad single digit seconds', () => {
    expect(formatTime(61)).toBe('1:01')
    expect(formatTime(601)).toBe('10:01')
  })
})

describe('calculateAverageTime', () => {
  it('should calculate average from history', () => {
    const history = [
      { duration: 30 },
      { duration: 40 },
      { duration: 50 },
    ]
    expect(calculateAverageTime(history)).toBe(40)
  })

  it('should round to nearest integer', () => {
    const history = [
      { duration: 33 },
      { duration: 34 },
    ]
    expect(calculateAverageTime(history)).toBe(34)
  })

  it('should return null for empty history', () => {
    expect(calculateAverageTime([])).toBeNull()
  })

  it('should return null for undefined history', () => {
    expect(calculateAverageTime(undefined)).toBeNull()
  })

  it('should handle single entry', () => {
    const history = [{ duration: 45 }]
    expect(calculateAverageTime(history)).toBe(45)
  })
})

describe('checkPantryAvailability', () => {
  it('should return hasEnough true when sufficient', () => {
    const result = checkPantryAvailability(100, 50)
    expect(result.available).toBe(100)
    expect(result.hasEnough).toBe(true)
  })

  it('should return hasEnough true when exact match', () => {
    const result = checkPantryAvailability(50, 50)
    expect(result.available).toBe(50)
    expect(result.hasEnough).toBe(true)
  })

  it('should return hasEnough false when insufficient', () => {
    const result = checkPantryAvailability(30, 50)
    expect(result.available).toBe(30)
    expect(result.hasEnough).toBe(false)
  })

  it('should handle zero availability', () => {
    const result = checkPantryAvailability(0, 50)
    expect(result.available).toBe(0)
    expect(result.hasEnough).toBe(false)
  })
})
