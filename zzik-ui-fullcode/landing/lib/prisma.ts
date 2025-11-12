/**
 * Prisma Client Singleton
 * 
 * Ensures single Prisma Client instance in development to prevent
 * connection exhaustion from Next.js hot reloading.
 * 
 * In production, creates new client for each serverless function invocation.
 */

import { PrismaClient } from '@prisma/client';
import { env } from './env';

// Prevent multiple instances in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create Prisma Client with logging configuration
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: env.isDevelopment 
    ? ['query', 'info', 'warn', 'error']
    : ['error'],
  errorFormat: 'pretty',
});

// Store in global to reuse in development
if (env.isDevelopment) {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown
if (typeof window === 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}

/**
 * Test database connection
 * 
 * @returns True if connected successfully
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

/**
 * Get database health status
 * 
 * @returns Database health information
 */
export async function getDatabaseHealth(): Promise<{
  connected: boolean;
  latency?: number;
  error?: string;
}> {
  const startTime = Date.now();
  
  try {
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - startTime;
    
    return {
      connected: true,
      latency,
    };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Execute transaction with retry logic
 * 
 * @param fn - Transaction function
 * @param maxRetries - Maximum retry attempts
 * @returns Transaction result
 */
export async function withTransaction<T>(
  fn: (tx: PrismaClient) => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await prisma.$transaction(async (tx) => {
        return await fn(tx as PrismaClient);
      });
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      // Don't retry on certain errors
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        throw error;
      }
      
      // Wait before retry with exponential backoff
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

/**
 * Paginate query results
 * 
 * @param model - Prisma model
 * @param options - Pagination options
 * @returns Paginated results with metadata
 */
export async function paginate<T>(
  model: any,
  options: {
    page?: number;
    pageSize?: number;
    where?: any;
    orderBy?: any;
  }
): Promise<{
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}> {
  const page = Math.max(1, options.page || 1);
  const pageSize = Math.min(100, Math.max(1, options.pageSize || 10));
  const skip = (page - 1) * pageSize;
  
  const [data, totalItems] = await Promise.all([
    model.findMany({
      where: options.where,
      orderBy: options.orderBy,
      skip,
      take: pageSize,
    }),
    model.count({ where: options.where }),
  ]);
  
  const totalPages = Math.ceil(totalItems / pageSize);
  
  return {
    data,
    pagination: {
      page,
      pageSize,
      totalPages,
      totalItems,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

/**
 * Soft delete (mark as inactive)
 * 
 * @param model - Prisma model
 * @param id - Record ID
 * @returns Updated record
 */
export async function softDelete(model: any, id: string) {
  return model.update({
    where: { id },
    data: { isActive: false, updatedAt: new Date() },
  });
}

/**
 * Bulk upsert (insert or update)
 * 
 * @param model - Prisma model
 * @param data - Array of records to upsert
 * @param uniqueKey - Field used to identify existing records
 * @returns Number of records created/updated
 */
export async function bulkUpsert<T extends Record<string, any>>(
  model: any,
  data: T[],
  uniqueKey: keyof T
): Promise<{ created: number; updated: number }> {
  let created = 0;
  let updated = 0;
  
  for (const item of data) {
    const existing = await model.findUnique({
      where: { [uniqueKey]: item[uniqueKey] },
    });
    
    if (existing) {
      await model.update({
        where: { [uniqueKey]: item[uniqueKey] },
        data: item,
      });
      updated++;
    } else {
      await model.create({ data: item });
      created++;
    }
  }
  
  return { created, updated };
}

/**
 * Get record by ID with caching
 * 
 * @param model - Prisma model
 * @param id - Record ID
 * @param cacheTTL - Cache time-to-live in seconds
 * @returns Record or null
 */
const cache = new Map<string, { data: any; expiry: number }>();

export async function findByIdCached<T>(
  model: any,
  id: string,
  cacheTTL = 60
): Promise<T | null> {
  const cacheKey = `${model.name}:${id}`;
  const cached = cache.get(cacheKey);
  
  if (cached && cached.expiry > Date.now()) {
    return cached.data as T;
  }
  
  const data = await model.findUnique({ where: { id } });
  
  if (data) {
    cache.set(cacheKey, {
      data,
      expiry: Date.now() + (cacheTTL * 1000),
    });
  }
  
  return data;
}

/**
 * Clear cache for a specific model or all cache
 * 
 * @param modelName - Model name to clear (optional)
 */
export function clearCache(modelName?: string): void {
  if (modelName) {
    for (const key of cache.keys()) {
      if (key.startsWith(`${modelName}:`)) {
        cache.delete(key);
      }
    }
  } else {
    cache.clear();
  }
}

/**
 * Execute raw SQL query safely
 * 
 * @param query - SQL query string
 * @param params - Query parameters
 * @returns Query results
 */
export async function executeRawQuery<T = any>(
  query: string,
  ...params: any[]
): Promise<T[]> {
  try {
    return await prisma.$queryRawUnsafe<T[]>(query, ...params);
  } catch (error) {
    console.error('Raw query execution failed:', error);
    throw error;
  }
}

/**
 * Get database statistics
 * 
 * @returns Database statistics
 */
export async function getDatabaseStats() {
  const [
    userCount,
    placeCount,
    checkInCount,
    voucherCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.place.count(),
    prisma.checkIn.count(),
    prisma.voucher.count(),
  ]);
  
  return {
    users: userCount,
    places: placeCount,
    checkIns: checkInCount,
    vouchers: voucherCount,
  };
}

/**
 * Middleware for automatic timestamp updates
 */
prisma.$use(async (params, next) => {
  if (params.action === 'update' || params.action === 'updateMany') {
    if (params.args.data) {
      params.args.data.updatedAt = new Date();
    }
  }
  
  return next(params);
});

/**
 * Type-safe query builder helper
 */
export type WhereCondition<T> = Partial<T> & {
  AND?: WhereCondition<T>[];
  OR?: WhereCondition<T>[];
  NOT?: WhereCondition<T>;
};

/**
 * Build complex where conditions
 * 
 * @param conditions - Array of conditions
 * @returns Combined where clause
 */
export function buildWhereClause<T>(
  conditions: Array<Partial<T>>
): WhereCondition<T> {
  if (conditions.length === 0) {
    return {};
  }
  if (conditions.length === 1) {
    return conditions[0] as WhereCondition<T>;
  }
  
  return { AND: conditions as WhereCondition<T>[] };
}

/**
 * Export Prisma types for use in application
 */
export type { 
  User, 
  Place, 
  CheckIn, 
  Voucher, 
  Review, 
  Session,
  WebVital,
  ErrorLog,
  Category,
  CheckInStatus,
  VoucherType,
  VoucherStatus,
} from '@prisma/client';
