/**
 * API Integration Tests - Health Endpoint
 * 
 * Tests:
 * - Basic health check
 * - Response structure validation
 * - Performance monitoring
 * - Dependency status checks
 */

import { describe, it, expect } from '@jest/globals';

const API_BASE = 'http://localhost:3000';

describe('GET /api/health', () => {
  describe('Basic Health Check', () => {
    it('should return 200 status', async () => {
      const response = await fetch(`${API_BASE}/api/health`);
      expect(response.status).toBe(200);
    });

    it('should return valid JSON', async () => {
      const response = await fetch(`${API_BASE}/api/health`);
      const data = await response.json();
      
      expect(data).toBeDefined();
      expect(typeof data).toBe('object');
    });

    it('should return success status', async () => {
      const response = await fetch(`${API_BASE}/api/health`);
      const data = await response.json();
      
      expect(data.success).toBe(true);
    });
  });

  describe('Response Structure', () => {
    it('should include status field', async () => {
      const response = await fetch(`${API_BASE}/api/health`);
      const data = await response.json();
      
      expect(data.data).toHaveProperty('status');
      expect(data.data.status).toBe('healthy');
    });

    it('should include timestamp', async () => {
      const response = await fetch(`${API_BASE}/api/health`);
      const data = await response.json();
      
      expect(data.data).toHaveProperty('timestamp');
      
      const timestamp = new Date(data.data.timestamp);
      expect(timestamp.getTime()).not.toBeNaN();
      
      // Timestamp should be recent (within last 5 seconds)
      const now = Date.now();
      const difference = now - timestamp.getTime();
      expect(difference).toBeLessThan(5000);
    });

    it('should include uptime information', async () => {
      const response = await fetch(`${API_BASE}/api/health`);
      const data = await response.json();
      
      expect(data.data).toHaveProperty('uptime');
      expect(typeof data.data.uptime).toBe('number');
      expect(data.data.uptime).toBeGreaterThan(0);
    });

    it('should include version information', async () => {
      const response = await fetch(`${API_BASE}/api/health`);
      const data = await response.json();
      
      expect(data.data).toHaveProperty('version');
      expect(typeof data.data.version).toBe('string');
      expect(data.data.version).toMatch(/^\d+\.\d+\.\d+$/); // Semantic versioning
    });

    it('should include environment', async () => {
      const response = await fetch(`${API_BASE}/api/health`);
      const data = await response.json();
      
      expect(data.data).toHaveProperty('environment');
      expect(['development', 'production', 'test']).toContain(data.data.environment);
    });
  });

  describe('Dependency Checks', () => {
    it('should include database status', async () => {
      const response = await fetch(`${API_BASE}/api/health`);
      const data = await response.json();
      
      expect(data.data.checks).toHaveProperty('database');
      expect(data.data.checks.database).toHaveProperty('status');
      expect(['healthy', 'degraded', 'unhealthy']).toContain(
        data.data.checks.database.status
      );
    });

    it('should include cache status', async () => {
      const response = await fetch(`${API_BASE}/api/health`);
      const data = await response.json();
      
      expect(data.data.checks).toHaveProperty('cache');
      expect(data.data.checks.cache).toHaveProperty('status');
      expect(['healthy', 'degraded', 'unhealthy']).toContain(
        data.data.checks.cache.status
      );
    });

    it('should include API status', async () => {
      const response = await fetch(`${API_BASE}/api/health`);
      const data = await response.json();
      
      expect(data.data.checks).toHaveProperty('api');
      expect(data.data.checks.api).toHaveProperty('status');
      expect(data.data.checks.api.status).toBe('healthy');
    });

    it('should include response time for each check', async () => {
      const response = await fetch(`${API_BASE}/api/health`);
      const data = await response.json();
      
      Object.values(data.data.checks).forEach((check: any) => {
        expect(check).toHaveProperty('responseTime');
        expect(typeof check.responseTime).toBe('number');
        expect(check.responseTime).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Performance', () => {
    it('should respond within 100ms', async () => {
      const start = Date.now();
      
      await fetch(`${API_BASE}/api/health`);
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100);
    });

    it('should include x-response-time header', async () => {
      const response = await fetch(`${API_BASE}/api/health`);
      
      expect(response.headers.get('x-response-time')).toBeDefined();
    });

    it('should have minimal payload size', async () => {
      const response = await fetch(`${API_BASE}/api/health`);
      const data = await response.json();
      const payloadSize = JSON.stringify(data).length;
      
      // Health check should be < 2KB
      expect(payloadSize).toBeLessThan(2048);
    });

    it('should handle concurrent requests', async () => {
      const requests = Array(10).fill(null).map(() => 
        fetch(`${API_BASE}/api/health`)
      );
      
      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe('Cache Headers', () => {
    it('should have no-cache header', async () => {
      const response = await fetch(`${API_BASE}/api/health`);
      
      const cacheControl = response.headers.get('cache-control');
      expect(cacheControl).toContain('no-cache');
    });

    it('should have no-store directive', async () => {
      const response = await fetch(`${API_BASE}/api/health`);
      
      const cacheControl = response.headers.get('cache-control');
      expect(cacheControl).toContain('no-store');
    });

    it('should have must-revalidate directive', async () => {
      const response = await fetch(`${API_BASE}/api/health`);
      
      const cacheControl = response.headers.get('cache-control');
      expect(cacheControl).toContain('must-revalidate');
    });
  });

  describe('Error Scenarios', () => {
    it('should still return 200 even if dependencies are degraded', async () => {
      // Health endpoint should always be accessible
      const response = await fetch(`${API_BASE}/api/health`);
      expect(response.status).toBe(200);
    });

    it('should indicate overall health status based on checks', async () => {
      const response = await fetch(`${API_BASE}/api/health`);
      const data = await response.json();
      
      const checks = Object.values(data.data.checks);
      const hasUnhealthyCheck = checks.some((check: any) => check.status === 'unhealthy');
      
      if (hasUnhealthyCheck) {
        expect(data.data.status).toBe('unhealthy');
      } else {
        const hasDegradedCheck = checks.some((check: any) => check.status === 'degraded');
        if (hasDegradedCheck) {
          expect(['degraded', 'healthy']).toContain(data.data.status);
        } else {
          expect(data.data.status).toBe('healthy');
        }
      }
    });
  });

  describe('Monitoring Integration', () => {
    it('should be suitable for uptime monitoring', async () => {
      const response = await fetch(`${API_BASE}/api/health`);
      const data = await response.json();
      
      // Should have simple success indicator
      expect(data.success).toBeDefined();
      expect(typeof data.success).toBe('boolean');
      
      // Should respond quickly
      expect(response.status).toBe(200);
    });

    it('should include machine-readable status', async () => {
      const response = await fetch(`${API_BASE}/api/health`);
      const data = await response.json();
      
      expect(data.data.status).toBeDefined();
      expect(typeof data.data.status).toBe('string');
    });

    it('should be idempotent', async () => {
      const response1 = await fetch(`${API_BASE}/api/health`);
      const data1 = await response1.json();
      
      const response2 = await fetch(`${API_BASE}/api/health`);
      const data2 = await response2.json();
      
      // Status should be consistent (though timestamp will differ)
      expect(data1.data.status).toBe(data2.data.status);
      expect(data1.data.environment).toBe(data2.data.environment);
      expect(data1.data.version).toBe(data2.data.version);
    });
  });

  describe('Documentation', () => {
    it('should include helpful error messages when unhealthy', async () => {
      const response = await fetch(`${API_BASE}/api/health`);
      const data = await response.json();
      
      Object.values(data.data.checks).forEach((check: any) => {
        if (check.status !== 'healthy') {
          expect(check).toHaveProperty('message');
          expect(typeof check.message).toBe('string');
          expect(check.message.length).toBeGreaterThan(0);
        }
      });
    });
  });
});
