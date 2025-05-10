// Mock data for time slots
export const mockTimeSlots = [
  // Builder 1, Session Type 1 (Initial Consultation)
  {
    id: 'slot-1',
    builderId: 'builder-1',
    sessionTypeId: 'session-1',
    startTime: '2025-05-10T09:00:00Z',
    endTime: '2025-05-10T09:30:00Z',
    available: true
  },
  {
    id: 'slot-2',
    builderId: 'builder-1',
    sessionTypeId: 'session-1',
    startTime: '2025-05-10T10:00:00Z',
    endTime: '2025-05-10T10:30:00Z',
    available: true
  },
  {
    id: 'slot-3',
    builderId: 'builder-1',
    sessionTypeId: 'session-1',
    startTime: '2025-05-10T11:00:00Z',
    endTime: '2025-05-10T11:30:00Z',
    available: false // already booked
  },
  
  // Builder 1, Session Type 2 (Technical Deep Dive)
  {
    id: 'slot-4',
    builderId: 'builder-1',
    sessionTypeId: 'session-2',
    startTime: '2025-05-11T09:00:00Z',
    endTime: '2025-05-11T10:00:00Z',
    available: true
  },
  {
    id: 'slot-5',
    builderId: 'builder-1',
    sessionTypeId: 'session-2',
    startTime: '2025-05-11T11:00:00Z',
    endTime: '2025-05-11T12:00:00Z',
    available: true
  },
  
  // Builder 2, Session Type 3 (UX Review)
  {
    id: 'slot-6',
    builderId: 'builder-2',
    sessionTypeId: 'session-3',
    startTime: '2025-05-12T13:00:00Z',
    endTime: '2025-05-12T13:45:00Z',
    available: true
  },
  {
    id: 'slot-7',
    builderId: 'builder-2',
    sessionTypeId: 'session-3',
    startTime: '2025-05-12T14:00:00Z',
    endTime: '2025-05-12T14:45:00Z',
    available: true
  },
  
  // Builder 3, Session Type 4 (Architecture Planning)
  {
    id: 'slot-8',
    builderId: 'builder-3',
    sessionTypeId: 'session-4',
    startTime: '2025-05-13T09:00:00Z',
    endTime: '2025-05-13T10:30:00Z',
    available: true
  },
  {
    id: 'slot-9',
    builderId: 'builder-3',
    sessionTypeId: 'session-4',
    startTime: '2025-05-13T11:00:00Z',
    endTime: '2025-05-13T12:30:00Z',
    available: false // already booked
  }
];

// Mock data for bookings
export const mockBookings = [
  {
    id: 'booking-1',
    clientId: 'client-123',
    builderId: 'builder-1',
    sessionTypeId: 'session-1',
    timeSlotId: 'slot-3', // corresponds to a slot marked as unavailable
    status: 'confirmed',
    startTime: '2025-05-10T11:00:00Z',
    endTime: '2025-05-10T11:30:00Z',
    createdAt: '2025-05-01T14:30:00Z',
    updatedAt: '2025-05-01T14:30:00Z'
  },
  {
    id: 'booking-2',
    clientId: 'client-123',
    builderId: 'builder-3',
    sessionTypeId: 'session-4',
    timeSlotId: 'slot-9', // corresponds to a slot marked as unavailable
    status: 'confirmed',
    startTime: '2025-05-13T11:00:00Z',
    endTime: '2025-05-13T12:30:00Z',
    createdAt: '2025-05-02T10:15:00Z',
    updatedAt: '2025-05-02T10:15:00Z'
  }
];