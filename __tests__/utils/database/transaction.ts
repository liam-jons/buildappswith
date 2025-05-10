/**
 * Transaction-based testing utilities
 */
import { PrismaClient } from '@prisma/client';

/**
 * Execute a test within a transaction and rollback afterward
 * @param callback Function to execute within a transaction
 * @returns The result of the callback function
 */
export async function withTestTransaction<T>(
  callback: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  const prisma = new PrismaClient();

  try {
    // Begin transaction
    await prisma.$executeRaw`BEGIN`;

    // Execute test with transaction context
    const result = await callback(prisma);

    // Always rollback after test
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
    await prisma.$disconnect();
  }
}

/**
 * Execute multiple tests with the same transaction
 * This is useful for tests that need to share data but should not persist it
 * @param callback Function to execute within a transaction
 */
export async function withSharedTestTransaction<T>(
  callback: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  const prisma = new PrismaClient();
  
  try {
    // Begin transaction
    await prisma.$executeRaw`BEGIN`;
    
    // Set transaction to deferrable for better performance
    await prisma.$executeRaw`SET TRANSACTION ISOLATION LEVEL SERIALIZABLE`;
    
    // Execute tests with shared transaction context
    const result = await callback(prisma);
    
    // Always rollback after tests
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
    await prisma.$disconnect();
  }
}