import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../../__tests__/utils/vitest-utils'
import { BookingForm } from '@/components/scheduling/client/booking-form'
import { createBooking } from '@/lib/api-client/scheduling'
import { createCheckoutSession } from '@/lib/stripe'
import { toast } from 'sonner'

// Mock dependencies
vi.mock('@/lib/api-client/scheduling', () => ({
  createBooking: vi.fn(),
}))

vi.mock('@/lib/stripe', () => ({
  createCheckoutSession: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}))

// Mock window.location for testing
const mockLocation = {
  href: '',
  origin: 'http://localhost:3000',
}
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
})

describe('BookingForm', () => {
  const mockProps = {
    builderId: 'test-builder',
    clientId: 'test-client',
    selectedSlot: {
      startTime: '2025-04-21T10:00:00Z',
      endTime: '2025-04-21T11:00:00Z',
      isAvailable: true,
    },
    sessionType: {
      id: 'session-type-123',
      title: 'Discovery Call',
      description: 'Let\'s discuss your project',
      durationMinutes: 60,
      price: 100,
      currency: 'USD',
    },
    builderTimezone: 'America/New_York',
    onBookingComplete: vi.fn(),
    onCancel: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the booking form with correct details', () => {
    render(<BookingForm {...mockProps} />)

    expect(screen.getByText('Confirm Your Booking')).toBeInTheDocument()
    expect(screen.getByText('Discovery Call')).toBeInTheDocument()
    expect(screen.getByText('100 USD')).toBeInTheDocument()
    expect(screen.getByText('(60 minutes)')).toBeInTheDocument()
  })

  it('allows user to add notes', () => {
    render(<BookingForm {...mockProps} />)

    const notesInput = screen.getByPlaceholderText(/Share what you/i)
    fireEvent.change(notesInput, { target: { value: 'Looking forward to discussing my project' } })

    expect(notesInput).toHaveValue('Looking forward to discussing my project')
  })

  it('handles successful booking for non-featured builder', async () => {
    const mockBooking = { id: 'booking-123', ...mockProps }
    vi.mocked(createBooking).mockResolvedValue({ booking: mockBooking, warning: null })

    render(<BookingForm {...mockProps} />)

    const confirmButton = screen.getByText('Confirm Booking')
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(createBooking).toHaveBeenCalledWith(expect.objectContaining({
        sessionTypeId: mockProps.sessionType.id,
        builderId: mockProps.builderId,
        clientId: mockProps.clientId,
        startTime: mockProps.selectedSlot.startTime,
        endTime: mockProps.selectedSlot.endTime,
        status: 'pending',
        builderTimezone: mockProps.builderTimezone,
      }))
    })

    // Wait for success message
    await screen.findByText('Booking Confirmed!')
  })

  it('handles booking error properly', async () => {
    const errorMessage = 'Failed to create booking'
    vi.mocked(createBooking).mockRejectedValue(new Error(errorMessage))

    render(<BookingForm {...mockProps} />)

    const confirmButton = screen.getByText('Confirm Booking')
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to create booking. Please try again.')
      expect(screen.getByText(/Failed to process booking/)).toBeInTheDocument()
    })
  })
})
