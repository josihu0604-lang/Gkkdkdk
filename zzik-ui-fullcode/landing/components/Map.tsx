'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Public token for demo (replace with your own in production)
mapboxgl.accessToken = 'pk.eyJ1IjoiZXhhbXBsZS11c2VyIiwiYSI6ImNrZXhhbXBsZSJ9.example';

interface MapProps {
  center?: [number, number]; // [longitude, latitude]
  zoom?: number;
  places?: Array<{
    id: string;
    name: string;
    location: {
      latitude: number;
      longitude: number;
    };
    category: string;
  }>;
}

export default function Map({ 
  center = [127.0276, 37.4979], // 서울 강남
  zoom = 14,
  places = []
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: center,
      zoom: zoom,
    });

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Cleanup
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Add markers for places
  useEffect(() => {
    if (!map.current || !mapLoaded || places.length === 0) return;

    // Remove existing markers
    const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
    existingMarkers.forEach(marker => marker.remove());

    // Add markers for each place
    places.forEach((place) => {
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.width = '40px';
      el.style.height = '40px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = '#FF6B35';
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
      el.style.cursor = 'pointer';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.fontSize = '20px';
      el.textContent = getCategoryEmoji(place.category);

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<div style="padding: 8px;">
          <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600;">${place.name}</h3>
          <p style="margin: 0; font-size: 12px; color: #666;">${place.category}</p>
        </div>`
      );

      new mapboxgl.Marker(el)
        .setLngLat([place.location.longitude, place.location.latitude])
        .setPopup(popup)
        .addTo(map.current!);
    });
  }, [mapLoaded, places]);

  return (
    <div 
      ref={mapContainer} 
      style={{ 
        width: '100%', 
        height: '500px', 
        borderRadius: '12px',
        overflow: 'hidden',
      }} 
    />
  );
}

function getCategoryEmoji(category: string): string {
  const emojiMap: { [key: string]: string } = {
    cafe: '☕',
    restaurant: '🍜',
    fitness: '🏋️',
    bookstore: '📚',
    bakery: '🥐',
    beauty: '💇',
    entertainment: '🎮',
    convenience: '🏪',
    laundry: '🧺',
  };
  return emojiMap[category] || '📍';
}
