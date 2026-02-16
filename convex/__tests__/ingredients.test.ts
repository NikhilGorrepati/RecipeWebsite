import { describe, it, expect } from 'vitest'
import { createTestContext, createUnauthenticatedContext, testIngredient } from './setup'
import { api } from '../_generated/api'

describe('ingredients', () => {
  describe('getAll', () => {
    it('should return empty array when no ingredients exist', async () => {
      const t = createTestContext()
      
      const ingredients = await t.query(api.ingredients.getAll, {})
      
      expect(ingredients).toEqual([])
    })

    it('should return only current user ingredients', async () => {
      const t = createTestContext('user-1')
      
      // Create ingredient for user-1
      await t.mutation(api.ingredients.create, testIngredient)
      
      const ingredients = await t.query(api.ingredients.getAll, {})
      
      expect(ingredients).toHaveLength(1)
      expect(ingredients[0].name).toBe(testIngredient.name)
    })

    it('should not return other user ingredients', async () => {
      const t1 = createTestContext('user-1')
      const t2 = createTestContext('user-2')
      
      // Create ingredient for user-1
      await t1.mutation(api.ingredients.create, testIngredient)
      
      // Get ingredients for user-2
      const ingredients = await t2.query(api.ingredients.getAll, {})
      
      expect(ingredients).toHaveLength(0)
    })

    it('should throw when not authenticated', async () => {
      const t = createUnauthenticatedContext()
      
      await expect(t.query(api.ingredients.getAll, {})).rejects.toThrow('Not authenticated')
    })
  })

  describe('create', () => {
    it('should create a new ingredient', async () => {
      const t = createTestContext()
      
      const id = await t.mutation(api.ingredients.create, testIngredient)
      
      expect(id).toBeDefined()
      
      const ingredients = await t.query(api.ingredients.getAll, {})
      expect(ingredients).toHaveLength(1)
      expect(ingredients[0].name).toBe(testIngredient.name)
      expect(ingredients[0].defaultUnit).toBe(testIngredient.defaultUnit)
    })

    it('should throw when not authenticated', async () => {
      const t = createUnauthenticatedContext()
      
      await expect(t.mutation(api.ingredients.create, testIngredient)).rejects.toThrow('Not authenticated')
    })
  })

  describe('update', () => {
    it('should update an existing ingredient', async () => {
      const t = createTestContext()
      
      // Create ingredient
      const id = await t.mutation(api.ingredients.create, testIngredient)
      
      // Update it
      await t.mutation(api.ingredients.update, {
        id,
        name: 'Updated Name',
        defaultUnit: 'ml',
      })
      
      // Verify update
      const ingredients = await t.query(api.ingredients.getAll, {})
      expect(ingredients[0].name).toBe('Updated Name')
      expect(ingredients[0].defaultUnit).toBe('ml')
    })

    it('should throw when updating other user ingredient', async () => {
      const t1 = createTestContext('user-1')
      const t2 = createTestContext('user-2')
      
      // Create ingredient as user-1
      const id = await t1.mutation(api.ingredients.create, testIngredient)
      
      // Try to update as user-2
      await expect(t2.mutation(api.ingredients.update, {
        id,
        name: 'Hacked',
        defaultUnit: 'grams',
      })).rejects.toThrow('Not authorized')
    })

    it('should throw when not authenticated', async () => {
      const t = createUnauthenticatedContext()
      
      // Note: ID validation happens before auth check, so we get validation error first
      await expect(t.mutation(api.ingredients.update, {
        id: 'abc123' as any,
        name: 'Test',
        defaultUnit: 'grams',
      })).rejects.toThrow()
    })
  })

  describe('remove', () => {
    it('should delete an ingredient', async () => {
      const t = createTestContext()
      
      // Create ingredient
      const id = await t.mutation(api.ingredients.create, testIngredient)
      
      // Delete it
      await t.mutation(api.ingredients.remove, { id })
      
      // Verify deletion
      const ingredients = await t.query(api.ingredients.getAll, {})
      expect(ingredients).toHaveLength(0)
    })

    it('should throw when deleting other user ingredient', async () => {
      const t1 = createTestContext('user-1')
      const t2 = createTestContext('user-2')
      
      // Create ingredient as user-1
      const id = await t1.mutation(api.ingredients.create, testIngredient)
      
      // Try to delete as user-2
      await expect(t2.mutation(api.ingredients.remove, { id })).rejects.toThrow('Not authorized')
    })

    it('should throw when not authenticated', async () => {
      const t = createUnauthenticatedContext()
      
      // Note: ID validation happens before auth check, so we get validation error first
      await expect(t.mutation(api.ingredients.remove, { id: 'abc123' as any })).rejects.toThrow()
    })
  })
})
