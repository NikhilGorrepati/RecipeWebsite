import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeSwitcher } from '../../components/ThemeSwitcher'
import { ThemeProvider, useTheme } from '../../ThemeContext'

const TestComponent = () => {
  const { theme } = useTheme()
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <ThemeSwitcher />
    </div>
  )
}

describe('ThemeSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('should render theme button', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    expect(screen.getByTitle('Change Theme')).toBeInTheDocument()
  })

  it('should open theme menu on click', async () => {
    const user = userEvent.setup()
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    await user.click(screen.getByTitle('Change Theme'))

    expect(screen.getByText('Select Theme')).toBeInTheDocument()
    expect(screen.getByText('Sunset Spice')).toBeInTheDocument()
    expect(screen.getByText('Nordic Slate')).toBeInTheDocument()
  })

  it('should show all available themes', async () => {
    const user = userEvent.setup()
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    await user.click(screen.getByTitle('Change Theme'))

    const themes = [
      'Sunset Spice',
      'Nordic Slate',
      'Lavender Haze',
      'Monochrome',
      'Forest Whisper',
      'Midnight Chef',
      'Citrus Zest',
    ]

    themes.forEach((theme) => {
      expect(screen.getByText(theme)).toBeInTheDocument()
    })
  })

  it('should change theme when selecting a different theme', async () => {
    const user = userEvent.setup()
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    await user.click(screen.getByTitle('Change Theme'))
    await user.click(screen.getByText('Nordic Slate'))

    expect(screen.getByTestId('current-theme')).toHaveTextContent('nordic')
  })

  it('should close menu after selecting theme', async () => {
    const user = userEvent.setup()
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    await user.click(screen.getByTitle('Change Theme'))
    expect(screen.getByText('Select Theme')).toBeInTheDocument()

    await user.click(screen.getByText('Nordic Slate'))
    expect(screen.queryByText('Select Theme')).not.toBeInTheDocument()
  })

  it('should highlight current theme', async () => {
    const user = userEvent.setup()
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    await user.click(screen.getByTitle('Change Theme'))

    // The first theme (Sunset Spice) should have active indicator
    const sunsetButton = screen.getByText('Sunset Spice').closest('button')
    expect(sunsetButton?.querySelector('.bg-accent')).toBeInTheDocument()
  })
})
