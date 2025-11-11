import { useEffect, useState } from "react";
import { View, Text, Button, Alert, StyleSheet, ActivityIndicator } from "react-native";
import * as Location from "expo-location";
import { checkin } from "@/services/api";

export default function Index() {
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
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
          accuracy: Location.Accuracy.High,
        });

        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      } catch (error) {
        Alert.alert("오류", "위치를 가져올 수 없습니다");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleCheckin() {
    if (!coords) return;

    const success = await checkin({
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracy: 20,
      timestamp: new Date().toISOString(),
    });

    Alert.alert(success ? "체크인 성공" : "체크인 실패");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ZZIK 모바일</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#FF6B35" />
      ) : coords ? (
        <>
          <Text style={styles.coords}>
            위도: {coords.latitude.toFixed(5)}
          </Text>
          <Text style={styles.coords}>
            경도: {coords.longitude.toFixed(5)}
          </Text>
          <Button title="체크인" onPress={handleCheckin} color="#FF6B35" />
        </>
      ) : (
        <Text>위치를 가져올 수 없습니다</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
  },
  coords: {
    fontSize: 16,
    color: "#666",
  },
});
