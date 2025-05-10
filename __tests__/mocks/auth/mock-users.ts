// Mock user data for different user types
export const mockUsers = {
  client: {
    id: 'client-123',
    email: 'client@example.com',
    name: 'Client User',
    role: 'CLIENT',
    metadata: {
      preferences: {
        theme: 'light',
        notifications: true
      }
    }
  },
  builder: {
    id: 'builder-456',
    email: 'builder@example.com',
    name: 'Builder User',
    role: 'BUILDER',
    metadata: {
      expertise: ['React', 'NextJS', 'TypeScript'],
      hourlyRate: 150,
      availability: ['Monday', 'Wednesday', 'Friday']
    }
  },
  admin: {
    id: 'admin-789',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'ADMIN',
    metadata: {
      adminLevel: 'super',
      permissions: ['read', 'write', 'delete', 'manage-users']
    }
  },
  unauthenticated: null
};