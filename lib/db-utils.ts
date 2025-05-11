/**
 * Database Utility Functions
 * @module lib/db-utils
 *
 * Provides standardized helper functions for common database operations.
 */

import { db } from './db';
import { withDatabaseOperation, withDatabaseRetry } from './db-error-handling';
import { createDomainLogger } from './logger';

const dbUtilsLogger = createDomainLogger('database-utils');

/**
 * Generic type for database queries with a schema
 */
export type SchemaValidator<T> = {
  parse: (data: unknown) => T;
  safeParse: (data: unknown) => { success: boolean; data?: T; error?: Error };
};

/**
 * Options for paginated queries
 */
export interface PaginationOptions {
  page?: number;
  pageSize?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

/**
 * Result of a paginated query
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Creates pagination parameters for Prisma queries
 * @param options Pagination options
 * @returns Object with skip and take parameters for Prisma
 */
export function createPaginationParams(options: PaginationOptions = {}) {
  const {
    page = 1,
    pageSize = 20,
    orderBy = 'createdAt',
    orderDirection = 'desc',
  } = options;

  const skip = (page - 1) * pageSize;
  const take = pageSize;

  return {
    skip,
    take,
    orderBy: { [orderBy]: orderDirection },
  };
}

/**
 * Performs a safe database read operation with validation
 * @param operation Function to execute the database query
 * @param operationName Name of the operation for logging
 * @param validator Optional schema validator for the result
 * @returns Validated query result
 */
export async function safeDbRead<T, V = T>(
  operation: () => Promise<T>,
  operationName: string,
  validator?: SchemaValidator<V>
): Promise<V | T> {
  return withDatabaseOperation(
    async () => {
      const result = await operation();
      
      // Validate result if validator is provided
      if (validator) {
        try {
          return validator.parse(result);
        } catch (validationError) {
          dbUtilsLogger.warn(`Validation error in ${operationName}`, {
            error: validationError instanceof Error ? validationError.message : String(validationError),
            result,
          });
          throw validationError;
        }
      }
      
      return result;
    },
    operationName
  );
}

/**
 * Performs a database write operation with proper error handling
 * @param operation Function to execute the database mutation
 * @param operationName Name of the operation for logging
 * @param model Model name for context
 * @param args Operation arguments for context
 * @returns Result of the write operation
 */
export async function safeDbWrite<T>(
  operation: () => Promise<T>,
  operationName: string,
  model?: string,
  args?: any
): Promise<T> {
  return withDatabaseRetry(
    operation,
    operationName,
    { model, args }
  );
}

/**
 * Executes a database transaction with proper error handling
 * @param operations Function that performs multiple operations in a transaction
 * @param operationName Name of the transaction for logging
 * @returns Result of the transaction
 */
export async function safeDbTransaction<T>(
  operations: (tx: any) => Promise<T>,
  operationName: string
): Promise<T> {
  return withDatabaseOperation(
    () => db.$transaction(operations),
    `transaction:${operationName}`
  );
}

/**
 * Performs a paginated database query with total count
 * @param queryFn Function that returns the query result for the current page
 * @param countFn Function that returns the total count
 * @param options Pagination options
 * @param operationName Name of the operation for logging
 * @returns Paginated result with metadata
 */
export async function paginatedQuery<T>(
  queryFn: (paginationParams: any) => Promise<T[]>,
  countFn: () => Promise<number>,
  options: PaginationOptions = {},
  operationName: string
): Promise<PaginatedResult<T>> {
  const {
    page = 1,
    pageSize = 20,
  } = options;

  const paginationParams = createPaginationParams(options);

  return withDatabaseOperation(
    async () => {
      // Run query and count in parallel
      const [data, totalItems] = await Promise.all([
        queryFn(paginationParams),
        countFn(),
      ]);

      const totalPages = Math.ceil(totalItems / pageSize);

      return {
        data,
        pagination: {
          totalItems,
          totalPages,
          currentPage: page,
          pageSize,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    },
    `paginated:${operationName}`
  );
}

/**
 * Checks if a record exists
 * @param model Model name
 * @param where Where condition
 * @returns True if record exists, false otherwise
 */
export async function recordExists(
  model: string,
  where: Record<string, any>
): Promise<boolean> {
  const modelAny = (db as any)[model];
  
  if (!modelAny) {
    throw new Error(`Model '${model}' does not exist on the Prisma client`);
  }

  return withDatabaseOperation(
    async () => {
      const count = await modelAny.count({ where });
      return count > 0;
    },
    `exists:${model}`
  );
}

/**
 * Safely upserts a record with proper error handling
 * @param model Model name
 * @param data Create and update data
 * @param where Where condition for finding existing record
 * @returns The created or updated record
 */
export async function safeUpsert<T>(
  model: string,
  data: { create: any; update: any },
  where: Record<string, any>
): Promise<T> {
  const modelAny = (db as any)[model];
  
  if (!modelAny) {
    throw new Error(`Model '${model}' does not exist on the Prisma client`);
  }

  return withDatabaseOperation(
    () => modelAny.upsert({
      where,
      create: data.create,
      update: data.update,
    }),
    `upsert:${model}`,
    model,
    { where, create: data.create, update: data.update }
  );
}

/**
 * Safely creates a record with proper error handling
 * @param model Model name
 * @param data Create data
 * @returns The created record
 */
export async function safeCreate<T>(
  model: string,
  data: any
): Promise<T> {
  const modelAny = (db as any)[model];
  
  if (!modelAny) {
    throw new Error(`Model '${model}' does not exist on the Prisma client`);
  }

  return withDatabaseOperation(
    () => modelAny.create({ data }),
    `create:${model}`,
    model,
    { data }
  );
}

/**
 * Safely updates a record with proper error handling
 * @param model Model name
 * @param where Where condition
 * @param data Update data
 * @returns The updated record
 */
export async function safeUpdate<T>(
  model: string,
  where: Record<string, any>,
  data: any
): Promise<T> {
  const modelAny = (db as any)[model];
  
  if (!modelAny) {
    throw new Error(`Model '${model}' does not exist on the Prisma client`);
  }

  return withDatabaseOperation(
    () => modelAny.update({
      where,
      data,
    }),
    `update:${model}`,
    model,
    { where, data }
  );
}

/**
 * Safely deletes a record with proper error handling
 * @param model Model name
 * @param where Where condition
 * @returns The deleted record
 */
export async function safeDelete<T>(
  model: string,
  where: Record<string, any>
): Promise<T> {
  const modelAny = (db as any)[model];
  
  if (!modelAny) {
    throw new Error(`Model '${model}' does not exist on the Prisma client`);
  }

  return withDatabaseOperation(
    () => modelAny.delete({ where }),
    `delete:${model}`,
    model,
    { where }
  );
}

/**
 * Safely finds a record with proper error handling
 * @param model Model name
 * @param args Query arguments
 * @returns The found record or null
 */
export async function safeFindUnique<T>(
  model: string,
  args: { where: Record<string, any>; include?: Record<string, any>; select?: Record<string, any> }
): Promise<T | null> {
  const modelAny = (db as any)[model];
  
  if (!modelAny) {
    throw new Error(`Model '${model}' does not exist on the Prisma client`);
  }

  return withDatabaseOperation(
    () => modelAny.findUnique(args),
    `findUnique:${model}`,
    model,
    args
  );
}

/**
 * Safely finds multiple records with proper error handling
 * @param model Model name
 * @param args Query arguments
 * @returns Array of found records
 */
export async function safeFindMany<T>(
  model: string,
  args: { 
    where?: Record<string, any>; 
    include?: Record<string, any>; 
    select?: Record<string, any>;
    orderBy?: Record<string, any>;
    skip?: number;
    take?: number;
  }
): Promise<T[]> {
  const modelAny = (db as any)[model];
  
  if (!modelAny) {
    throw new Error(`Model '${model}' does not exist on the Prisma client`);
  }

  return withDatabaseOperation(
    () => modelAny.findMany(args),
    `findMany:${model}`,
    model,
    args
  );
}