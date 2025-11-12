/**
 * Jest Test Setup
 * 
 * Global test configuration and mocks that run before all tests.
 */

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_APP_NAME = 'ZZIK';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
process.env.NEXT_PUBLIC_MAPBOX_TOKEN = 'test-mapbox-token';
process.env.NEXT_PUBLIC_CHAIN_ID = '8453';
process.env.NEXT_PUBLIC_RPC_URL = 'https://mainnet.base.org';
process.env.NEXT_PUBLIC_USDC_CONTRACT = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
process.env.JWT_SECRET = 'test-jwt-secret-do-not-use-in-production';

// Mock fetch globally
global.fetch = jest.fn();

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

// Cleanup after tests
afterEach(() => {
  jest.restoreAllMocks();
});
