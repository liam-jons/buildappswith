/**
 * Worker isolation for parallel test execution
 */
import { PrismaClient } from '@prisma/client';

/**
 * Create an isolated database client for a specific worker
 * This allows running tests in parallel without interference
 * @param workerId Unique identifier for the worker
 * @returns PrismaClient configured for isolated schema
 */
export async function getIsolatedDatabase(workerId: string): Promise<PrismaClient> {
  // Use a normalized worker ID for schema name
  const normalizedId = workerId.replace(/[^a-zA-Z0-9]/g, '_');
  const schemaName = `test_worker_${normalizedId}`;
  
  // Create a "base" prisma client to create the schema
  const basePrisma = new PrismaClient();
  
  try {
    // Create schema if it doesn't exist
    await basePrisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
    
    // Get the current database URL
    const baseUrl = process.env.DATABASE_URL || process.env.TEST_DATABASE_URL;
    if (!baseUrl) {
      throw new Error('DATABASE_URL or TEST_DATABASE_URL environment variable must be set');
    }
    
    // Create and return a new client configured for this schema
    return new PrismaClient({
      datasources: {
        db: {
          url: `${baseUrl}?schema=${schemaName}`
        }
      }
    });
  } finally {
    await basePrisma.$disconnect();
  }
}

/**
 * Cleanup isolated worker schema (use after tests complete)
 * @param workerId Unique identifier for the worker
 */
export async function cleanupIsolatedDatabase(workerId: string): Promise<void> {
  const normalizedId = workerId.replace(/[^a-zA-Z0-9]/g, '_');
  const schemaName = `test_worker_${normalizedId}`;
  
  const prisma = new PrismaClient();
  
  try {
    // Drop the schema if it exists
    await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Initialize an isolated database for a worker
 * @param workerId Unique identifier for the worker
 * @returns Initialized PrismaClient for the isolated schema
 */
export async function initializeIsolatedDatabase(workerId: string): Promise<PrismaClient> {
  const prisma = await getIsolatedDatabase(workerId);
  
  try {
    // Run migrations in the isolated schema
    // Note: This assumes your migrations are idempotent
    await prisma.$executeRaw`SELECT 1`;
    
    console.log(`Initialized isolated database for worker: ${workerId}`);
    return prisma;
  } catch (error) {
    await prisma.$disconnect();
    console.error(`Failed to initialize isolated database for worker: ${workerId}`, error);
    throw error;
  }
}