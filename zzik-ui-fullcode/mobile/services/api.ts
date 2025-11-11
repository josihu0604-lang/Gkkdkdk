import axios from "axios";

const API_URL = (process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001").replace(/\/$/, '');

export interface Place {
  id: string;
  business_name: string;
  category: string;
  location: {
    latitude: number;
    longitude: number;
  };
  geofence_radius: number;
  voucher_type: 'discount' | 'freebie' | 'cashback';
  voucher_value: number;
  voucher_description: string;
}

export interface CheckInRequest {
  user_id?: string;
  place_id: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  wifi?: {
    ssids: string[];
  };
  timestamp: string;
  motion?: {
    x: number;
    y: number;
    z: number;
  };
}

export interface CheckInResponse {
  success: boolean;
  data: {
    check_in: {
      id: string;
      user_id: string;
      place_id: string;
      integrity_score: number;
      status: 'approved' | 'rejected' | 'pending';
    };
    integrity: {
      score: number;
      breakdown: {
        distance: number;
        wifi: number;
        time: number;
        accuracy: number;
        speed: number;
      };
      details: any;
      threshold: number;
    };
    place: {
      id: string;
      name: string;
      category: string;
    };
    voucher: {
      type: string;
      value: number;
      description: string;
    } | null;
  };
}

/**
 * Get nearby places
 */
export async function getNearbyPlaces(
  latitude: number,
  longitude: number,
  radius: number = 500
): Promise<Place[]> {
  try {
    const response = await axios.get(`${API_URL}/api/places`, {
      params: { lat: latitude, lng: longitude, radius },
    });
    return response.data.data.places || [];
  } catch (error) {
    console.error("Error fetching places:", error);
    return [];
  }
}

/**
 * Submit check-in with GPS verification
 */
export async function checkIn(data: CheckInRequest): Promise<CheckInResponse | null> {
  try {
    const response = await axios.post(`${API_URL}/api/check-in`, data);
    return response.data;
  } catch (error) {
    console.error("Check-in error:", error);
    return null;
  }
}

/**
 * Health check
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await axios.get(`${API_URL}/api/health`);
    return response.data.status === 'ok';
  } catch (error) {
    console.error("Health check error:", error);
    return false;
  }
}
