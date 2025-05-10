import { PrismaClient } from '@prisma/client'
import { enhancedLogger } from './enhanced-logger'

/**
 * PrismaClient is attached to the `global` object in development to prevent
 * exhausting your database connection limit.
 * Learn more:
 * https://pris.ly/d/help/next-js-best-practices
 */

// Create a database-specific logger instance
const dbLogger = enhancedLogger.child({ domain: 'database' })

// Define Prisma client options based on environment
const prismaOptions = {
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
}

// Define global type for Prisma instance
const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Create or reuse Prisma instance
export const db = globalForPrisma.prisma || new PrismaClient(prismaOptions)

// Setup event listeners for logging in non-production environments
if (process.env.NODE_ENV !== 'production') {
  db.$on('query', (e) => {
    if (process.env.DEBUG_PRISMA_QUERIES === 'true') {
      dbLogger.debug('Prisma Query', {
        query: e.query,
        params: e.params,
        duration: e.duration,
      })
    }
  })

  db.$on('error', (e) => {
    dbLogger.error('Prisma Error', {
      message: e.message,
      target: e.target,
    })
  })

  db.$on('info', (e) => {
    dbLogger.info('Prisma Info', {
      message: e.message,
      target: e.target,
    })
  })

  db.$on('warn', (e) => {
    dbLogger.warn('Prisma Warning', {
      message: e.message,
      target: e.target,
    })
  })

  // Assign to global to prevent multiple instances in development
  globalForPrisma.prisma = db
}

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
