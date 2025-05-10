import { http, HttpResponse } from 'msw';
import { mockSessionTypes } from './mock-session-types';
import { mockTimeSlots } from './mock-data';

export const mockSchedulingHandlers = [
  // Get session types for a builder
  http.get('/api/scheduling/builders/:builderId/session-types', ({ params }) => {
    const { builderId } = params;
    const sessions = mockSessionTypes.filter(s => s.builderId === builderId);

    return HttpResponse.json(sessions);
  }),

  // Get specific session type
  http.get('/api/scheduling/session-types/:sessionTypeId', ({ params }) => {
    const { sessionTypeId } = params;
    const session = mockSessionTypes.find(s => s.id === sessionTypeId);

    if (!session) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(session);
  }),

  // Get available time slots
  http.get('/api/scheduling/availability', ({ request }) => {
    const url = new URL(request.url);
    const builderId = url.searchParams.get('builderId');
    const sessionTypeId = url.searchParams.get('sessionTypeId');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    // Filter time slots based on params
    let filtered = mockTimeSlots;
    if (builderId) {
      filtered = filtered.filter(slot => slot.builderId === builderId);
    }
    if (sessionTypeId) {
      filtered = filtered.filter(slot => slot.sessionTypeId === sessionTypeId);
    }

    return HttpResponse.json(filtered);
  }),

  // Create a booking
  http.post('/api/scheduling/bookings', async () => {
    // In a real implementation we would create the booking here
    // For testing, we just return success with a mock booking ID
    return HttpResponse.json({
      success: true,
      bookingId: 'booking-' + Math.floor(Math.random() * 1000),
      confirmationCode: 'CONF' + Math.floor(Math.random() * 10000)
    });
  }),
];