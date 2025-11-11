'use client';

import { useEffect, useState } from 'react';
import Map from '@/components/Map';

interface Place {
  id: string;
  business_name: string;
  category: string;
  location: {
    latitude: number;
    longitude: number;
  };
  geofence_radius: number;
  voucher_type: string;
  voucher_value: number;
  voucher_description: string;
}

export default function MapPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number]>([127.0276, 37.4979]);

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([longitude, latitude]);
          fetchNearbyPlaces(latitude, longitude);
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Fallback to default location (Seoul Gangnam)
          fetchNearbyPlaces(37.4979, 127.0276);
        }
      );
    } else {
      // Fallback to default location
      fetchNearbyPlaces(37.4979, 127.0276);
    }
  }, []);

  async function fetchNearbyPlaces(lat: number, lng: number) {
    try {
      const response = await fetch(
        `/api/places?lat=${lat}&lng=${lng}&radius=500`
      );
      const data = await response.json();
      if (data.success) {
        setPlaces(data.data.places);
      }
    } catch (error) {
      console.error('Error fetching places:', error);
    } finally {
      setLoading(false);
    }
  }

  const mapPlaces = places.map(place => ({
    id: place.id,
    name: place.business_name,
    location: place.location,
    category: place.category,
  }));

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>
        🗺️ 주변 탐험 지도
      </h1>
      
      {loading ? (
        <div style={{ 
          height: '500px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: '#f5f5f5',
          borderRadius: '12px',
        }}>
          <p>지도 로딩 중...</p>
        </div>
      ) : (
        <>
          <Map 
            center={userLocation} 
            zoom={14} 
            places={mapPlaces} 
          />
          
          <div style={{ marginTop: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              📍 주변 장소 ({places.length}개)
            </h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1rem'
            }}>
              {places.map((place) => (
                <div 
                  key={place.id}
                  style={{
                    padding: '1rem',
                    background: 'white',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                  }}
                >
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    {place.business_name}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                    {place.category}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#FF6B35', fontWeight: 500 }}>
                    🎁 {place.voucher_description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </main>
  );
}
