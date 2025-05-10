/**
 * Database reset utility for testing
 *
 * This module provides utilities for resetting the database between tests
 * to ensure test isolation, maintaining consistent test environments.
 */
import { PrismaClient } from '@prisma/client';
import { testClerkIds } from '../models';

/**
 * Reset the test database by truncating all tables
 * @param prisma PrismaClient instance
 */
export async function resetTestDatabase(prisma: PrismaClient): Promise<void> {
  try {
    // Get all tables (excluding Prisma's own tables)
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename NOT LIKE '_prisma%'
    `;

    // Disable foreign key checks during truncation
    await prisma.$executeRaw`SET session_replication_role = 'replica'`;

    // Truncate all tables in reverse order (to handle foreign keys)
    for (const { tablename } of tables.reverse()) {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE`);
    }

    // Re-enable foreign key checks
    await prisma.$executeRaw`SET session_replication_role = 'origin'`;

    console.log(`🧹 Successfully reset test database (${tables.length} tables truncated)`);
  } catch (error) {
    console.error('Failed to reset test database:', error);
    throw error;
  }
}

/**
 * Initialize a test database with the proper schema
 * @param url Database URL to initialize
 */
export async function initializeTestDatabase(url?: string): Promise<void> {
  // Create a new client with optional custom URL
  const prisma = url 
    ? new PrismaClient({ datasources: { db: { url } } })
    : new PrismaClient();

  try {
    // Run a simple query to check connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('Database connection successful');

    // Reset database to clean state
    await resetTestDatabase(prisma);
    
    console.log('Test database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize test database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}