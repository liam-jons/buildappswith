/**
 * Database testing utilities for simplified test setup and teardown
 * 
 * This module provides utilities for working with the database in tests,
 * including transaction isolation, mock Prisma clients, and test data creation.
 */
import { PrismaClient } from '@prisma/client';
import { vi } from 'vitest';

/**
 * Create a mock Prisma client with common mocked models
 * @returns A mocked PrismaClient instance
 */
export function createMockPrismaClient() {
  return {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    builderProfile: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    booking: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    sessionType: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    $transaction: vi.fn(async (callback) => await callback()),
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    $executeRaw: vi.fn(),
  };
}

/**
 * Execute a test function with a mock Prisma client
 * @param callback Function to execute with a mock Prisma client
 * @returns Result of the callback function
 */
export async function withMockPrisma<T>(
  callback: (prisma: ReturnType<typeof createMockPrismaClient>) => Promise<T>
): Promise<T> {
  const mockPrisma = createMockPrismaClient();
  return await callback(mockPrisma);
}

/**
 * Execute a test function with a real Prisma client within a transaction
 * This ensures test isolation by rolling back all changes after the test
 * 
 * @param callback Function to execute within a transaction
 * @returns Result of the callback function
 */
export async function withTestTransaction<T>(
  callback: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  const prisma = new PrismaClient();

  try {
    // Begin transaction
    await prisma.$executeRaw`BEGIN`;

    // Execute test code within transaction
    const result = await callback(prisma);

    // Rollback changes to maintain test isolation
    await prisma.$executeRaw`ROLLBACK`;

    return result;
  } catch (error) {
    // Ensure rollback on error
    try {
      await prisma.$executeRaw`ROLLBACK`;
    } catch (rollbackError) {
      console.error('Failed to rollback transaction:', rollbackError);
    }
    
    throw error;
  } finally {
    // Always disconnect to prevent connection leaks
    await prisma.$disconnect();
  }
}

/**
 * Setup function to be called before each test that needs a database
 * This should be used in beforeEach hooks
 */
export async function setupTestDatabase() {
  // This could initialize test data or set up database state
  // For now, it's a placeholder for future implementation
  return true;
}

/**
 * Teardown function to be called after each test that used a database
 * This should be used in afterEach hooks
 */
export async function teardownTestDatabase() {
  // This could clean up test data or reset database state
  // For now, it's a placeholder for future implementation
  return true;
}

/**
 * Helper to mock common Prisma errors
 */
export const mockPrismaErrors = {
  unique: new Error('Unique constraint failed'),
  notFound: new Error('Record not found'),
  foreignKey: new Error('Foreign key constraint failed'),
  connection: new Error('Database connection failed'),
  timeout: new Error('Database query timeout'),
  unauthorized: new Error('Unauthorized database access'),
};