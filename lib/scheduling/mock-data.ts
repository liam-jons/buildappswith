import { 
  BuilderSchedulingProfile, 
  SessionType, 
  AvailabilityRule,
  AvailabilityException,
  Booking
} from './types';
import { addDays, subDays, format } from 'date-fns';

// Helper to generate a unique ID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

// Generate current date string in ISO format
const today = new Date();
const todayISO = today.toISOString();
const tomorrow = addDays(today, 1).toISOString();
const nextWeek = addDays(today, 7).toISOString();
const yesterday = subDays(today, 1).toISOString();

// Mock session types for development
export const mockSessionTypes: SessionType[] = [
  {
    id: 'session-1',
    builderId: 'builder-1',
    title: 'AI App Planning Session',
    description: 'Strategic planning for your AI application. We\'ll discuss requirements, approach, and create a roadmap.',
    durationMinutes: 60,
    price: 150,
    currency: 'USD',
    isActive: true,
    color: '#4CAF50' // Green
  },
  {
    id: 'session-2',
    builderId: 'builder-1',
    title: 'Code Review',
    description: 'Detailed review of your existing code with suggestions for improvements and AI integration.',
    durationMinutes: 45,
    price: 120,
    currency: 'USD',
    isActive: true,
    color: '#2196F3' // Blue
  },
  {
    id: 'session-3',
    builderId: 'builder-1',
    title: 'AI Implementation Workshop',
    description: 'Hands-on workshop to implement AI features in your application with live coding and guidance.',
    durationMinutes: 90,
    price: 225,
    currency: 'USD',
    isActive: true,
    color: '#9C27B0' // Purple
  },
  {
    id: 'session-4',
    builderId: 'builder-1',
    title: 'Quick AI Consultation',
    description: 'Quick consultation to answer specific questions about AI implementation in your project.',
    durationMinutes: 30,
    price: 75,
    currency: 'USD',
    isActive: true,
    color: '#FF9800' // Orange
  },
  {
    id: 'session-5',
    builderId: 'builder-1',
    title: 'Group Learning Session',
    description: 'Learn AI application development in a small group setting with practical examples.',
    durationMinutes: 120,
    price: 50,
    currency: 'USD',
    isActive: true,
    color: '#F44336', // Red
    maxParticipants: 8
  }
];

// Mock availability rules for a builder
export const mockAvailabilityRules: AvailabilityRule[] = [
  {
    id: 'rule-1',
    builderId: 'builder-1',
    dayOfWeek: 1, // Monday
    startTime: '09:00',
    endTime: '12:00',
    isRecurring: true
  },
  {
    id: 'rule-2',
    builderId: 'builder-1',
    dayOfWeek: 1, // Monday
    startTime: '13:00',
    endTime: '17:00',
    isRecurring: true
  },
  {
    id: 'rule-3',
    builderId: 'builder-1',
    dayOfWeek: 3, // Wednesday
    startTime: '09:00',
    endTime: '17:00',
    isRecurring: true
  },
  {
    id: 'rule-4',
    builderId: 'builder-1',
    dayOfWeek: 5, // Friday
    startTime: '10:00',
    endTime: '15:00',
    isRecurring: true
  }
];

// Mock exceptions (days off or special hours)
export const mockExceptions: AvailabilityException[] = [
  {
    id: 'exception-1',
    builderId: 'builder-1',
    date: format(addDays(today, 5), 'yyyy-MM-dd'), // 5 days from now
    isAvailable: false // Day off
  },
  {
    id: 'exception-2',
    builderId: 'builder-1',
    date: format(addDays(today, 12), 'yyyy-MM-dd'), // Next week
    isAvailable: true, // Special hours
    slots: [
      {
        id: 'special-slot-1',
        startTime: addDays(today, 12).toISOString().replace(/T.*$/, 'T13:00:00.000Z'),
        endTime: addDays(today, 12).toISOString().replace(/T.*$/, 'T15:00:00.000Z'),
        isBooked: false
      }
    ]
  }
];

// Mock bookings
export const mockBookings: Booking[] = [
  {
    id: 'booking-1',
    sessionTypeId: 'session-1',
    builderId: 'builder-1',
    clientId: 'client-1',
    startTime: tomorrow.replace(/T.*$/, 'T10:00:00.000Z'),
    endTime: tomorrow.replace(/T.*$/, 'T11:00:00.000Z'),
    status: BookingStatus.CONFIRMED,
    clientTimezone: 'America/New_York',
    builderTimezone: 'America/Los_Angeles',
    notes: 'Discuss AI app for small business inventory management',
    createdAt: yesterday,
    updatedAt: yesterday
  },
  {
    id: 'booking-2',
    sessionTypeId: 'session-3',
    builderId: 'builder-1',
    clientId: 'client-2',
    startTime: nextWeek.replace(/T.*$/, 'T14:00:00.000Z'),
    endTime: nextWeek.replace(/T.*$/, 'T15:30:00.000Z'),
    status: BookingStatus.PENDING,
    clientTimezone: 'Europe/London',
    builderTimezone: 'America/Los_Angeles',
    notes: 'Workshop on implementing GPT-4 in a customer service application',
    createdAt: today.toISOString(),
    updatedAt: today.toISOString()
  }
];

// Complete mock builder profile
export const mockBuilderSchedulingProfile: BuilderSchedulingProfile = {
  builderId: 'builder-1',
  minimumNotice: 60, // 1 hour minimum notice
  bufferBetweenSessions: 15, // 15 minutes between sessions
  maximumAdvanceBooking: 30, // Can book up to 30 days in advance
  availabilityRules: mockAvailabilityRules,
  exceptions: mockExceptions,
  sessionTypes: mockSessionTypes,
  timezone: 'America/Los_Angeles',
  isAcceptingBookings: true
};

// Mock client profile
export const mockClientProfile = {
  clientId: 'client-1',
  timezone: 'America/New_York',
  preferredSessionTypes: ['session-1', 'session-4'],
  bookings: [mockBookings[0]]
};