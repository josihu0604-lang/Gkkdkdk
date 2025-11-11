import axios from "axios";

/**
 * Generate simple idempotency key from payload + timestamp
 */
function generateIdempotencyKey(payload: any): string {
  const raw = JSON.stringify(payload) + ":" + Date.now().toString().slice(0, 10);
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash * 31) + raw.charCodeAt(i)) >>> 0;
  }
  return "idem-" + hash.toString(16);
}

const API_URL = (process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000").replace(/\/$/, '');

export async function checkin({
  latitude,
  longitude,
  accuracy,
  timestamp,
}: {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
}): Promise<boolean> {
  try {
    const headers = {
      "Idempotency-Key": generateIdempotencyKey({ latitude, longitude, timestamp }),
      "Content-Type": "application/json",
    };

    const body = {
      placeId: undefined,
      hospitalId: undefined,
      latitude,
      longitude,
      accuracy,
      timestamp,
    };

    const response = await axios.post(`${API_URL}/api/v1/checkins`, body, { headers });
    return response.status >= 200 && response.status < 300;
  } catch (error) {
    console.error("Checkin error:", error);
    return false;
  }
}
