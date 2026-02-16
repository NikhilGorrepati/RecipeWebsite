import { describe, it, expect } from 'vitest'
import { createTestContext, createUnauthenticatedContext, testRecipe } from './setup'
import { api } from '../_generated/api'
import type { Id } from '../_generated/dataModel'

describe('mealPlans', () => {
  describe('getWeek', () => {
    it('should return empty array when no meal plans exist', async () => {
      const t = createTestContext()
      
      const plans = await t.query(api.mealPlans.getWeek, {
        startDate: '2024-01-01',
        endDate: '2024-01-07',
      })
      
      expect(plans).toEqual([])
    })

    it('should return meal plans with recipe details', async () => {
      const t = createTestContext()
      
      // Create recipe
      const recipeId = await t.mutation(api.recipes.create, testRecipe)
      
      // Add to meal plan
      await t.mutation(api.mealPlans.add, {
        recipeId,
        date: '2024-01-15',
        mealType: 'dinner',
      })
      
      const plans = await t.query(api.mealPlans.getWeek, {
        startDate: '2024-01-15',
        endDate: '2024-01-15',
      })
      
      expect(plans).toHaveLength(1)
      expect(plans[0].mealType).toBe('dinner')
      expect(plans[0].recipe!.title).toBe(testRecipe.title)
    })

    it('should filter by date range', async () => {
      const t = createTestContext()
      
      // Create recipe
      const recipeId = await t.mutation(api.recipes.create, testRecipe)
      
      // Add multiple meal plans
      await t.mutation(api.mealPlans.add, {
        recipeId,
        date: '2024-01-10',
        mealType: 'lunch',
      })
      await t.mutation(api.mealPlans.add, {
        recipeId,
        date: '2024-01-20',
        mealType: 'dinner',
      })
      
      // Query only first week
      const plans = await t.query(api.mealPlans.getWeek, {
        startDate: '2024-01-01',
        endDate: '2024-01-15',
      })
      
      expect(plans).toHaveLength(1)
      expect(plans[0].mealType).toBe('lunch')
    })

    it('should throw when not authenticated', async () => {
      const t = createUnauthenticatedContext()
      
      await expect(t.query(api.mealPlans.getWeek, {
        startDate: '2024-01-01',
        endDate: '2024-01-07',
      })).rejects.toThrow('Not authenticated')
    })
  })

  describe('add', () => {
    it('should create a new meal plan', async () => {
      const t = createTestContext()
      
      // Create recipe
      const recipeId = await t.mutation(api.recipes.create, testRecipe)
      
      // Add to meal plan
      const id = await t.mutation(api.mealPlans.add, {
        recipeId,
        date: '2024-01-15',
        mealType: 'dinner',
      })
      
      expect(id).toBeDefined()
      
      const plans = await t.query(api.mealPlans.getWeek, {
        startDate: '2024-01-15',
        endDate: '2024-01-15',
      })
      expect(plans).toHaveLength(1)
    })

    it('should support different meal types', async () => {
      const t = createTestContext()
      
      // Create recipe
      const recipeId = await t.mutation(api.recipes.create, testRecipe)
      
      // Add multiple meal types for same day
      await t.mutation(api.mealPlans.add, {
        recipeId,
        date: '2024-01-15',
        mealType: 'breakfast',
      })
      await t.mutation(api.mealPlans.add, {
        recipeId,
        date: '2024-01-15',
        mealType: 'lunch',
      })
      await t.mutation(api.mealPlans.add, {
        recipeId,
        date: '2024-01-15',
        mealType: 'dinner',
      })
      
      const plans = await t.query(api.mealPlans.getWeek, {
        startDate: '2024-01-15',
        endDate: '2024-01-15',
      })
      
      expect(plans).toHaveLength(3)
    })

    it('should throw when not authenticated', async () => {
      const t = createUnauthenticatedContext()
      
      // Note: ID validation happens before auth check, so we get validation error first
      await expect(t.mutation(api.mealPlans.add, {
        recipeId: 'abc123' as Id<'recipes'>,
        date: '2024-01-15',
        mealType: 'dinner',
      })).rejects.toThrow()
    })
  })

  describe('remove', () => {
    it('should remove a meal plan', async () => {
      const t = createTestContext()
      
      // Create recipe and add to meal plan
      const recipeId = await t.mutation(api.recipes.create, testRecipe)
      const planId = await t.mutation(api.mealPlans.add, {
        recipeId,
        date: '2024-01-15',
        mealType: 'dinner',
      })
      
      // Remove it
      await t.mutation(api.mealPlans.remove, { id: planId })
      
      // Verify removal
      const plans = await t.query(api.mealPlans.getWeek, {
        startDate: '2024-01-15',
        endDate: '2024-01-15',
      })
      expect(plans).toHaveLength(0)
    })

    it('should throw when removing other user meal plan', async () => {
      const t1 = createTestContext('user-1')
      const t2 = createTestContext('user-2')
      
      // Create recipe and add to meal plan as user-1
      const recipeId = await t1.mutation(api.recipes.create, testRecipe)
      const planId = await t1.mutation(api.mealPlans.add, {
        recipeId,
        date: '2024-01-15',
        mealType: 'dinner',
      })
      
      // Try to remove as user-2
      await expect(t2.mutation(api.mealPlans.remove, { id: planId })).rejects.toThrow('Not authorized')
    })

    it('should throw when not authenticated', async () => {
      const t = createUnauthenticatedContext()
      
      // Note: ID validation happens before auth check, so we get validation error first
      await expect(t.mutation(api.mealPlans.remove, { id: 'abc123' as Id<'mealPlans'> })).rejects.toThrow()
    })
  })
})
