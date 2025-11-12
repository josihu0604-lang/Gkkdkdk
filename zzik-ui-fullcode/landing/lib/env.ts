/**
 * Environment Variable Validation and Type-Safe Access
 * 
 * Features:
 * - Type-safe environment variables
 * - Validation on startup
 * - Default values
 * - Public vs Server-only separation
 */

/**
 * Server-side environment variables (never exposed to client)
 */
export const serverEnv = {
  // Database
  POSTGRES_URL: process.env.POSTGRES_URL || '',
  
  // Redis
  KV_URL: process.env.KV_URL || '',
  KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN || '',
  
  // Authentication
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',
  
  // API Keys
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || '',
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
  
  // Internal
  INTERNAL_API_KEY: process.env.INTERNAL_API_KEY || '',
  WEBHOOK_SECRET: process.env.WEBHOOK_SECRET || '',
  
  // Logging
  LOG_ENDPOINT: process.env.LOG_ENDPOINT || '',
  LOG_LEVEL: process.env.LOG_LEVEL || 'INFO',
  
  // Sentry
  SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN || '',
} as const;

/**
 * Client-side environment variables (safe to expose)
 */
export const clientEnv = {
  // App
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'ZZIK',
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  
  // Blockchain
  CHAIN_ID: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '8453', 10),
  RPC_URL: process.env.NEXT_PUBLIC_RPC_URL || 'https://mainnet.base.org',
  USDC_CONTRACT: process.env.NEXT_PUBLIC_USDC_CONTRACT || '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
  
  // Maps
  MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '',
  GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  
  // Analytics
  GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',
  VERCEL_ANALYTICS_ID: process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID || '',
  
  // Sentry
  SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
  
  // Feature Flags
  FEATURE_GPS_KALMAN_FILTER: process.env.NEXT_PUBLIC_FEATURE_GPS_KALMAN_FILTER === 'true',
  FEATURE_WEB_VITALS: process.env.NEXT_PUBLIC_FEATURE_WEB_VITALS === 'true',
  FEATURE_ERROR_BOUNDARY: process.env.NEXT_PUBLIC_FEATURE_ERROR_BOUNDARY === 'true',
} as const;

/**
 * Combined environment (for convenience)
 */
export const env = {
  // Node environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Server-only
  server: serverEnv,
  
  // Client-safe
  client: clientEnv,
  
  // Utility flags
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
} as const;

/**
 * Validation schema
 */
interface ValidationRule {
  key: string;
  required: boolean;
  envName: string;
  description?: string;
}

const productionRequiredVars: ValidationRule[] = [
  {
    key: 'JWT_SECRET',
    required: true,
    envName: 'JWT_SECRET',
    description: 'JWT secret for token signing',
  },
  {
    key: 'NEXTAUTH_SECRET',
    required: true,
    envName: 'NEXTAUTH_SECRET',
    description: 'NextAuth secret for session encryption',
  },
  // Add more production-required vars here
];

/**
 * Validate environment variables
 */
export function validateEnv(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Skip validation in development if SKIP_ENV_VALIDATION is set
  if (env.isDevelopment && process.env.SKIP_ENV_VALIDATION === 'true') {
    console.warn('⚠️  Environment validation skipped (SKIP_ENV_VALIDATION=true)');
    return { valid: true, errors: [] };
  }
  
  // Validate production-required variables
  if (env.isProduction) {
    for (const rule of productionRequiredVars) {
      const value = process.env[rule.envName];
      if (rule.required && (!value || value === '')) {
        errors.push(
          `Missing required environment variable: ${rule.envName}${
            rule.description ? ` (${rule.description})` : ''
          }`
        );
      }
    }
    
    // Validate JWT_SECRET is not default
    if (serverEnv.JWT_SECRET === 'dev-secret-change-in-production') {
      errors.push('JWT_SECRET must be changed in production');
    }
  }
  
  // Validate chain ID
  if (isNaN(clientEnv.CHAIN_ID)) {
    errors.push('NEXT_PUBLIC_CHAIN_ID must be a valid number');
  }
  
  // Validate URLs
  try {
    new URL(clientEnv.APP_URL);
  } catch (error) {
    errors.push(`NEXT_PUBLIC_APP_URL is not a valid URL: ${clientEnv.APP_URL}`);
  }
  
  try {
    new URL(clientEnv.RPC_URL);
  } catch (error) {
    errors.push(`NEXT_PUBLIC_RPC_URL is not a valid URL: ${clientEnv.RPC_URL}`);
  }
  
  // Log results
  if (errors.length > 0) {
    console.error('❌ Environment validation failed:');
    errors.forEach((error) => console.error(`  - ${error}`));
    return { valid: false, errors };
  } else {
    console.log('✅ Environment validation passed');
    return { valid: true, errors: [] };
  }
}

/**
 * Get environment info (safe for logging)
 */
export function getEnvInfo(): Record<string, any> {
  return {
    NODE_ENV: env.NODE_ENV,
    APP_NAME: clientEnv.APP_NAME,
    APP_URL: clientEnv.APP_URL,
    CHAIN_ID: clientEnv.CHAIN_ID,
    features: {
      gpsKalmanFilter: clientEnv.FEATURE_GPS_KALMAN_FILTER,
      webVitals: clientEnv.FEATURE_WEB_VITALS,
      errorBoundary: clientEnv.FEATURE_ERROR_BOUNDARY,
    },
    hasDatabase: !!serverEnv.POSTGRES_URL,
    hasRedis: !!serverEnv.KV_URL,
    hasSentry: !!clientEnv.SENTRY_DSN,
  };
}

/**
 * Validate on module load (server-side only)
 */
if (typeof window === 'undefined') {
  const result = validateEnv();
  if (!result.valid && env.isProduction) {
    throw new Error(`Environment validation failed: ${result.errors.join(', ')}`);
  }
}
