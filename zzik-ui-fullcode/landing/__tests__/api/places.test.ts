/**
 * API Integration Tests - Places Endpoint
 * 
 * Tests:
 * - Retrieve all places
 * - Retrieve single place by ID
 * - Validate place data structure
 * - Handle non-existent places
 * - Performance benchmarks
 */

import { describe, it, expect } from '@jest/globals';

const API_BASE = 'http://localhost:3000';

describe('GET /api/places', () => {
  describe('List All Places', () => {
    it('should return list of all places', async () => {
      const response = await fetch(`${API_BASE}/api/places`);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data.places)).toBe(true);
      expect(data.data.places.length).toBeGreaterThan(0);
    });

    it('should return places with valid structure', async () => {
      const response = await fetch(`${API_BASE}/api/places`);
      const data = await response.json();
      
      const place = data.data.places[0];
      
      // Required fields
      expect(place).toHaveProperty('id');
      expect(place).toHaveProperty('name');
      expect(place).toHaveProperty('category');
      expect(place).toHaveProperty('location');
      expect(place).toHaveProperty('address');
      
      // Location structure
      expect(place.location).toHaveProperty('latitude');
      expect(place.location).toHaveProperty('longitude');
      expect(typeof place.location.latitude).toBe('number');
      expect(typeof place.location.longitude).toBe('number');
      
      // Coordinate ranges
      expect(place.location.latitude).toBeGreaterThanOrEqual(-90);
      expect(place.location.latitude).toBeLessThanOrEqual(90);
      expect(place.location.longitude).toBeGreaterThanOrEqual(-180);
      expect(place.location.longitude).toBeLessThanOrEqual(180);
    });

    it('should return places with Wi-Fi data', async () => {
      const response = await fetch(`${API_BASE}/api/places`);
      const data = await response.json();
      
      const place = data.data.places[0];
      
      expect(place).toHaveProperty('wifi');
      expect(Array.isArray(place.wifi.ssids)).toBe(true);
    });

    it('should return places with voucher information', async () => {
      const response = await fetch(`${API_BASE}/api/places`);
      const data = await response.json();
      
      const place = data.data.places[0];
      
      expect(place).toHaveProperty('vouchers');
      expect(Array.isArray(place.vouchers)).toBe(true);
      
      if (place.vouchers.length > 0) {
        const voucher = place.vouchers[0];
        expect(voucher).toHaveProperty('type');
        expect(voucher).toHaveProperty('value');
        expect(voucher).toHaveProperty('description');
        expect(['percentage', 'fixed', 'points']).toContain(voucher.type);
      }
    });

    it('should include metadata', async () => {
      const response = await fetch(`${API_BASE}/api/places`);
      const data = await response.json();
      
      expect(data.data).toHaveProperty('count');
      expect(data.data).toHaveProperty('timestamp');
      expect(typeof data.data.count).toBe('number');
      expect(data.data.count).toBe(data.data.places.length);
    });
  });

  describe('Get Single Place', () => {
    it('should return single place by ID', async () => {
      const response = await fetch(`${API_BASE}/api/places?id=place-001`);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.place).toBeDefined();
      expect(data.data.place.id).toBe('place-001');
    });

    it('should return 404 for non-existent place', async () => {
      const response = await fetch(`${API_BASE}/api/places?id=non-existent-place`);
      
      expect(response.status).toBe(404);
      
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('should return complete place details', async () => {
      const response = await fetch(`${API_BASE}/api/places?id=place-001`);
      const data = await response.json();
      
      const place = data.data.place;
      
      // Core fields
      expect(place.id).toBe('place-001');
      expect(place.name).toBe('DropTop Seoul');
      expect(place.category).toBe('cafe');
      
      // Location
      expect(place.location.latitude).toBeDefined();
      expect(place.location.longitude).toBeDefined();
      
      // Address
      expect(place.address).toBeDefined();
      expect(place.address.full).toBeDefined();
      
      // Wi-Fi
      expect(place.wifi).toBeDefined();
      expect(place.wifi.ssids).toBeDefined();
      
      // Vouchers
      expect(place.vouchers).toBeDefined();
      expect(Array.isArray(place.vouchers)).toBe(true);
    });
  });

  describe('Query Parameters', () => {
    it('should filter by category', async () => {
      const response = await fetch(`${API_BASE}/api/places?category=cafe`);
      const data = await response.json();
      
      expect(data.success).toBe(true);
      data.data.places.forEach((place: any) => {
        expect(place.category).toBe('cafe');
      });
    });

    it('should return empty array for non-matching category', async () => {
      const response = await fetch(`${API_BASE}/api/places?category=nonexistent`);
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(data.data.places).toEqual([]);
      expect(data.data.count).toBe(0);
    });

    it('should filter by bounds (geo-spatial query)', async () => {
      // Seoul Gangnam area bounds
      const bounds = {
        north: 37.52,
        south: 37.48,
        east: 127.06,
        west: 127.02,
      };
      
      const query = new URLSearchParams({
        bounds: JSON.stringify(bounds),
      });
      
      const response = await fetch(`${API_BASE}/api/places?${query}`);
      const data = await response.json();
      
      expect(data.success).toBe(true);
      data.data.places.forEach((place: any) => {
        expect(place.location.latitude).toBeGreaterThanOrEqual(bounds.south);
        expect(place.location.latitude).toBeLessThanOrEqual(bounds.north);
        expect(place.location.longitude).toBeGreaterThanOrEqual(bounds.west);
        expect(place.location.longitude).toBeLessThanOrEqual(bounds.east);
      });
    });
  });

  describe('Performance', () => {
    it('should respond within 100ms for list query', async () => {
      const start = Date.now();
      
      await fetch(`${API_BASE}/api/places`);
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100);
    });

    it('should respond within 50ms for single place query', async () => {
      const start = Date.now();
      
      await fetch(`${API_BASE}/api/places?id=place-001`);
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(50);
    });

    it('should include cache headers', async () => {
      const response = await fetch(`${API_BASE}/api/places`);
      
      expect(response.headers.get('cache-control')).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid query parameters gracefully', async () => {
      const response = await fetch(`${API_BASE}/api/places?invalid=param`);
      
      // Should still return successfully, just ignore invalid params
      expect(response.status).toBe(200);
    });

    it('should validate bounds parameter format', async () => {
      const response = await fetch(`${API_BASE}/api/places?bounds=invalid-json`);
      
      const data = await response.json();
      // Should either return error or ignore invalid bounds
      expect([200, 400]).toContain(response.status);
    });
  });

  describe('Data Integrity', () => {
    it('should return consistent data across multiple requests', async () => {
      const response1 = await fetch(`${API_BASE}/api/places`);
      const data1 = await response1.json();
      
      const response2 = await fetch(`${API_BASE}/api/places`);
      const data2 = await response2.json();
      
      expect(data1.data.count).toBe(data2.data.count);
      expect(data1.data.places.length).toBe(data2.data.places.length);
    });

    it('should not contain duplicate place IDs', async () => {
      const response = await fetch(`${API_BASE}/api/places`);
      const data = await response.json();
      
      const ids = data.data.places.map((place: any) => place.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have valid voucher data types', async () => {
      const response = await fetch(`${API_BASE}/api/places`);
      const data = await response.json();
      
      data.data.places.forEach((place: any) => {
        place.vouchers.forEach((voucher: any) => {
          expect(['percentage', 'fixed', 'points']).toContain(voucher.type);
          
          if (voucher.type === 'percentage') {
            expect(voucher.value).toBeGreaterThanOrEqual(0);
            expect(voucher.value).toBeLessThanOrEqual(100);
          } else if (voucher.type === 'fixed') {
            expect(voucher.value).toBeGreaterThan(0);
          } else if (voucher.type === 'points') {
            expect(Number.isInteger(voucher.value)).toBe(true);
            expect(voucher.value).toBeGreaterThan(0);
          }
        });
      });
    });
  });
});
