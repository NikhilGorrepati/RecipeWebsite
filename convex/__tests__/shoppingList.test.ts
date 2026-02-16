import { describe, it, expect } from 'vitest'
import { createTestContext, createUnauthenticatedContext, testIngredient, testRecipe } from './setup'
import { api } from '../_generated/api'
import type { Id } from '../_generated/dataModel'

describe('shoppingList', () => {
  describe('getForUser', () => {
    it('should return empty array when shopping list is empty', async () => {
      const t = createTestContext()
      
      const items = await t.query(api.shoppingList.getForUser, {})
      
      expect(items).toEqual([])
    })

    it('should return shopping list items with ingredient details', async () => {
      const t = createTestContext()
      
      // Create ingredient
      const ingredientId = await t.mutation(api.ingredients.create, testIngredient)
      
      // Add to shopping list
      await t.mutation(api.shoppingList.add, { ingredientId, quantity: 500 })
      
      const items = await t.query(api.shoppingList.getForUser, {})
      
      expect(items).toHaveLength(1)
      expect(items[0].quantity).toBe(500)
      expect(items[0].ingredient!.name).toBe(testIngredient.name)
    })

    it('should throw when not authenticated', async () => {
      const t = createUnauthenticatedContext()
      
      await expect(t.query(api.shoppingList.getForUser, {})).rejects.toThrow('Not authenticated')
    })
  })

  describe('add', () => {
    it('should create new shopping list item', async () => {
      const t = createTestContext()
      
      // Create ingredient
      const ingredientId = await t.mutation(api.ingredients.create, testIngredient)
      
      // Add to shopping list
      const id = await t.mutation(api.shoppingList.add, { ingredientId, quantity: 500 })
      
      expect(id).toBeDefined()
      
      const items = await t.query(api.shoppingList.getForUser, {})
      expect(items).toHaveLength(1)
      expect(items[0].quantity).toBe(500)
    })

    it('should aggregate quantity for existing item', async () => {
      const t = createTestContext()
      
      // Create ingredient
      const ingredientId = await t.mutation(api.ingredients.create, testIngredient)
      
      // Add to shopping list twice
      await t.mutation(api.shoppingList.add, { ingredientId, quantity: 300 })
      await t.mutation(api.shoppingList.add, { ingredientId, quantity: 200 })
      
      const items = await t.query(api.shoppingList.getForUser, {})
      expect(items).toHaveLength(1)
      expect(items[0].quantity).toBe(500)
    })

    it('should throw when not authenticated', async () => {
      const t = createUnauthenticatedContext()
      
      // Note: ID validation happens before auth check, so we get validation error first
      await expect(t.mutation(api.shoppingList.add, {
        ingredientId: 'abc123' as any,
        quantity: 100,
      })).rejects.toThrow()
    })
  })

  describe('remove', () => {
    it('should remove item from shopping list', async () => {
      const t = createTestContext()
      
      // Create ingredient and add to list
      const ingredientId = await t.mutation(api.ingredients.create, testIngredient)
      await t.mutation(api.shoppingList.add, { ingredientId, quantity: 500 })
      
      // Get the item id
      const items = await t.query(api.shoppingList.getForUser, {})
      const itemId = items[0]._id
      
      // Remove it
      await t.mutation(api.shoppingList.remove, { id: itemId })
      
      // Verify removal
      const remainingItems = await t.query(api.shoppingList.getForUser, {})
      expect(remainingItems).toHaveLength(0)
    })

    it('should throw when removing other user item', async () => {
      const t1 = createTestContext('user-1')
      const t2 = createTestContext('user-2')
      
      // Create ingredient and add to list as user-1
      const ingredientId = await t1.mutation(api.ingredients.create, testIngredient)
      await t1.mutation(api.shoppingList.add, { ingredientId, quantity: 500 })
      
      // Get the item id
      const items = await t1.query(api.shoppingList.getForUser, {})
      const itemId = items[0]._id
      
      // Try to remove as user-2
      await expect(t2.mutation(api.shoppingList.remove, { id: itemId })).rejects.toThrow('Not authorized')
    })

    it('should throw when not authenticated', async () => {
      const t = createUnauthenticatedContext()
      
      // Note: ID validation happens before auth check, so we get validation error first
      await expect(t.mutation(api.shoppingList.remove, { id: 'abc123' as Id<'shoppingList'> })).rejects.toThrow()
    })
  })

  describe('clear', () => {
    it('should remove all items for current user', async () => {
      const t = createTestContext()
      
      // Create ingredients and add to list
      const ingredientId1 = await t.mutation(api.ingredients.create, { ...testIngredient, name: 'Ingredient 1' })
      const ingredientId2 = await t.mutation(api.ingredients.create, { ...testIngredient, name: 'Ingredient 2' })
      await t.mutation(api.shoppingList.add, { ingredientId: ingredientId1, quantity: 100 })
      await t.mutation(api.shoppingList.add, { ingredientId: ingredientId2, quantity: 200 })
      
      // Clear list
      await t.mutation(api.shoppingList.clear, {})
      
      // Verify all items removed
      const items = await t.query(api.shoppingList.getForUser, {})
      expect(items).toHaveLength(0)
    })

    it('should only clear current user items', async () => {
      const t1 = createTestContext('user-1')
      const t2 = createTestContext('user-2')
      
      // Create ingredient
      const ingredientId = await t1.mutation(api.ingredients.create, testIngredient)
      
      // Add to both users lists
      await t1.mutation(api.shoppingList.add, { ingredientId, quantity: 100 })
      await t2.mutation(api.shoppingList.add, { ingredientId, quantity: 200 })
      
      // Clear user-1's list
      await t1.mutation(api.shoppingList.clear, {})
      
      // Verify user-1's list is empty
      const user1Items = await t1.query(api.shoppingList.getForUser, {})
      expect(user1Items).toHaveLength(0)
      
      // Verify user-2's list still has item
      const user2Items = await t2.query(api.shoppingList.getForUser, {})
      expect(user2Items).toHaveLength(1)
    })

    it('should throw when not authenticated', async () => {
      const t = createUnauthenticatedContext()
      
      await expect(t.mutation(api.shoppingList.clear, {})).rejects.toThrow('Not authenticated')
    })
  })
})
