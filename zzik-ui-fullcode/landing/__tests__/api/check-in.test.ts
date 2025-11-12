/**
 * API Integration Tests - Check-in Endpoint
 * 
 * Tests:
 * - Valid check-in with GPS data
 * - Invalid coordinates
 * - Missing required fields
 * - Rate limiting
 * - GPS integrity scoring
 */

import { describe, it, expect, beforeEach } from '@jest/globals';

// Mock fetch for testing
const API_BASE = 'http://localhost:3000';

describe('POST /api/check-in', () => {
  const validCheckInData = {
    user_id: 'test-user-001',
    place_id: 'place-001',
    location: {
      latitude: 37.4979,
      longitude: 127.0276,
      accuracy: 5,
    },
    wifi: {
      ssids: ['DropTop_Guest'],
    },
    timestamp: new Date().toISOString(),
  };

  describe('Valid Requests', () => {
    it('should accept valid check-in with high GPS integrity', async () => {
      const response = await fetch(`${API_BASE}/api/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validCheckInData),
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.check_in).toBeDefined();
      expect(data.data.check_in.status).toBe('approved');
      expect(data.data.integrity.score).toBeGreaterThanOrEqual(60);
    });

    it('should return integrity breakdown', async () => {
      const response = await fetch(`${API_BASE}/api/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validCheckInData),
      });

      const data = await response.json();
      expect(data.data.integrity.breakdown).toHaveProperty('distance');
      expect(data.data.integrity.breakdown).toHaveProperty('wifi');
      expect(data.data.integrity.breakdown).toHaveProperty('time');
      expect(data.data.integrity.breakdown).toHaveProperty('accuracy');
      expect(data.data.integrity.breakdown).toHaveProperty('speed');
    });

    it('should return voucher info on approved check-in', async () => {
      const response = await fetch(`${API_BASE}/api/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validCheckInData),
      });

      const data = await response.json();
      if (data.success) {
        expect(data.data.voucher).toBeDefined();
        expect(data.data.voucher).toHaveProperty('type');
        expect(data.data.voucher).toHaveProperty('value');
        expect(data.data.voucher).toHaveProperty('description');
      }
    });
  });

  describe('Invalid Requests', () => {
    it('should reject missing user_id', async () => {
      const invalidData = { ...validCheckInData };
      delete (invalidData as any).user_id;

      const response = await fetch(`${API_BASE}/api/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    it('should reject missing place_id', async () => {
      const invalidData = { ...validCheckInData };
      delete (invalidData as any).place_id;

      const response = await fetch(`${API_BASE}/api/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData),
      });

      expect(response.status).toBe(400);
    });

    it('should reject invalid latitude', async () => {
      const invalidData = {
        ...validCheckInData,
        location: { ...validCheckInData.location, latitude: 999 },
      };

      const response = await fetch(`${API_BASE}/api/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData),
      });

      expect(response.status).toBe(400);
    });

    it('should reject invalid longitude', async () => {
      const invalidData = {
        ...validCheckInData,
        location: { ...validCheckInData.location, longitude: -999 },
      };

      const response = await fetch(`${API_BASE}/api/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData),
      });

      expect(response.status).toBe(400);
    });

    it('should reject invalid JSON', async () => {
      const response = await fetch(`${API_BASE}/api/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json{',
      });

      expect(response.status).toBe(400);
    });

    it('should reject non-existent place_id', async () => {
      const invalidData = {
        ...validCheckInData,
        place_id: 'non-existent-place',
      };

      const response = await fetch(`${API_BASE}/api/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData),
      });

      expect(response.status).toBe(404);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limit after 5 requests', async () => {
      // Make 5 valid requests (should all succeed)
      for (let i = 0; i < 5; i++) {
        const response = await fetch(`${API_BASE}/api/check-in`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(validCheckInData),
        });
        expect(response.status).toBe(200);
      }

      // 6th request should be rate limited
      const response = await fetch(`${API_BASE}/api/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validCheckInData),
      });

      expect(response.status).toBe(429);
      expect(response.headers.get('retry-after')).toBeDefined();
      expect(response.headers.get('x-ratelimit-limit')).toBe('5');
    });
  });

  describe('GPS Integrity Scoring', () => {
    it('should reject check-in too far from place', async () => {
      const farAwayData = {
        ...validCheckInData,
        location: {
          latitude: 37.5979, // ~10km away
          longitude: 127.1276,
          accuracy: 5,
        },
      };

      const response = await fetch(`${API_BASE}/api/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(farAwayData),
      });

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.data.integrity.score).toBeLessThan(60);
      expect(data.data.check_in.status).toBe('rejected');
    });

    it('should give bonus for matching Wi-Fi SSIDs', async () => {
      // Check-in with matching Wi-Fi
      const withWifiData = {
        ...validCheckInData,
        wifi: { ssids: ['DropTop_Guest', 'DropTop_5G'] },
      };

      const responseWithWifi = await fetch(`${API_BASE}/api/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(withWifiData),
      });
      const dataWithWifi = await responseWithWifi.json();

      // Check-in without Wi-Fi
      const withoutWifiData = { ...validCheckInData };
      delete withoutWifiData.wifi;

      const responseWithoutWifi = await fetch(`${API_BASE}/api/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(withoutWifiData),
      });
      const dataWithoutWifi = await responseWithoutWifi.json();

      // Wi-Fi should increase score
      expect(dataWithWifi.data.integrity.score).toBeGreaterThan(
        dataWithoutWifi.data.integrity.score
      );
    });

    it('should penalize poor GPS accuracy', async () => {
      const poorAccuracyData = {
        ...validCheckInData,
        location: { ...validCheckInData.location, accuracy: 100 }, // 100m accuracy
      };

      const response = await fetch(`${API_BASE}/api/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(poorAccuracyData),
      });

      const data = await response.json();
      expect(data.data.integrity.breakdown.accuracy).toBeLessThan(10);
    });
  });

  describe('Performance', () => {
    it('should respond within 200ms', async () => {
      const start = Date.now();

      await fetch(`${API_BASE}/api/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validCheckInData),
      });

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(200);
    });

    it('should include processing time header', async () => {
      const response = await fetch(`${API_BASE}/api/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validCheckInData),
      });

      expect(response.headers.get('x-processing-time')).toBeDefined();
    });
  });
});
