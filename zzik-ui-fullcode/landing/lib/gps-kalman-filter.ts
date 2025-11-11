/**
 * Kalman Filter for GPS Position Smoothing
 * 
 * Reduces GPS noise and improves accuracy by:
 * - Predicting position based on velocity
 * - Correcting prediction with GPS measurement
 * - Weighting prediction vs measurement based on uncertainty
 * 
 * Reference: https://en.wikipedia.org/wiki/Kalman_filter
 */

interface GPSMeasurement {
  latitude: number;
  longitude: number;
  accuracy: number; // meters
  timestamp: number; // milliseconds
  speed?: number; // m/s (optional)
  heading?: number; // degrees (optional)
}

interface KalmanState {
  // Position (lat, lng)
  position: { latitude: number; longitude: number };
  
  // Velocity (m/s in lat/lng directions)
  velocity: { lat: number; lng: number };
  
  // Covariance matrix (uncertainty)
  // P = [[lat_var, lat_lng_cov], [lat_lng_cov, lng_var]]
  covariance: number[][];
  
  // Last update timestamp
  timestamp: number;
}

export class GPSKalmanFilter {
  private state: KalmanState | null = null;
  
  // Process noise (how much we trust the model)
  private readonly processNoise = 0.5; // meters^2/s^2
  
  // Earth radius for lat/lng to meters conversion
  private readonly EARTH_RADIUS = 6371000; // meters
  
  /**
   * Initialize or update filter with new GPS measurement
   */
  update(measurement: GPSMeasurement): GPSMeasurement {
    if (!this.state) {
      // First measurement - initialize filter
      this.state = {
        position: {
          latitude: measurement.latitude,
          longitude: measurement.longitude,
        },
        velocity: { lat: 0, lng: 0 },
        covariance: [
          [measurement.accuracy ** 2, 0],
          [0, measurement.accuracy ** 2],
        ],
        timestamp: measurement.timestamp,
      };
      
      return measurement;
    }
    
    // Time delta (seconds)
    const dt = (measurement.timestamp - this.state.timestamp) / 1000;
    
    if (dt <= 0) {
      // Invalid time delta, return current state
      return {
        ...measurement,
        latitude: this.state.position.latitude,
        longitude: this.state.position.longitude,
      };
    }
    
    // Predict step
    const predicted = this.predict(dt);
    
    // Update step with measurement
    const updated = this.correct(predicted, measurement);
    
    this.state = updated;
    
    return {
      latitude: updated.position.latitude,
      longitude: updated.position.longitude,
      accuracy: Math.sqrt((updated.covariance[0][0] + updated.covariance[1][1]) / 2),
      timestamp: measurement.timestamp,
      speed: measurement.speed,
      heading: measurement.heading,
    };
  }
  
  /**
   * Predict next position based on velocity
   */
  private predict(dt: number): KalmanState {
    if (!this.state) {
      throw new Error('Filter not initialized');
    }
    
    // Convert velocity to lat/lng changes
    const latChange = this.metersToLatitude(this.state.velocity.lat * dt);
    const lngChange = this.metersToLongitude(
      this.state.velocity.lng * dt,
      this.state.position.latitude
    );
    
    // Predicted position
    const position = {
      latitude: this.state.position.latitude + latChange,
      longitude: this.state.position.longitude + lngChange,
    };
    
    // Process noise matrix (Q)
    const q = this.processNoise * dt;
    const Q = [
      [q, 0],
      [0, q],
    ];
    
    // Predicted covariance: P' = P + Q
    const covariance = [
      [this.state.covariance[0][0] + Q[0][0], this.state.covariance[0][1] + Q[0][1]],
      [this.state.covariance[1][0] + Q[1][0], this.state.covariance[1][1] + Q[1][1]],
    ];
    
    return {
      position,
      velocity: this.state.velocity,
      covariance,
      timestamp: this.state.timestamp,
    };
  }
  
  /**
   * Correct prediction with GPS measurement
   */
  private correct(predicted: KalmanState, measurement: GPSMeasurement): KalmanState {
    // Measurement noise (R) - GPS accuracy squared
    const R = [
      [measurement.accuracy ** 2, 0],
      [0, measurement.accuracy ** 2],
    ];
    
    // Innovation (measurement - prediction)
    const innovation = {
      latitude: measurement.latitude - predicted.position.latitude,
      longitude: measurement.longitude - predicted.position.longitude,
    };
    
    // Innovation covariance: S = P' + R
    const S = [
      [predicted.covariance[0][0] + R[0][0], predicted.covariance[0][1] + R[0][1]],
      [predicted.covariance[1][0] + R[1][0], predicted.covariance[1][1] + R[1][1]],
    ];
    
    // Kalman gain: K = P' * S^-1
    const detS = S[0][0] * S[1][1] - S[0][1] * S[1][0];
    if (Math.abs(detS) < 1e-10) {
      // Singular matrix, return prediction as-is
      return predicted;
    }
    
    const invS = [
      [S[1][1] / detS, -S[0][1] / detS],
      [-S[1][0] / detS, S[0][0] / detS],
    ];
    
    const K = [
      [predicted.covariance[0][0] * invS[0][0] + predicted.covariance[0][1] * invS[1][0],
       predicted.covariance[0][0] * invS[0][1] + predicted.covariance[0][1] * invS[1][1]],
      [predicted.covariance[1][0] * invS[0][0] + predicted.covariance[1][1] * invS[1][0],
       predicted.covariance[1][0] * invS[0][1] + predicted.covariance[1][1] * invS[1][1]],
    ];
    
    // Updated position: x = x' + K * innovation
    const position = {
      latitude: predicted.position.latitude + K[0][0] * innovation.latitude + K[0][1] * innovation.longitude,
      longitude: predicted.position.longitude + K[1][0] * innovation.latitude + K[1][1] * innovation.longitude,
    };
    
    // Updated velocity (estimate from position change if speed not provided)
    const dt = (measurement.timestamp - predicted.timestamp) / 1000;
    let velocity = predicted.velocity;
    
    if (dt > 0 && measurement.speed !== undefined) {
      // Use provided speed and heading if available
      if (measurement.heading !== undefined) {
        const headingRad = (measurement.heading * Math.PI) / 180;
        velocity = {
          lat: measurement.speed * Math.cos(headingRad),
          lng: measurement.speed * Math.sin(headingRad),
        };
      }
    }
    
    // Updated covariance: P = (I - K) * P'
    const I_K = [
      [1 - K[0][0], -K[0][1]],
      [-K[1][0], 1 - K[1][1]],
    ];
    
    const covariance = [
      [
        I_K[0][0] * predicted.covariance[0][0] + I_K[0][1] * predicted.covariance[1][0],
        I_K[0][0] * predicted.covariance[0][1] + I_K[0][1] * predicted.covariance[1][1],
      ],
      [
        I_K[1][0] * predicted.covariance[0][0] + I_K[1][1] * predicted.covariance[1][0],
        I_K[1][0] * predicted.covariance[0][1] + I_K[1][1] * predicted.covariance[1][1],
      ],
    ];
    
    return {
      position,
      velocity,
      covariance,
      timestamp: measurement.timestamp,
    };
  }
  
  /**
   * Convert meters to latitude degrees
   */
  private metersToLatitude(meters: number): number {
    return (meters / this.EARTH_RADIUS) * (180 / Math.PI);
  }
  
  /**
   * Convert meters to longitude degrees (latitude-dependent)
   */
  private metersToLongitude(meters: number, latitude: number): number {
    const latRad = (latitude * Math.PI) / 180;
    return (meters / (this.EARTH_RADIUS * Math.cos(latRad))) * (180 / Math.PI);
  }
  
  /**
   * Reset filter
   */
  reset(): void {
    this.state = null;
  }
  
  /**
   * Get current filtered position
   */
  getCurrentPosition(): { latitude: number; longitude: number } | null {
    return this.state ? this.state.position : null;
  }
}

/**
 * Moving Average Filter (simpler alternative to Kalman)
 * 
 * Smooths GPS readings by averaging recent measurements
 * - Simpler than Kalman filter
 * - Good for stationary or slow-moving scenarios
 * - Lower computational cost
 */
export class MovingAverageFilter {
  private measurements: GPSMeasurement[] = [];
  private readonly windowSize: number;
  
  constructor(windowSize: number = 5) {
    this.windowSize = windowSize;
  }
  
  update(measurement: GPSMeasurement): GPSMeasurement {
    // Add measurement to window
    this.measurements.push(measurement);
    
    // Keep only last N measurements
    if (this.measurements.length > this.windowSize) {
      this.measurements.shift();
    }
    
    // Calculate weighted average (recent measurements weighted higher)
    let totalWeight = 0;
    let weightedLat = 0;
    let weightedLng = 0;
    let totalAccuracy = 0;
    
    this.measurements.forEach((m, i) => {
      // Weight based on recency and accuracy
      const recencyWeight = (i + 1) / this.measurements.length; // 0.2, 0.4, 0.6, 0.8, 1.0
      const accuracyWeight = 1 / (m.accuracy + 1); // Better accuracy = higher weight
      const weight = recencyWeight * accuracyWeight;
      
      weightedLat += m.latitude * weight;
      weightedLng += m.longitude * weight;
      totalAccuracy += m.accuracy * weight;
      totalWeight += weight;
    });
    
    return {
      latitude: weightedLat / totalWeight,
      longitude: weightedLng / totalWeight,
      accuracy: totalAccuracy / totalWeight,
      timestamp: measurement.timestamp,
      speed: measurement.speed,
      heading: measurement.heading,
    };
  }
  
  reset(): void {
    this.measurements = [];
  }
}

/**
 * Export singleton instances
 */
export const gpsKalmanFilter = new GPSKalmanFilter();
export const gpsMovingAverageFilter = new MovingAverageFilter(5);
