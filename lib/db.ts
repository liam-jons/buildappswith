import { PrismaClient } from '@prisma/client'
import { createDomainLogger } from './logger'

/**
 * PrismaClient is attached to the `global` object in development to prevent
 * exhausting your database connection limit.
 * Learn more:
 * https://pris.ly/d/help/next-js-best-practices
 */

// Create a database-specific logger instance
const dbLogger = createDomainLogger('database')

// Define global type for Prisma instance
const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Create or reuse Prisma instance with simplified logging
export const db = globalForPrisma.prisma || new PrismaClient({
  log: ['query', 'error', 'info', 'warn'],
})

// Assign to global to prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}

// Note: Advanced Prisma event logging can be added back later if needed
// For now, basic logging is handled via the log configuration in PrismaClient

// Export prisma alias for backward compatibility
export const prisma = db

/**
 * Check database connection health
 * @returns Promise<boolean> True if connection is healthy, false otherwise
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    // Simple query to check connection
    await db.$queryRaw`SELECT 1 as connection_test`
    return true
  } catch (error) {
    dbLogger.error('Database connection check failed', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    return false
  }
}

/**
 * DatabaseOperationError - Standardized error for database operations
 */
export class DatabaseOperationError extends Error {
  public readonly originalError?: Error
  public readonly code: string

  constructor(message: string, originalError?: Error, code = 'DB_OPERATION_ERROR') {
    super(message)
    this.name = 'DatabaseOperationError'
    this.originalError = originalError
    this.code = code
  }
}

/**
 * Safely execute a database operation with standardized error handling
 * @param operation Function that performs a database operation
 * @param operationName Name of the operation for logging
 * @returns Result of the operation
 * @throws DatabaseOperationError if operation fails
 */
export async function withDatabaseErrorHandling<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    dbLogger.error(`Database operation '${operationName}' failed`, {
      operation: operationName,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })

    throw new DatabaseOperationError(
      `Failed to perform operation: ${operationName}`,
      error instanceof Error ? error : new Error(String(error))
    )
  }
}
