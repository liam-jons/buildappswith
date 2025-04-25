import { UserRole } from '@/lib/auth/types';

/**
 * Mock user data for testing
 */
export const mockUsers = {
  // Client role user
  client: {
    id: 'client-user-id',
    clerkId: 'clerk-client-id',
    name: 'Client User',
    email: 'client@example.com',
    image: '/images/avatar-placeholder.png',
    roles: [UserRole.CLIENT],
    verified: true,
    stripeCustomerId: 'stripe-client-id',
  },
  
  // Builder role user
  builder: {
    id: 'builder-user-id',
    clerkId: 'clerk-builder-id',
    name: 'Builder User',
    email: 'builder@example.com',
    image: '/images/avatar-placeholder.png',
    roles: [UserRole.BUILDER],
    verified: true,
    stripeCustomerId: 'stripe-builder-id',
  },
  
  // Admin role user
  admin: {
    id: 'admin-user-id',
    clerkId: 'clerk-admin-id',
    name: 'Admin User',
    email: 'admin@example.com',
    image: '/images/avatar-placeholder.png',
    roles: [UserRole.ADMIN],
    verified: true,
    stripeCustomerId: 'stripe-admin-id',
  },
  
  // Multi-role user (client + builder)
  multiRole: {
    id: 'multi-role-user-id',
    clerkId: 'clerk-multi-role-id',
    name: 'Multi Role User',
    email: 'multirole@example.com',
    image: '/images/avatar-placeholder.png',
    roles: [UserRole.CLIENT, UserRole.BUILDER],
    verified: true,
    stripeCustomerId: 'stripe-multi-role-id',
  },
  
  // Unverified user
  unverified: {
    id: 'unverified-user-id',
    clerkId: 'clerk-unverified-id',
    name: 'Unverified User',
    email: 'unverified@example.com',
    image: '/images/avatar-placeholder.png',
    roles: [UserRole.CLIENT],
    verified: false,
    stripeCustomerId: null,
  },
};

/**
 * Function to create a custom mock user by extending one of the base mock users
 * @param baseUser The base user to extend (e.g., 'client', 'builder')
 * @param overrides Properties to override in the base user
 * @returns A new mock user with the overridden properties
 */
export function createMockUser(baseUser: keyof typeof mockUsers, overrides: Partial<typeof mockUsers.client> = {}) {
  return {
    ...mockUsers[baseUser],
    ...overrides,
  };
}
