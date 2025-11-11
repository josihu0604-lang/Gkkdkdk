/**
 * GPS Integrity Verification Algorithm (5-Factor Scoring)
 * 
 * Threshold: 60 points minimum to approve check-in
 * 
 * Factors:
 * 1. Distance (40 points max) - Proximity to place
 * 2. Wi-Fi (25 points max) - SSID matching
 * 3. Time (15 points max) - Request timestamp consistency
 * 4. Accuracy (10 points max) - GPS accuracy quality
 * 5. Speed (10 points max) - Motion validation
 */

import { calculateDistance, Place } from './db-mock';

export interface GPSIntegrityData {
  location: {
    latitude: number;
    longitude: number;
    accuracy: number; // meters
  };
  wifi?: {
    ssids: string[]; // List of visible Wi-Fi SSIDs
  };
  timestamp: string; // ISO 8601 timestamp
  motion?: {
    x: number;
    y: number;
    z: number;
  };
}

export interface IntegrityResult {
  valid: boolean;
  score: number;
  breakdown: {
    distance: number;
    wifi: number;
    time: number;
    accuracy: number;
    speed: number;
  };
  details: {
    distance_meters: number;
    matched_ssids: string[];
    time_diff_ms: number;
    gps_accuracy: number;
    motion_magnitude: number;
  };
}

/**
 * Verify GPS integrity for check-in
 */
export function verifyGPSIntegrity(
  data: GPSIntegrityData,
  place: Place,
  serverTime: Date = new Date()
): IntegrityResult {
  const breakdown = {
    distance: 0,
    wifi: 0,
    time: 0,
    accuracy: 0,
    speed: 0,
  };

  const details = {
    distance_meters: 0,
    matched_ssids: [] as string[],
    time_diff_ms: 0,
    gps_accuracy: data.location.accuracy,
    motion_magnitude: 0,
  };

  // Factor 1: Distance (40 points max)
  const distance = calculateDistance(
    data.location.latitude,
    data.location.longitude,
    place.location.latitude,
    place.location.longitude
  );
  details.distance_meters = distance;

  if (distance <= place.geofence_radius) {
    // Inside geofence: Full points based on proximity
    if (distance <= 20) {
      breakdown.distance = 40; // Very close
    } else if (distance <= 30) {
      breakdown.distance = 35; // Close
    } else if (distance <= 40) {
      breakdown.distance = 30; // Medium
    } else {
      breakdown.distance = 25; // Edge of geofence
    }
  } else if (distance <= place.geofence_radius + 20) {
    // Just outside: Partial points (GPS accuracy consideration)
    breakdown.distance = Math.max(0, Math.floor(20 * (1 - (distance - place.geofence_radius) / 20)));
  } else {
    // Too far: 0 points
    breakdown.distance = 0;
  }

  // Factor 2: Wi-Fi (25 points max)
  if (data.wifi?.ssids && place.wifi_ssids) {
    const matchedSSIDs = data.wifi.ssids.filter((ssid) =>
      place.wifi_ssids?.includes(ssid)
    );
    details.matched_ssids = matchedSSIDs;

    if (matchedSSIDs.length > 0) {
      // Each matched SSID: 12-13 points (max 25)
      breakdown.wifi = Math.min(25, matchedSSIDs.length * 12);
    }
  }

  // Factor 3: Time Consistency (15 points max)
  const requestTime = new Date(data.timestamp);
  const timeDiff = Math.abs(serverTime.getTime() - requestTime.getTime());
  details.time_diff_ms = timeDiff;

  if (timeDiff <= 60000) {
    // Within 1 minute: Full points
    breakdown.time = 15;
  } else if (timeDiff <= 180000) {
    // Within 3 minutes: Partial points
    breakdown.time = Math.floor(15 * (1 - (timeDiff - 60000) / 120000));
  } else {
    // Too old/future: 0 points
    breakdown.time = 0;
  }

  // Factor 4: GPS Accuracy (10 points max)
  if (data.location.accuracy <= 10) {
    breakdown.accuracy = 10; // High accuracy
  } else if (data.location.accuracy <= 20) {
    breakdown.accuracy = 8; // Good accuracy
  } else if (data.location.accuracy <= 30) {
    breakdown.accuracy = 6; // Medium accuracy
  } else if (data.location.accuracy <= 50) {
    breakdown.accuracy = 4; // Low accuracy
  } else {
    breakdown.accuracy = 0; // Poor accuracy
  }

  // Factor 5: Speed/Motion Check (10 points max)
  if (data.motion) {
    const { x, y, z } = data.motion;
    const magnitude = Math.sqrt(x * x + y * y + z * z);
    details.motion_magnitude = magnitude;

    if (magnitude < 0.5) {
      // Stationary (likely at location)
      breakdown.speed = 10;
    } else if (magnitude < 1.5) {
      // Walking speed
      breakdown.speed = 8;
    } else if (magnitude < 3.0) {
      // Fast walking/jogging
      breakdown.speed = 5;
    } else {
      // Moving too fast (driving/transit)
      breakdown.speed = 0;
    }
  } else {
    // No motion data: Give benefit of doubt
    breakdown.speed = 5;
  }

  // Calculate total score
  const totalScore =
    breakdown.distance +
    breakdown.wifi +
    breakdown.time +
    breakdown.accuracy +
    breakdown.speed;

  // Threshold: 60 points minimum
  const valid = totalScore >= 60;

  return {
    valid,
    score: totalScore,
    breakdown,
    details,
  };
}

/**
 * Generate idempotency key for check-in (optimized with crypto)
 */
export async function generateIdempotencyKey(
  userId: string,
  placeId: string,
  timestamp: string
): Promise<string> {
  const data = `${userId}-${placeId}-${timestamp}`;
  
  // Use Web Crypto API for better hashing (Edge Runtime compatible)
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return `idem-${hashHex.slice(0, 16)}`; // Use first 16 chars (64 bits)
    } catch (error) {
      // Fallback to simple hash if crypto fails
      console.warn('Crypto API failed, using fallback hash:', error);
    }
  }
  
  // Fallback: FNV-1a hash (better distribution than simple hash)
  let hash = 2166136261;
  for (let i = 0; i < data.length; i++) {
    hash ^= data.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return `idem-${(hash >>> 0).toString(36)}`;
}

/**
 * Validate check-in request schema (enhanced with detailed validation)
 */
export function validateCheckInRequest(data: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate location object
  if (!data.location || typeof data.location !== 'object') {
    errors.push('Missing or invalid location data');
  } else {
    // Validate latitude
    if (typeof data.location.latitude !== 'number') {
      errors.push('Invalid latitude: must be a number');
    } else if (data.location.latitude < -90 || data.location.latitude > 90) {
      errors.push('Invalid latitude: must be between -90 and 90');
    } else if (!isFinite(data.location.latitude)) {
      errors.push('Invalid latitude: must be a finite number');
    }
    
    // Validate longitude
    if (typeof data.location.longitude !== 'number') {
      errors.push('Invalid longitude: must be a number');
    } else if (data.location.longitude < -180 || data.location.longitude > 180) {
      errors.push('Invalid longitude: must be between -180 and 180');
    } else if (!isFinite(data.location.longitude)) {
      errors.push('Invalid longitude: must be a finite number');
    }
    
    // Validate accuracy
    if (typeof data.location.accuracy !== 'number') {
      errors.push('Invalid accuracy: must be a number');
    } else if (data.location.accuracy < 0 || data.location.accuracy > 1000) {
      errors.push('Invalid accuracy: must be between 0 and 1000 meters');
    } else if (!isFinite(data.location.accuracy)) {
      errors.push('Invalid accuracy: must be a finite number');
    }
  }

  // Validate timestamp
  if (!data.timestamp) {
    errors.push('Missing timestamp');
  } else if (typeof data.timestamp !== 'string') {
    errors.push('Invalid timestamp: must be a string');
  } else {
    const timestamp = new Date(data.timestamp);
    if (isNaN(timestamp.getTime())) {
      errors.push('Invalid timestamp format: must be ISO 8601');
    } else {
      // Check if timestamp is not too far in past or future
      const now = Date.now();
      const timeDiff = Math.abs(timestamp.getTime() - now);
      const ONE_DAY_MS = 24 * 60 * 60 * 1000;
      
      if (timeDiff > ONE_DAY_MS) {
        errors.push('Invalid timestamp: must be within 24 hours of current time');
      }
    }
  }

  // Validate place_id
  if (!data.place_id) {
    errors.push('Missing place_id');
  } else if (typeof data.place_id !== 'string') {
    errors.push('Invalid place_id: must be a string');
  } else if (data.place_id.length === 0 || data.place_id.length > 100) {
    errors.push('Invalid place_id: must be between 1 and 100 characters');
  }

  // Validate optional Wi-Fi data
  if (data.wifi !== undefined) {
    if (typeof data.wifi !== 'object' || data.wifi === null) {
      errors.push('Invalid wifi: must be an object');
    } else if (data.wifi.ssids !== undefined) {
      if (!Array.isArray(data.wifi.ssids)) {
        errors.push('Invalid wifi.ssids: must be an array');
      } else if (data.wifi.ssids.length > 50) {
        errors.push('Invalid wifi.ssids: maximum 50 SSIDs allowed');
      } else if (!data.wifi.ssids.every((s: any) => typeof s === 'string')) {
        errors.push('Invalid wifi.ssids: all SSIDs must be strings');
      }
    }
  }

  // Validate optional motion data
  if (data.motion !== undefined) {
    if (typeof data.motion !== 'object' || data.motion === null) {
      errors.push('Invalid motion: must be an object');
    } else {
      if (typeof data.motion.x !== 'number' || !isFinite(data.motion.x)) {
        errors.push('Invalid motion.x: must be a finite number');
      }
      if (typeof data.motion.y !== 'number' || !isFinite(data.motion.y)) {
        errors.push('Invalid motion.y: must be a finite number');
      }
      if (typeof data.motion.z !== 'number' || !isFinite(data.motion.z)) {
        errors.push('Invalid motion.z: must be a finite number');
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
