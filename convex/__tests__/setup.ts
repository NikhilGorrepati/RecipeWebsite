import { convexTest } from 'convex-test'
import schema from '../schema'
import type { UserIdentity } from 'convex/server'

// Helper to create a test context with authenticated user
export function createTestContext(userId: string = 'test-user-id') {
  // @ts-ignore - import.meta.glob is available at runtime
  const modules = import.meta.glob('../**/*.ts')
  const t = convexTest(schema, modules)
  
  const identity: Partial<UserIdentity> = {
    subject: userId,
    email: 'test@example.com',
  }
  
  return t.withIdentity(identity)
}

// Helper to create a test context without authentication
export function createUnauthenticatedContext() {
  // @ts-ignore - import.meta.glob is available at runtime
  const modules = import.meta.glob('../**/*.ts')
  return convexTest(schema, modules)
}

// Test data helpers
export const testIngredient = {
  name: 'Test Ingredient',
  defaultUnit: 'grams' as const,
}

export const testRecipe = {
  title: 'Test Recipe',
  description: 'A test recipe',
  instructions: 'Step 1\nStep 2',
  servings: 4,
  ingredients: [],
}
