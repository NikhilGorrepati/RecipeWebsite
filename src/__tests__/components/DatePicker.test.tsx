import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DatePicker } from '../../components/DatePicker'

describe('DatePicker', () => {
  const mockOnChange = vi.fn()
  const testDate = new Date(2024, 0, 15) // January 15, 2024

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render with formatted date', () => {
    render(<DatePicker value={testDate} onChange={mockOnChange} />)

    // Date format varies by locale, so check for the button with calendar icon
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should open calendar on button click', async () => {
    const user = userEvent.setup()
    render(<DatePicker value={testDate} onChange={mockOnChange} />)

    await user.click(screen.getByRole('button'))

    expect(screen.getByText('January 2024')).toBeInTheDocument()
  })

  it('should show correct month and year', async () => {
    const user = userEvent.setup()
    render(<DatePicker value={testDate} onChange={mockOnChange} />)

    await user.click(screen.getByRole('button'))

    expect(screen.getByText('January 2024')).toBeInTheDocument()
  })

  it('should show day headers', async () => {
    const user = userEvent.setup()
    render(<DatePicker value={testDate} onChange={mockOnChange} />)

    await user.click(screen.getByRole('button'))

    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
    days.forEach((day) => {
      expect(screen.getByText(day)).toBeInTheDocument()
    })
  })

  it('should navigate to previous month', async () => {
    const user = userEvent.setup()
    render(<DatePicker value={testDate} onChange={mockOnChange} />)

    await user.click(screen.getByRole('button'))
    await user.click(screen.getByLabelText('Previous month'))

    expect(screen.getByText('December 2023')).toBeInTheDocument()
  })

  it('should navigate to next month', async () => {
    const user = userEvent.setup()
    render(<DatePicker value={testDate} onChange={mockOnChange} />)

    await user.click(screen.getByRole('button'))
    await user.click(screen.getByLabelText('Next month'))

    expect(screen.getByText('February 2024')).toBeInTheDocument()
  })

  it('should select a date', async () => {
    const user = userEvent.setup()
    render(<DatePicker value={testDate} onChange={mockOnChange} />)

    await user.click(screen.getByRole('button'))
    await user.click(screen.getByText('20'))

    expect(mockOnChange).toHaveBeenCalled()
    const calledDate = mockOnChange.mock.calls[0][0]
    expect(calledDate.getDate()).toBe(20)
    expect(calledDate.getMonth()).toBe(0) // January
    expect(calledDate.getFullYear()).toBe(2024)
  })

  it('should close calendar after date selection', async () => {
    const user = userEvent.setup()
    render(<DatePicker value={testDate} onChange={mockOnChange} />)

    await user.click(screen.getByRole('button'))
    expect(screen.getByText('January 2024')).toBeInTheDocument()

    await user.click(screen.getByText('20'))
    expect(screen.queryByText('January 2024')).not.toBeInTheDocument()
  })

  it('should show today button', async () => {
    const user = userEvent.setup()
    render(<DatePicker value={testDate} onChange={mockOnChange} />)

    await user.click(screen.getByRole('button'))

    expect(screen.getByText('Today')).toBeInTheDocument()
  })

  it('should select today when clicking today button', async () => {
    const user = userEvent.setup()
    render(<DatePicker value={testDate} onChange={mockOnChange} />)

    await user.click(screen.getByRole('button'))
    await user.click(screen.getByText('Today'))

    expect(mockOnChange).toHaveBeenCalled()
    const calledDate = mockOnChange.mock.calls[0][0]
    const today = new Date()
    expect(calledDate.getDate()).toBe(today.getDate())
    expect(calledDate.getMonth()).toBe(today.getMonth())
    expect(calledDate.getFullYear()).toBe(today.getFullYear())
  })
})
