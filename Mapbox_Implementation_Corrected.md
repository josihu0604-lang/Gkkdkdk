# ZZIK Mapbox 구현 가이드 (교정판)

**작성일**: 2025-11-11  
**버전**: 2.0 (GPT-5 Pro 피드백 반영)  
**변경 사항**: RN Geofencing 올바른 구현, 비용 산정 수정, Weather/Interactive 현실화

---

## 🚨 이전 버전의 오류

| 오류 | 설명 | 영향 |
|------|------|------|
| **Mapbox Geofencing API 존재 여부** | Mapbox는 2024년 말 Geofencing 정식 출시. 그러나 **`@rnmapbox/maps`에는 `startGeofencingAsync` API 없음** | ❌ 코드 실행 불가 |
| **iOS 20개 제한 무시** | iOS는 지역 모니터링 20개 한도. 대량 지오펜스 불가 | ❌ 확장성 문제 |
| **Mapbox 무료 티어 과장** | "Geofence 50k 무료" 근거 없음. 실제 모바일 MAU 무료는 **25k** | ❌ 비용 과소 추정 |
| **MTS Incremental ₩25 고정** | 고정 요금 아님. **CU·호스팅데이 과금** | ❌ 예산 오류 |
| **Weather/Interactive 신제품** | GL JS 기본 패턴. RN에서는 다른 방식 필요 | ❌ 오해 유발 |

---

## ✅ 교정된 구현 경로

### 1. Geofencing 올바른 구현

#### ❌ 이전 코드 (잘못됨)
```typescript
// 존재하지 않는 API
import MapboxGL from '@rnmapbox/maps'
await MapboxGL.startGeofencingAsync('ZZIK_GEOFENCE', [geofence])
```

#### ✅ 옵션 1: Transistorsoft Background Geolocation (추천)

**장점**:
- iOS 20개·Android 100개 한계 **동적 로딩**으로 우회
- 상용 라이브러리지만 실무 안정성 높음
- 백그라운드 동작 보장

**비용**: $199 일회성 (앱당)

**설치**:
```bash
cd /home/user/webapp/mobile
npm install react-native-background-geolocation

# iOS CocoaPods
cd ios && pod install && cd ..

# Android - auto-linked
```

**구현**:
```typescript
// src/services/geofencing.service.ts
import BackgroundGeolocation, { 
  Location, 
  Geofence, 
  GeofenceEvent 
} from 'react-native-background-geolocation'

export class GeofencingService {
  
  /**
   * 초기화 (앱 시작 시 한 번)
   */
  static async initialize() {
    await BackgroundGeolocation.ready({
      desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
      distanceFilter: 10,
      stopTimeout: 5,
      debug: false,
      logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
      
      // 지오펜스 정확도 향상
      geofenceModeHighAccuracy: true,
      
      // 백그라운드 권한
      backgroundPermissionRationale: {
        title: "ZZIK 체크인 알림",
        message: "매장 근처에 도착하면 자동으로 알려드립니다.",
        positiveAction: "허용",
        negativeAction: "거부"
      }
    })
    
    console.log('[Geofencing] Initialized')
  }
  
  /**
   * 위치 변경 시 동적 지오펜스 로딩
   * iOS 20개 한계 우회: 현재 위치 기준 가까운 10개만 등록
   */
  static async updateGeofencesForLocation(location: Location) {
    // 1. 현재 위치 기준 가까운 매장 가져오기
    const nearbyPlaces = await this.fetchNearbyPlaces(
      location.coords.latitude,
      location.coords.longitude,
      5000  // 반경 5km
    )
    
    // 2. 거리순 정렬 후 상위 10개 선택
    const topPlaces = nearbyPlaces
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10)
    
    // 3. 기존 지오펜스 모두 제거
    await BackgroundGeolocation.removeGeofences()
    
    // 4. 새 지오펜스 등록
    for (const place of topPlaces) {
      await BackgroundGeolocation.addGeofence({
        identifier: place.id,
        latitude: place.location.coordinates[1],
        longitude: place.location.coordinates[0],
        radius: place.radius || 50,  // 기본 50m
        
        // 이벤트 타입
        notifyOnEntry: true,   // 진입 시
        notifyOnExit: false,   // 나갈 때는 불필요
        notifyOnDwell: true,   // 30초 체류 시
        loiteringDelay: 30000  // 30초
      })
    }
    
    console.log(`[Geofencing] Loaded ${topPlaces.length} geofences`)
  }
  
  /**
   * 지오펜스 이벤트 리스너
   */
  static onGeofenceEvent(callback: (event: GeofenceEvent) => void) {
    BackgroundGeolocation.on('geofence', (event) => {
      console.log('[Geofence Event]', event)
      
      // ENTER 또는 DWELL 시 체크인 알림
      if (event.action === 'ENTER' || event.action === 'DWELL') {
        callback(event)
      }
    })
  }
  
  /**
   * 서버에서 주변 매장 가져오기
   */
  private static async fetchNearbyPlaces(
    lat: number, 
    lng: number, 
    radius: number
  ): Promise<Place[]> {
    const response = await fetch(
      `${API_BASE}/places/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
    )
    return response.json()
  }
}
```

**사용 예시**:
```typescript
// App.tsx
import { GeofencingService } from './services/geofencing.service'

export default function App() {
  useEffect(() => {
    (async () => {
      // 1. 초기화
      await GeofencingService.initialize()
      
      // 2. 위치 변경 이벤트
      BackgroundGeolocation.on('location', async (location) => {
        await GeofencingService.updateGeofencesForLocation(location)
      })
      
      // 3. 지오펜스 이벤트
      GeofencingService.onGeofenceEvent((event) => {
        // 로컬 알림 표시
        showCheckInNotification({
          placeId: event.identifier,
          placeName: event.extras.name
        })
      })
      
      // 4. 시작
      await BackgroundGeolocation.start()
    })()
  }, [])
  
  return <NavigationContainer>...</NavigationContainer>
}
```

**출처**: [react-native-background-geolocation](https://transistorsoft.github.io/react-native-background-geolocation/)

---

#### ✅ 옵션 2: 네이티브 브릿지 (무료, 복잡)

**장점**:
- 비용 없음
- Mapbox iOS/Android Geofencing SDK 직접 사용

**단점**:
- RN 브릿지 모듈 직접 작성 필요
- 유지보수 부담

**구현 개요**:
```swift
// ios/RNMapboxGeofencing.swift
import CoreLocation
import MapboxGeofencing

@objc(RNMapboxGeofencing)
class RNMapboxGeofencing: NSObject {
  let locationManager = CLLocationManager()
  let geofencingManager = GeofencingManager()
  
  @objc
  func addGeofence(
    _ id: String,
    latitude: Double,
    longitude: Double,
    radius: Double
  ) {
    let center = CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
    let region = CLCircularRegion(
      center: center,
      radius: radius,
      identifier: id
    )
    
    region.notifyOnEntry = true
    locationManager.startMonitoring(for: region)
  }
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
```

```typescript
// React Native 호출
import { NativeModules } from 'react-native'
const { RNMapboxGeofencing } = NativeModules

RNMapboxGeofencing.addGeofence(
  'place_123',
  37.5665,
  126.9780,
  50
)
```

**권장**: 파일럿은 **옵션 1** 사용, Series A 후 옵션 2로 전환 고려

---

### 2. 서버 검증 강화 (필수)

**클라이언트 이벤트는 신뢰 불가**. 반드시 서버에서 재검증.

```sql
-- PostgreSQL + PostGIS
CREATE OR REPLACE FUNCTION verify_checkin_location(
  p_place_id UUID,
  p_user_lat FLOAT,
  p_user_lng FLOAT,
  p_gps_accuracy FLOAT
) RETURNS TABLE(
  verified BOOLEAN,
  distance FLOAT,
  score INTEGER
) AS $$
DECLARE
  v_place_location geography;
  v_place_radius INTEGER;
  v_actual_distance FLOAT;
  v_distance_score INTEGER;
  v_accuracy_score INTEGER;
  v_total_score INTEGER;
BEGIN
  -- 1. 매장 위치 조회
  SELECT location, geofence_radius
  INTO v_place_location, v_place_radius
  FROM places
  WHERE id = p_place_id AND active = true;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0.0, 0;
    RETURN;
  END IF;
  
  -- 2. 실제 거리 계산
  v_actual_distance := ST_Distance(
    v_place_location,
    ST_SetSRID(ST_MakePoint(p_user_lng, p_user_lat), 4326)::geography
  );
  
  -- 3. 거리 점수 (40점 만점)
  IF v_actual_distance <= v_place_radius THEN
    v_distance_score := 40 - (v_actual_distance / v_place_radius * 10)::INTEGER;
  ELSE
    v_distance_score := 0;  -- 지오펜스 밖
  END IF;
  
  -- 4. GPS 정확도 점수 (30점 만점)
  IF p_gps_accuracy <= 10 THEN
    v_accuracy_score := 30;
  ELSIF p_gps_accuracy <= 20 THEN
    v_accuracy_score := 25;
  ELSIF p_gps_accuracy <= 30 THEN
    v_accuracy_score := 20;
  ELSE
    v_accuracy_score := 0;  -- 정확도 너무 낮음
  END IF;
  
  -- 5. 총점 계산 (WiFi, Time, Velocity는 애플리케이션 레벨)
  v_total_score := v_distance_score + v_accuracy_score;
  
  -- 6. 검증 결과
  RETURN QUERY SELECT
    (v_total_score >= 60) AS verified,
    v_actual_distance AS distance,
    v_total_score AS score;
END;
$$ LANGUAGE plpgsql;
```

**사용**:
```typescript
// src/services/checkin.service.ts
async verifyCheckin(data: CheckinDto) {
  const result = await db.query(`
    SELECT * FROM verify_checkin_location($1, $2, $3, $4)
  `, [
    data.placeId,
    data.latitude,
    data.longitude,
    data.gpsAccuracy
  ])
  
  const { verified, distance, score } = result.rows[0]
  
  if (!verified) {
    throw new Error(`체크인 실패: 거리 ${distance}m, 점수 ${score}/100`)
  }
  
  return { verified: true, score }
}
```

---

### 3. Mapbox 비용 산정 (교정)

#### ❌ 이전 주장
- "Geofencing 50k 무료"
- "MTS Incremental $25 고정"

#### ✅ 실제 가격 (2025년 1월 기준)

**모바일 SDK (iOS/Android)**:
```
무료 티어: 25,000 MAU/월
초과 시: $5 per 1,000 MAU

출처: https://www.softkraft.co/mapbox-vs-google-maps/
```

**웹 GL JS**:
```
무료 티어: 50,000 map loads/월
초과 시: $0.50 per 1,000 loads
```

**Geofencing**:
```
별도 트랜잭션 과금 항목 없음 (2025년 1월 기준)
iOS/Android 네이티브 기능 사용 시 추가 비용 없음
단, API 호출 (geocoding, directions)은 별도 과금
```

**MTS (Mapbox Tiling Service)**:
```
고정 요금 아님
과금 단위:
  - CU (Computing Units): 타일셋 생성/업데이트 시
  - Hosting Days: 타일셋 저장 기간
Incremental Update도 동일 과금 체계

출처: https://docs.mapbox.com/mapbox-tiling-service/guides/pricing/
```

**ZZIK 예상 비용 (보수적)**:
| 기간 | MAU | Mapbox 비용 | 비고 |
|------|-----|-------------|------|
| Month 1-3 (Beta) | 500 | **$0** | 무료 티어 |
| Month 6 | 5K | **$0** | 무료 티어 |
| Month 12 | 30K | **$25** | 5K 초과분 × $5 |
| Month 24 | 100K | **$375** | 75K 초과분 × $5 |

**권장**: Mapbox 공식 계산기로 실제 단가 산정  
https://www.mapbox.com/pricing/

---

### 4. Interactive Maps (현실화)

#### ❌ 이전 예시 (웹 GL JS 패턴)
```typescript
map.on('click', 'places-layer', (e) => { ... })
```

#### ✅ React Native 올바른 패턴

```typescript
// @rnmapbox/maps 사용
import { MapView, ShapeSource, SymbolLayer } from '@rnmapbox/maps'

<MapView
  style={{ flex: 1 }}
  styleURL="mapbox://styles/mapbox/streets-v12"
>
  <ShapeSource
    id="places"
    shape={placesGeoJSON}
    onPress={(e) => {
      const feature = e.features[0]
      navigation.navigate('PlaceDetail', { 
        placeId: feature.properties.id 
      })
    }}
  >
    <SymbolLayer
      id="places-icons"
      style={{
        iconImage: 'marker-15',
        iconSize: 1.5,
        iconAllowOverlap: true,
        textField: ['get', 'name'],
        textSize: 12,
        textOffset: [0, 1.5],
        textColor: '#333'
      }}
    />
  </ShapeSource>
</MapView>
```

**출처**: https://rnmapbox.github.io/docs/examples/

**주의사항**:
- `@rnmapbox/maps`는 웹 GL JS와 API 다름
- `ShapeSource` + `onPress` 콜백 사용
- 또는 `PointAnnotation` 컴포넌트 사용

---

### 5. Weather Effects (현실)

#### ❌ 존재하지 않는 API
```typescript
map.addWeatherLayer({ type: 'rain' })
```

#### ✅ 실제 구현 방법

**외부 API + GeoJSON 레이어**:
```typescript
// 1. OpenWeatherMap API 사용 (무료: 60 calls/분)
const weatherData = await fetch(
  `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${API_KEY}`
).then(r => r.json())

// 2. 날씨에 따른 레이어 추가
if (weatherData.weather[0].main === 'Rain') {
  // Raster 타일 추가 (강수 레이더)
  <RasterSource
    id="rain-radar"
    tileUrlTemplates={[
      'https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=' + API_KEY
    ]}
    tileSize={256}
  >
    <RasterLayer
      id="rain-layer"
      style={{ rasterOpacity: 0.6 }}
    />
  </RasterSource>
}

// 3. 날씨 기반 추천 로직 (애플리케이션 레벨)
function getWeatherRecommendations(weather: string): Place[] {
  if (weather === 'Rain') {
    return places.filter(p => p.indoor === true)
  } else if (weather === 'Clear') {
    return places.filter(p => p.hasOutdoorSeating === true)
  }
  return places
}
```

**비용**:
- OpenWeatherMap Free: 60 calls/분
- Mapbox는 레이어 추가 비용 없음

---

### 6. 3D Navigation (프리미엄 기능)

**구현 가능하나 성능 주의**:
```typescript
<MapView
  style={{ flex: 1 }}
  pitch={60}  // 3D 각도
>
  <FillExtrusionLayer
    id="3d-buildings"
    sourceID="composite"
    sourceLayerID="building"
    filter={['==', 'extrude', 'true']}
    style={{
      fillExtrusionColor: '#aaa',
      fillExtrusionHeight: ['get', 'height'],
      fillExtrusionBase: ['get', 'min_height'],
      fillExtrusionOpacity: 0.6
    }}
    minZoomLevel={15}  // 줌레벨 15 이상에서만 활성화
  />
</MapView>
```

**권장**:
- **줌레벨 조건부 로드** (15 이상)
- 저사양 기기는 2D로 폴백
- 프리미엄 유저만 활성화

---

## 📊 Mapbox 기능 우선순위 (수정)

| 기능 | 우선순위 | 실제 구현 난이도 | 비용 | 상태 |
|------|----------|------------------|------|------|
| **지도 표시** | P0 | 쉬움 | ₩0 (25K MAU) | ✅ 즉시 |
| **Geofencing (Transistorsoft)** | P0 | 중간 | $199 일회성 | ✅ 즉시 |
| **서버 검증 (PostGIS)** | P0 | 중간 | ₩0 | ✅ 즉시 |
| **Interactive POI** | P1 | 쉬움 | ₩0 | ✅ Week 4 |
| **날씨 레이어** | P2 | 중간 | ₩0 (OWM Free) | 📋 Month 3 |
| **3D 빌딩** | P3 | 중간 | ₩0 | 📋 Month 6 |
| **네이티브 브릿지** | P3 | 어려움 | ₩0 | 📋 Series A |

---

## 🛠️ 즉시 적용 가능한 코드

### Phase 1: 기본 지도 + 마커
```bash
cd /home/user/webapp/mobile
npm install @rnmapbox/maps

# iOS
cd ios && pod install && cd ..

# Android - auto-linked
```

```typescript
// app/screens/MapScreen.tsx
import MapView, { Camera, ShapeSource, SymbolLayer } from '@rnmapbox/maps'

MapView.setAccessToken('pk.YOUR_MAPBOX_TOKEN')

export default function MapScreen() {
  const [places, setPlaces] = useState([])
  
  useEffect(() => {
    fetchNearbyPlaces()
  }, [])
  
  return (
    <MapView style={{ flex: 1 }}>
      <Camera
        centerCoordinate={[126.9780, 37.5665]}
        zoomLevel={14}
      />
      
      <ShapeSource
        id="places"
        shape={placesGeoJSON}
        onPress={(e) => {
          navigation.navigate('PlaceDetail', { 
            placeId: e.features[0].properties.id 
          })
        }}
      >
        <SymbolLayer
          id="places-icons"
          style={{
            iconImage: 'marker-15',
            iconSize: 1.5
          }}
        />
      </ShapeSource>
    </MapView>
  )
}
```

### Phase 2: Geofencing (Transistorsoft)
```bash
npm install react-native-background-geolocation
cd ios && pod install && cd ..
```

(코드는 위 "옵션 1" 참조)

---

## 📋 다음 단계

1. **즉시**: Mapbox 계정 생성 + Access Token 발급
2. **Week 1**: 기본 지도 표시 + 마커
3. **Week 2**: Transistorsoft 라이센스 구매 ($199)
4. **Week 3**: Geofencing 구현 + 서버 검증
5. **Week 4**: Interactive POI + 알림

---

**작성자**: Claude with GPT-5 Pro Feedback  
**검토 필요**: CTO, 모바일 개발자  
**다음 업데이트**: MVP 완성 후 (v3.0)
