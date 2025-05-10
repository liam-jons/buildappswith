import { mockUsers } from '../mocks/auth/mock-users';
import { mockBuilders } from '../mocks/marketplace/mock-builders';
import { mockProfiles } from '../mocks/profile/mock-profiles';
import { mockSessionTypes } from '../mocks/scheduling/mock-session-types';
import { mockTimeSlots, mockBookings } from '../mocks/scheduling/mock-data';

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Define types for options
type UserOptions = DeepPartial<typeof mockUsers.client>;
type BuilderOptions = DeepPartial<typeof mockBuilders[0]>;
type ProfileOptions = DeepPartial<typeof mockProfiles[0]>;
type SessionTypeOptions = DeepPartial<typeof mockSessionTypes[0]>;
type BookingOptions = DeepPartial<typeof mockBookings[0]>;
type TimeSlotOptions = DeepPartial<typeof mockTimeSlots[0]>;

// Factory functions for creating mock data instances
const createUser = (type: keyof typeof mockUsers = 'client', options: UserOptions = {}) => {
  const baseUser = mockUsers[type];
  if (!baseUser) return null; // Handle unauthenticated case
  
  return {
    ...baseUser,
    ...options,
    metadata: {
      ...baseUser.metadata,
      ...options.metadata
    }
  };
};

const createBuilder = (options: BuilderOptions = {}) => {
  const baseBuilder = { ...mockBuilders[0] };
  return {
    ...baseBuilder,
    id: `builder-${Math.floor(Math.random() * 1000)}`,
    ...options,
    socialLinks: {
      ...baseBuilder.socialLinks,
      ...options.socialLinks
    }
  };
};

const createProfile = (role: 'BUILDER' | 'CLIENT' = 'BUILDER', options: ProfileOptions = {}) => {
  const baseProfile = role === 'BUILDER' ? { ...mockProfiles[0] } : { ...mockProfiles[1] };
  return {
    ...baseProfile,
    id: `profile-${Math.floor(Math.random() * 1000)}`,
    ...options,
    projects: options.projects || [...(baseProfile.projects || [])],
    socialLinks: {
      ...baseProfile.socialLinks,
      ...options.socialLinks
    }
  };
};

const createSessionType = (builderId: string = 'builder-1', options: SessionTypeOptions = {}) => {
  const baseSessionType = { ...mockSessionTypes[0] };
  return {
    ...baseSessionType,
    id: `session-${Math.floor(Math.random() * 1000)}`,
    builderId,
    ...options,
    availability: {
      ...baseSessionType.availability,
      ...options.availability
    }
  };
};

const createTimeSlot = (builderId: string = 'builder-1', sessionTypeId: string = 'session-1', options: TimeSlotOptions = {}) => {
  // Generate a date one day from now
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 1);
  startDate.setHours(9, 0, 0, 0);
  
  const endDate = new Date(startDate);
  endDate.setMinutes(startDate.getMinutes() + 30);
  
  return {
    id: `slot-${Math.floor(Math.random() * 1000)}`,
    builderId,
    sessionTypeId,
    startTime: startDate.toISOString(),
    endTime: endDate.toISOString(),
    available: true,
    ...options
  };
};

const createBooking = (clientId: string = 'client-123', builderId: string = 'builder-1', options: BookingOptions = {}) => {
  // Generate dates for the booking
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 2);
  startDate.setHours(10, 0, 0, 0);
  
  const endDate = new Date(startDate);
  endDate.setMinutes(startDate.getMinutes() + 60);
  
  const createdDate = new Date();
  
  return {
    id: `booking-${Math.floor(Math.random() * 1000)}`,
    clientId,
    builderId,
    sessionTypeId: options.sessionTypeId || 'session-1',
    timeSlotId: options.timeSlotId || `slot-${Math.floor(Math.random() * 1000)}`,
    status: 'confirmed',
    startTime: options.startTime || startDate.toISOString(),
    endTime: options.endTime || endDate.toISOString(),
    createdAt: createdDate.toISOString(),
    updatedAt: createdDate.toISOString(),
    ...options
  };
};

// Export the mock factory with all factory functions
export const mockFactory = {
  user: createUser,
  builder: createBuilder,
  profile: createProfile,
  sessionType: createSessionType,
  timeSlot: createTimeSlot,
  booking: createBooking
};