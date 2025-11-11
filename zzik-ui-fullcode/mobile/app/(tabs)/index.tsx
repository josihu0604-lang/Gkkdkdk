import { useEffect, useState, useCallback, useMemo, memo } from "react";
import { View, Text, Button, Alert, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
import * as Location from "expo-location";
import { getNearbyPlaces, checkIn, Place } from "@/services/api";

// Memoized PlaceItem component to prevent unnecessary re-renders
const PlaceItem = memo(({ place, isSelected, onSelect }: {
  place: Place;
  isSelected: boolean;
  onSelect: () => void;
}) => {
  return (
    <TouchableOpacity
      onPress={onSelect}
      style={[
        styles.placeItem,
        isSelected && styles.placeItemSelected,
      ]}
      activeOpacity={0.7}
    >
      <Text style={styles.placeName}>
        {place.business_name}
      </Text>
      <Text style={styles.placeCategory}>{place.category}</Text>
      <Text style={styles.placeVoucher}>
        🎁 {place.voucher_description}
      </Text>
    </TouchableOpacity>
  );
});

PlaceItem.displayName = 'PlaceItem';

export default function Index() {
  const [coords, setCoords] = useState<{ latitude: number; longitude: number; accuracy: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [checking, setChecking] = useState(false);

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
          accuracy: Location.Accuracy.BestForNavigation,
        });

        const location = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy || 10,
        };

        setCoords(location);

        // Fetch nearby places
        const nearbyPlaces = await getNearbyPlaces(
          location.latitude,
          location.longitude,
          500
        );
        setPlaces(nearbyPlaces);

        if (nearbyPlaces.length > 0) {
          setSelectedPlace(nearbyPlaces[0]);
        }
      } catch (error) {
        Alert.alert("오류", "위치를 가져올 수 없습니다");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Memoized check-in handler to prevent re-creation
  const handleCheckin = useCallback(async () => {
    if (!coords || !selectedPlace) return;

    setChecking(true);

    try {
      const result = await checkIn({
        user_id: 'user-test-001',
        place_id: selectedPlace.id,
        location: coords,
        timestamp: new Date().toISOString(),
      });

      if (result?.success) {
        Alert.alert(
          "✅ 체크인 성공!",
          `${result.data.place.name}\n무결성 점수: ${result.data.integrity.score}/100\n\n${result.data.voucher?.description || ''}`,
          [{ text: "확인" }]
        );
      } else {
        Alert.alert(
          "❌ 체크인 실패",
          `무결성 점수: ${result?.data.integrity.score || 0}/100\n(최소 60점 필요)`,
          [{ text: "확인" }]
        );
      }
    } catch (error) {
      Alert.alert("오류", "체크인 처리 중 오류가 발생했습니다");
    } finally {
      setChecking(false);
    }
  }, [coords, selectedPlace]);

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.title}>🗺️ 주변 탐험</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#FF6B35" />
        ) : coords ? (
          <>
            <View style={styles.locationCard}>
              <Text style={styles.sectionTitle}>📍 내 위치</Text>
              <Text style={styles.coords}>
                위도: {coords.latitude.toFixed(5)}
              </Text>
              <Text style={styles.coords}>
                경도: {coords.longitude.toFixed(5)}
              </Text>
              <Text style={styles.coords}>
                정확도: {coords.accuracy.toFixed(1)}m
              </Text>
            </View>

            <View style={styles.placesCard}>
              <Text style={styles.sectionTitle}>
                🏪 주변 장소 ({places.length}개)
              </Text>
              {places.length > 0 ? (
                places.map((place) => (
                  <PlaceItem
                    key={place.id}
                    place={place}
                    isSelected={selectedPlace?.id === place.id}
                    onSelect={() => setSelectedPlace(place)}
                  />
                ))
              ) : (
                <Text style={styles.noPlaces}>주변에 장소가 없습니다</Text>
              )}
            </View>

            {selectedPlace && (
              <View style={styles.actionCard}>
                <Text style={styles.selectedPlace}>
                  선택: {selectedPlace.business_name}
                </Text>
                <Button
                  title={checking ? "처리 중..." : "체크인 하기"}
                  onPress={handleCheckin}
                  color="#FF6B35"
                  disabled={checking}
                />
              </View>
            )}
          </>
        ) : (
          <Text>위치를 가져올 수 없습니다</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  locationCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placesCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 12,
  },
  coords: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  placeItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#f9f9f9",
    borderWidth: 2,
    borderColor: "transparent",
  },
  placeItemSelected: {
    backgroundColor: "#FFF4F0",
    borderColor: "#FF6B35",
  },
  placeName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  placeCategory: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
  },
  placeVoucher: {
    fontSize: 14,
    color: "#FF6B35",
  },
  noPlaces: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    padding: 20,
  },
  selectedPlace: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
