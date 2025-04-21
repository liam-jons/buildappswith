import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'

// Mock Prisma client
export const prismaMock = mockDeep<PrismaClient>()

// Override the actual prisma client with our mock
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  prisma: prismaMock,
}))

// Reset the mock before each test
beforeEach(() => {
  mockReset(prismaMock)
})
