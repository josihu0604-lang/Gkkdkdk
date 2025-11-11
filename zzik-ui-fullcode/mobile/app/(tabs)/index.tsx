import { useEffect, useState } from "react";
import { View, Text, Button, Alert, StyleSheet } from "react-native";
import * as Location from "expo-location";
import { checkin } from "@/services/api";

export default function Index(){
  const [coords,setCoords] = useState<{latitude:number,longitude:number}|null>(null);
  useEffect(()=>{(async()=>{
    const { status } = await Location.requestForegroundPermissionsAsync();
    if(status!=="granted"){ Alert.alert("권한 필요","위치 권한이 필요합니다"); return; }
    const pos = await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.High});
    setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
  })();},[]);
  async function onCheckin(){
    if(!coords) return;
    const ok = await checkin({ latitude:coords.latitude, longitude:coords.longitude, accuracy: 20, timestamp:new Date().toISOString() });
    Alert.alert(ok ? "체크인 성공" : "체크인 실패");
  }
  return (
    <View style={styles.c}>
      <Text style={styles.h}>ZZIK 모바일</Text>
      <Text>{coords ? `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}` : "위치 파악 중"}</Text>
      <Button title="체크인" onPress={onCheckin} />
    </View>
  );
}
const styles = StyleSheet.create({ c:{flex:1,alignItems:"center",justifyContent:"center",gap:8}, h:{fontSize:20,fontWeight:"700"} });
