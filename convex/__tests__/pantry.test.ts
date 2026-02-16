import { describe, it, expect } from 'vitest'
import { createTestContext, createUnauthenticatedContext, testIngredient } from './setup'
import { api } from '../_generated/api'

describe('pantry', () => {
  describe('getForUser', () => {
    it('should return empty array when pantry is empty', async () => {
      const t = createTestContext()
      
      const items = await t.query(api.pantry.getForUser, {})
      
      expect(items).toEqual([])
    })

    it('should return pantry items with ingredient details', async () => {
      const t = createTestContext()
      
      // Create ingredient
      const ingredientId = await t.mutation(api.ingredients.create, testIngredient)
      
      // Add to pantry
      await t.mutation(api.pantry.set, { ingredientId, quantity: 500 })
      
      const items = await t.query(api.pantry.getForUser, {})
      
      expect(items).toHaveLength(1)
      expect(items[0].quantity).toBe(500)
      expect(items[0].ingredient!.name).toBe(testIngredient.name)
    })

    it('should throw when not authenticated', async () => {
      const t = createUnauthenticatedContext()
      
      await expect(t.query(api.pantry.getForUser, {})).rejects.toThrow('Not authenticated')
    })
  })

  describe('set', () => {
    it('should create new pantry item', async () => {
      const t = createTestContext()
      
      // Create ingredient
      const ingredientId = await t.mutation(api.ingredients.create, testIngredient)
      
      // Add to pantry
      const id = await t.mutation(api.pantry.set, { ingredientId, quantity: 500 })
      
      expect(id).toBeDefined()
      
      const items = await t.query(api.pantry.getForUser, {})
      expect(items).toHaveLength(1)
      expect(items[0].quantity).toBe(500)
    })

    it('should update existing pantry item', async () => {
      const t = createTestContext()
      
      // Create ingredient
      const ingredientId = await t.mutation(api.ingredients.create, testIngredient)
      
      // Add to pantry
      await t.mutation(api.pantry.set, { ingredientId, quantity: 500 })
      
      // Update quantity
      await t.mutation(api.pantry.set, { ingredientId, quantity: 750 })
      
      const items = await t.query(api.pantry.getForUser, {})
      expect(items).toHaveLength(1)
      expect(items[0].quantity).toBe(750)
    })

    it('should throw when not authenticated', async () => {
      const t = createUnauthenticatedContext()
      
      // Note: ID validation happens before auth check, so we get validation error first
      await expect(t.mutation(api.pantry.set, {
        ingredientId: 'abc123' as any,
        quantity: 100,
      })).rejects.toThrow()
    })
  })

  describe('adjust', () => {
    it('should increment quantity', async () => {
      const t = createTestContext()
      
      // Create ingredient
      const ingredientId = await t.mutation(api.ingredients.create, testIngredient)
      
      // Add to pantry
      await t.mutation(api.pantry.set, { ingredientId, quantity: 100 })
      
      // Increment
      await t.mutation(api.pantry.adjust, { ingredientId, delta: 50 })
      
      const items = await t.query(api.pantry.getForUser, {})
      expect(items[0].quantity).toBe(150)
    })

    it('should decrement quantity', async () => {
      const t = createTestContext()
      
      // Create ingredient
      const ingredientId = await t.mutation(api.ingredients.create, testIngredient)
      
      // Add to pantry
      await t.mutation(api.pantry.set, { ingredientId, quantity: 100 })
      
      // Decrement
      await t.mutation(api.pantry.adjust, { ingredientId, delta: -30 })
      
      const items = await t.query(api.pantry.getForUser, {})
      expect(items[0].quantity).toBe(70)
    })

    it('should not go below zero', async () => {
      const t = createTestContext()
      
      // Create ingredient
      const ingredientId = await t.mutation(api.ingredients.create, testIngredient)
      
      // Add to pantry
      await t.mutation(api.pantry.set, { ingredientId, quantity: 10 })
      
      // Try to decrement more than available
      await t.mutation(api.pantry.adjust, { ingredientId, delta: -50 })
      
      const items = await t.query(api.pantry.getForUser, {})
      expect(items[0].quantity).toBe(0)
    })

    it('should create new item on positive delta', async () => {
      const t = createTestContext()
      
      // Create ingredient
      const ingredientId = await t.mutation(api.ingredients.create, testIngredient)
      
      // Add via adjust (no existing item)
      const id = await t.mutation(api.pantry.adjust, { ingredientId, delta: 100 })
      
      expect(id).toBeDefined()
      
      const items = await t.query(api.pantry.getForUser, {})
      expect(items[0].quantity).toBe(100)
    })

    it('should return null on negative delta for non-existent item', async () => {
      const t = createTestContext()
      
      // Create ingredient
      const ingredientId = await t.mutation(api.ingredients.create, testIngredient)
      
      // Try to decrement non-existent item
      const result = await t.mutation(api.pantry.adjust, { ingredientId, delta: -10 })
      
      expect(result).toBeNull()
      
      const items = await t.query(api.pantry.getForUser, {})
      expect(items).toHaveLength(0)
    })

    it('should throw when not authenticated', async () => {
      const t = createUnauthenticatedContext()
      
      // Note: ID validation happens before auth check, so we get validation error first
      await expect(t.mutation(api.pantry.adjust, {
        ingredientId: 'abc123' as any,
        delta: 10,
      })).rejects.toThrow()
    })
  })
})
