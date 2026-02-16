import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { UserProvider, useUser } from '../../UserContext'

// Mock convex/react
vi.mock('convex/react', () => ({
  useConvexAuth: vi.fn(),
}))

import { useConvexAuth } from 'convex/react'

const TestComponent = () => {
  const { currentUser, isAuthenticated, isLoading } = useUser()
  return (
    <div>
      <span data-testid="user">{currentUser}</span>
      <span data-testid="auth">{isAuthenticated ? 'true' : 'false'}</span>
      <span data-testid="loading">{isLoading ? 'true' : 'false'}</span>
    </div>
  )
}

describe('UserContext', () => {
  it('should provide authenticated user state', () => {
    vi.mocked(useConvexAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    })

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    )

    expect(screen.getByTestId('user')).toHaveTextContent('authenticated-user')
    expect(screen.getByTestId('auth')).toHaveTextContent('true')
    expect(screen.getByTestId('loading')).toHaveTextContent('false')
  })

  it('should provide unauthenticated user state', () => {
    vi.mocked(useConvexAuth).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    })

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    )

    expect(screen.getByTestId('user')).toHaveTextContent('anonymous')
    expect(screen.getByTestId('auth')).toHaveTextContent('false')
  })

  it('should show loading state', () => {
    vi.mocked(useConvexAuth).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    })

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    )

    expect(screen.getByTestId('loading')).toHaveTextContent('true')
  })

  it('should throw error when useUser is called outside provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useUser must be used within a UserProvider')

    consoleError.mockRestore()
  })
})
