/**
 * Profile Server Actions Tests
 * 
 * Tests for the profile management server actions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { auth } from '@clerk/nextjs/server'

import { 
  getCurrentBuilderProfile,
  getBuilderProfileBySlug,
  updateBuilderProfile,
  updateExpertiseAreas,
  getSessionTypes,
  updateSessionType,
  deleteSessionType
} from '../../lib/profile/actions'

// Mock Clerk authentication
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn()
}))

// Mock Next.js cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}))

// Mock Prisma
vi.mock('@prisma/client', () => {
  const mockPrismaClient = {
    user: {
      findUnique: vi.fn(),
    },
    builderProfile: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    sessionType: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    $disconnect: vi.fn(),
  }
  
  return {
    PrismaClient: vi.fn(() => mockPrismaClient)
  }
})

// Mock logger
vi.mock('../../lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }
}))

describe('Profile Server Actions', () => {
  const mockClerkId = 'user_test123'
  const mockUserId = 'test-user-id'
  const mockProfileId = 'test-profile-id'
  
  const mockUser = {
    id: mockUserId,
    name: 'Test User',
    email: 'test@example.com',
    clerkId: mockClerkId,
    builderProfile: {
      id: mockProfileId,
      userId: mockUserId,
      bio: 'Test bio',
      headline: 'Test headline',
      slug: 'test-user',
      tagline: 'Test tagline',
      displayName: 'Test Display Name',
      validationTier: 2,
      domains: ['Test Domain'],
      badges: ['Test Badge'],
      completedProjects: 5,
      responseRate: 95,
      hourlyRate: { toNumber: () => 100 },
      availableForHire: true,
      adhd_focus: true,
      expertiseAreas: {
        TEST_AREA: {
          description: 'Test description',
          bulletPoints: ['Test point'],
          testimonials: []
        }
      },
      socialLinks: { website: 'https://example.com' },
      portfolioItems: [{ id: 'test-project', title: 'Test Project' }],
      featured: true,
      searchable: true,
      availability: 'available',
      topSkills: ['Test Skill']
    }
  }
  
  beforeEach(() => {
    // Set up default mocks
    vi.mocked(auth).mockReturnValue({ userId: mockClerkId } as any)
  })
  
  afterEach(() => {
    vi.clearAllMocks()
  })
  
  describe('getCurrentBuilderProfile', () => {
    it('should return null if user is not authenticated', async () => {
      vi.mocked(auth).mockReturnValue({ userId: null } as any)
      
      const result = await getCurrentBuilderProfile()
      
      expect(result).toBeNull()
    })
    
    it('should return null if user has no builder profile', async () => {
      const prisma = new (await import('@prisma/client')).PrismaClient()
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ ...mockUser, builderProfile: null })
      
      const result = await getCurrentBuilderProfile()
      
      expect(result).toBeNull()
    })
    
    it('should return the builder profile for authenticated user', async () => {
      const prisma = new (await import('@prisma/client')).PrismaClient()
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser)
      
      const result = await getCurrentBuilderProfile()
      
      expect(result).not.toBeNull()
      expect(result?.userId).toBe(mockUserId)
      expect(result?.profile.id).toBe(mockProfileId)
    })
  })
  
  describe('getSessionTypes', () => {
    const mockSessionTypes = [
      {
        id: 'session-1',
        builderId: mockProfileId,
        title: 'Test Session 1',
        description: 'Test Description 1',
        durationMinutes: 30,
        price: { toNumber: () => 50 },
        currency: 'USD',
        isActive: true,
        color: '#ff0000',
      },
      {
        id: 'session-2',
        builderId: mockProfileId,
        title: 'Test Session 2',
        description: 'Test Description 2',
        durationMinutes: 60,
        price: { toNumber: () => 100 },
        currency: 'USD',
        isActive: true,
      }
    ]
    
    it('should return session types for a given builder ID', async () => {
      const prisma = new (await import('@prisma/client')).PrismaClient()
      vi.mocked(prisma.sessionType.findMany).mockResolvedValue(mockSessionTypes)
      
      const result = await getSessionTypes(mockProfileId)
      
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('session-1')
      expect(result[1].id).toBe('session-2')
      expect(prisma.sessionType.findMany).toHaveBeenCalledWith({
        where: { builderId: mockProfileId },
        orderBy: { durationMinutes: 'asc' }
      })
    })
    
    it('should return session types for the current user when no builder ID is provided', async () => {
      const prisma = new (await import('@prisma/client')).PrismaClient()
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser)
      vi.mocked(prisma.sessionType.findMany).mockResolvedValue(mockSessionTypes)
      
      const result = await getSessionTypes()
      
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('session-1')
      expect(result[1].id).toBe('session-2')
      expect(prisma.sessionType.findMany).toHaveBeenCalledWith({
        where: { builderId: mockProfileId },
        orderBy: { durationMinutes: 'asc' }
      })
    })
    
    it('should return an empty array if user has no builder profile', async () => {
      const prisma = new (await import('@prisma/client')).PrismaClient()
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ ...mockUser, builderProfile: null })
      
      const result = await getSessionTypes()
      
      expect(result).toEqual([])
    })
  })
})