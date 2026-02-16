import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthForm } from '../../components/AuthForm'
import * as convexAuthReact from '@convex-dev/auth/react'

vi.mock('@convex-dev/auth/react')

describe('AuthForm', () => {
  const mockSignIn = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(convexAuthReact.useAuthActions).mockReturnValue({
      signIn: mockSignIn,
      signOut: vi.fn(),
    })
  })

  it('should render sign in form by default', () => {
    render(<AuthForm />)

    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('should toggle to sign up form', async () => {
    const user = userEvent.setup()
    render(<AuthForm />)

    const toggleButton = screen.getByText("Don't have an account? Sign up")
    await user.click(toggleButton)

    expect(screen.getByText('Create Account')).toBeInTheDocument()
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
  })

  it('should toggle back to sign in form', async () => {
    const user = userEvent.setup()
    render(<AuthForm />)

    await user.click(screen.getByText("Don't have an account? Sign up"))
    await user.click(screen.getByText('Already have an account? Sign in'))

    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
  })

  it('should call signIn with correct parameters for sign in', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValue(undefined)

    render(<AuthForm />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('password', {
        email: 'test@example.com',
        password: 'password123',
        flow: 'signIn',
      })
    })
  })

  it('should call signIn with correct parameters for sign up', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValue(undefined)

    render(<AuthForm />)

    await user.click(screen.getByText("Don't have an account? Sign up"))
    await user.type(screen.getByLabelText(/name/i), 'Test User')
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('password', {
        email: 'test@example.com',
        password: 'password123',
        flow: 'signUp',
      })
    })
  })

  it('should display error message on authentication failure', async () => {
    const user = userEvent.setup()
    mockSignIn.mockRejectedValue(new Error('Invalid credentials'))

    render(<AuthForm />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
  })

  it('should show loading state during submission', async () => {
    const user = userEvent.setup()
    mockSignIn.mockImplementation(() => new Promise(() => {})) // Never resolves

    render(<AuthForm />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(screen.getByRole('button', { name: /loading/i })).toBeDisabled()
  })

  it('should clear error when toggling between sign in and sign up', async () => {
    const user = userEvent.setup()
    mockSignIn.mockRejectedValue(new Error('Invalid credentials'))

    render(<AuthForm />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })

    await user.click(screen.getByText("Don't have an account? Sign up"))

    expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument()
  })
})
