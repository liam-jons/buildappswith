/**
 * Prisma client instance
 * @version 1.0.110
 */

import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

// Create a singleton instance of PrismaClient
let prismaClient: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prismaClient = new PrismaClient();
} else {
  // In development, prevent multiple instances of Prisma Client in hot reloading
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient({
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
    });
  }
  prismaClient = (global as any).prisma;
}

// Set up logging for Prisma Client events
if (process.env.NODE_ENV !== 'production') {
  prismaClient.$on('query', (e) => {
    logger.debug('Prisma Query', { query: e.query, params: e.params, duration: e.duration });
  });

  prismaClient.$on('error', (e) => {
    logger.error('Prisma Error', { message: e.message, target: e.target });
  });

  prismaClient.$on('info', (e) => {
    logger.info('Prisma Info', { message: e.message, target: e.target });
  });

  prismaClient.$on('warn', (e) => {
    logger.warn('Prisma Warning', { message: e.message, target: e.target });
  });
}

export const prisma = prismaClient;
