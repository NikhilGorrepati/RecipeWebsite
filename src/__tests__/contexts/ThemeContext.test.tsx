import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, useTheme } from '../../ThemeContext'

const TestComponent = () => {
  const { theme, setTheme } = useTheme()
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={() => setTheme('nordic')}>Set Nordic</button>
    </div>
  )
}

describe('ThemeContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    })
  })

  it('should provide default theme when no localStorage value', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    expect(screen.getByTestId('theme')).toHaveTextContent('sunset')
  })

  it('should load theme from localStorage', () => {
    const mockGetItem = vi.fn().mockReturnValue('nordic')
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: mockGetItem,
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    })
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    expect(mockGetItem).toHaveBeenCalledWith('app-theme')
    expect(screen.getByTestId('theme')).toHaveTextContent('nordic')
  })

  it('should update theme when setTheme is called', async () => {
    const user = userEvent.setup()
    const mockSetItem = vi.fn()
    
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: mockSetItem,
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    })
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    await user.click(screen.getByText('Set Nordic'))
    
    await waitFor(() => {
      expect(screen.getByTestId('theme')).toHaveTextContent('nordic')
    })
    expect(mockSetItem).toHaveBeenCalledWith('app-theme', 'nordic')
  })

  it('should set data-theme attribute on document', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    expect(document.documentElement.getAttribute('data-theme')).toBe('sunset')
  })

  it('should throw error when useTheme is called outside provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    expect(() => {
      render(<TestComponent />)
    }).toThrow('useTheme must be used within a ThemeProvider')
    
    consoleError.mockRestore()
  })
})
