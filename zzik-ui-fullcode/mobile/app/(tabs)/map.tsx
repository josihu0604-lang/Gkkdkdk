import { useEffect, useState, useMemo, useCallback, memo } from "react";
import { View, Text, StyleSheet, Alert, ActivityIndicator } from "react-native";
import MapView, { Marker, Circle, PROVIDER_DEFAULT } from "react-native-maps";
import * as Location from "expo-location";
import { getNearbyPlaces, Place } from "@/services/api";

// Memoized PlaceMarker component for better performance
const PlaceMarker = memo(({ place, getCategoryEmoji }: {
  place: Place;
  getCategoryEmoji: (category: string) => string;
}) => {
  const coordinate = useMemo(() => ({
    latitude: place.location.latitude,
    longitude: place.location.longitude,
  }), [place.location.latitude, place.location.longitude]);

  return (
    <>
      <Marker
        coordinate={coordinate}
        title={place.business_name}
        description={`🎁 ${place.voucher_description}`}
      >
        <View style={styles.markerContainer}>
          <View style={styles.marker}>
            <Text style={styles.markerEmoji}>
              {getCategoryEmoji(place.category)}
            </Text>
          </View>
        </View>
      </Marker>
      {/* Geofence circle */}
      <Circle
        center={coordinate}
        radius={place.geofence_radius}
        fillColor="rgba(255, 107, 53, 0.05)"
        strokeColor="rgba(255, 107, 53, 0.3)"
        strokeWidth={1}
      />
    </>
  );
});

PlaceMarker.displayName = 'PlaceMarker';

export default function MapTab() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("권한 필요", "위치 권한이 필요합니다");
          setLoading(false);
          return;
        }

        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        setLocation(pos);

        // Fetch nearby places
        const nearbyPlaces = await getNearbyPlaces(
          pos.coords.latitude,
          pos.coords.longitude,
          1000 // 1km radius
        );
        
        setPlaces(nearbyPlaces);
      } catch (error) {
        Alert.alert("오류", "위치를 가져올 수 없습니다");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Memoized emoji mapping to avoid recreating on each render
  const getCategoryEmoji = useCallback((category: string): string => {
    const emojiMap: { [key: string]: string } = {
      cafe: "☕",
      restaurant: "🍜",
      fitness: "🏋️",
      bookstore: "📚",
      bakery: "🥐",
      beauty: "💇",
      entertainment: "🎮",
      convenience: "🏪",
      laundry: "🧺",
    };
    return emojiMap[category] || "📍";
  }, []);

  // Memoize initial map region to prevent recalculation
  const initialRegion = useMemo(() => {
    if (!location) return undefined;
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }, [location]);

  // Memoize user circle center
  const userCircleCenter = useMemo(() => {
    if (!location) return undefined;
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  }, [location]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>지도 로딩 중...</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.centerContainer}>
        <Text>위치를 가져올 수 없습니다</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton
        loadingEnabled
        loadingIndicatorColor="#FF6B35"
        maxZoomLevel={18}
        minZoomLevel={10}
      >
        {/* User's current location circle */}
        {userCircleCenter && (
          <Circle
            center={userCircleCenter}
            radius={500}
            fillColor="rgba(255, 107, 53, 0.1)"
            strokeColor="rgba(255, 107, 53, 0.5)"
            strokeWidth={2}
          />
        )}

        {/* Place markers - memoized to prevent re-renders */}
        {places.map((place) => (
          <PlaceMarker
            key={place.id}
            place={place}
            getCategoryEmoji={getCategoryEmoji}
          />
        ))}
      </MapView>

      <View style={styles.infoBar}>
        <Text style={styles.infoText}>
          📍 주변 장소: {places.length}개
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FF6B35",
    borderWidth: 3,
    borderColor: "white",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerEmoji: {
    fontSize: 20,
  },
  infoBar: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  infoText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
});
