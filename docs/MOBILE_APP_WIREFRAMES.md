# ZZIK Mobile App - Wireframes & Specifications

**Version**: 1.0.0  
**Date**: 2025-11-11  
**Platform**: React Native (Expo)  
**Target**: iOS 14+ / Android 8+  
**Design System**: ZZIK (Orange #FF6B35, Navy #004E89, Green #00D9A3)

---

## 📱 5-Tab Structure Overview

```
┌─────────────────────────────────────┐
│  ZZIK Mobile App                    │
│  Pokemon GO + Xiaohongshu           │
└─────────────────────────────────────┘

Tab 1: 탐험 (Explore)    - Mapbox-centered discovery
Tab 2: 피드 (Feed)       - TikTok-style vertical reels
Tab 3: 미션 (Missions)   - GPS-verified tasks
Tab 4: 지갑 (Wallet)     - USDC rewards & vouchers
Tab 5: 프로필 (Profile)   - User stats & achievements
```

---

## 🗺️ **TAB 1: 탐험 (Explore) - Map Discovery**

### **Primary Function**
- **Pokemon GO-style map exploration**
- Discover voucher markers within GPS radius
- Real-time location tracking
- Radar animation for nearby spots

### **Wireframe (Portrait Mode)**

```
┌─────────────────────────────────────┐
│ ≡  탐험                    🔍  👤    │  ← Header
├─────────────────────────────────────┤
│                                     │
│        📍 MAPBOX GL MAP             │
│                                     │
│    🟠 ← Voucher Marker (40px)      │
│                                     │
│         🔵 ← You (pulsing)         │
│                                     │
│                🟠                   │
│                                     │
│     🟠                              │
│                                     │
│                         📍          │
│                                     │
├─────────────────────────────────────┤
│  ⊙  Radar (100m)    🎯 Filter       │  ← Controls
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │  📍 강남 카페                    │ │  ← Bottom Sheet
│ │  💰 5,000 USDC + 아메리카노      │ │
│ │  📏 25m 거리                     │ │
│ │  [ 체크인 시작 → ]               │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│  🗺️   📱   🎯   💰   👤             │  ← Tab Bar
└─────────────────────────────────────┘
```

### **Components**

#### **1. Map Container**
```tsx
<MapView
  provider={PROVIDER_MAPBOX}
  style={{ flex: 1 }}
  region={{
    latitude: userLocation.latitude,
    longitude: userLocation.longitude,
    latitudeDelta: 0.01, // ~1km radius
    longitudeDelta: 0.01,
  }}
  customMapStyle={mapStyle} // Dark mode support
>
  {/* Voucher Markers */}
  {vouchers.map(v => (
    <Marker
      key={v.id}
      coordinate={{ latitude: v.lat, longitude: v.lng }}
      onPress={() => showVoucherDetail(v)}
    >
      <VoucherMarkerIcon rarity={v.rarity} />
    </Marker>
  ))}
  
  {/* User Location (Pulsing Circle) */}
  <Circle
    center={userLocation}
    radius={100} // GPS accuracy radius
    fillColor="rgba(255, 107, 53, 0.2)" // ZZIK Orange
    strokeColor="rgba(255, 107, 53, 0.8)"
  />
</MapView>
```

#### **2. Voucher Marker Icon**
```
Rarity Levels (Pokemon GO-inspired):
┌─────┬─────────┬────────────┐
│ Tier│ Color   │ Frequency  │
├─────┼─────────┼────────────┤
│ 🟢  │ Green   │ Common     │
│ 🔵  │ Blue    │ Uncommon   │
│ 🟣  │ Purple  │ Rare       │
│ 🟠  │ Orange  │ Epic       │
│ 🔴  │ Red     │ Legendary  │
└─────┴─────────┴────────────┘

Size: 40x40px (--map-marker-size)
Animation: Bounce on appear, pulse when nearby
```

#### **3. Bottom Sheet (Voucher Detail)**
```tsx
<BottomSheet
  snapPoints={['25%', '50%', '90%']}
  initialSnapIndex={0}
>
  <VoucherCard>
    <Image source={{ uri: voucher.thumbnailUrl }} />
    <Title>{voucher.businessName}</Title>
    <Subtitle>{voucher.category} · {voucher.distance}m</Subtitle>
    <Reward>
      💰 {voucher.usdcAmount} USDC + {voucher.physicalReward}
    </Reward>
    <Requirements>
      ✓ GPS 반경 40m 이내
      ✓ Wi-Fi 스캔 필요
      ✓ 영상 촬영 (15초 이상)
    </Requirements>
    <Button
      variant="primary"
      onPress={startCheckin}
      disabled={!isInRange}
    >
      체크인 시작 →
    </Button>
  </VoucherCard>
</BottomSheet>
```

#### **4. Radar Control**
```
⊙ Radar Button (Top-left)
- Tap: Toggle 100m discovery radius
- Animation: Ripple effect when active
- Badge: Show count of nearby vouchers (e.g., "3")
```

#### **5. Filter Modal**
```
🎯 Filter Button (Top-right)
┌─────────────────────────────────────┐
│ 필터                         [X]    │
├─────────────────────────────────────┤
│ 카테고리                             │
│ ☐ 카페  ☐ 식당  ☐ 쇼핑  ☐ 미용     │
│                                     │
│ 거리                                 │
│ ├─────●────┤  500m                 │
│                                     │
│ 보상                                 │
│ ├●──────────┤  5,000 USDC 이상     │
│                                     │
│ [ 초기화 ]        [ 적용 ]          │
└─────────────────────────────────────┘
```

---

## 📱 **TAB 2: 피드 (Feed) - Vertical Reels**

### **Primary Function**
- **TikTok/Instagram Reels-style infinite scroll**
- Location-based algorithm (show nearby spots first)
- Like/comment/share social features
- Auto-play vertical video (9:16)

### **Wireframe (Full-screen Video)**

```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│         VERTICAL VIDEO              │
│         (9:16 Aspect)               │
│                                     │
│   👤 @username  [ Follow ]          │  ← Overlay
│   📍 강남 스타벅스                   │
│                                     │
│                                     │
│                                     │
│                                ❤️    │  ← Actions
│                              12.5K  │
│                                💬   │
│                              1.2K   │
│                                🔖   │
│                               324   │
│                                ↗️   │
│                                     │
│   💰 5,000 USDC 획득!               │  ← Reward
│   ☕ 아메리카노 무료 쿠폰             │
│                                     │
├─────────────────────────────────────┤
│  🗺️   📱   🎯   💰   👤             │  ← Tab Bar
└─────────────────────────────────────┘

Swipe ↑: Next video
Swipe ↓: Previous video
Tap: Pause/Play
Double-tap: Like (heart animation)
```

### **Components**

#### **1. Video Player**
```tsx
<FlatList
  data={reels}
  renderItem={({ item }) => (
    <ReelItem
      uri={item.videoUrl}
      aspectRatio={9/16} // --video-aspect-ratio
      autoPlay={true}
      loop={true}
      resizeMode="cover"
    />
  )}
  pagingEnabled
  snapToAlignment="start"
  decelerationRate="fast"
  vertical
  showsVerticalScrollIndicator={false}
  onViewableItemsChanged={handleViewableItemsChanged}
  viewabilityConfig={{
    itemVisiblePercentThreshold: 80 // 80% visible = auto-play
  }}
/>
```

#### **2. Overlay Info (Top)**
```tsx
<View style={styles.topOverlay}>
  <Avatar source={{ uri: reel.userAvatar }} size={40} />
  <Text style={styles.username}>@{reel.username}</Text>
  {!reel.isFollowing && (
    <Button variant="outline" size="sm" onPress={follow}>
      팔로우
    </Button>
  )}
  <Text style={styles.location}>📍 {reel.businessName}</Text>
</View>
```

#### **3. Action Buttons (Right Side)**
```tsx
<View style={styles.actions}>
  {/* Like */}
  <ActionButton
    icon={reel.isLiked ? "❤️" : "🤍"}
    count={formatCount(reel.likeCount)}
    onPress={toggleLike}
  />
  
  {/* Comment */}
  <ActionButton
    icon="💬"
    count={formatCount(reel.commentCount)}
    onPress={openComments}
  />
  
  {/* Save */}
  <ActionButton
    icon={reel.isSaved ? "🔖" : "📌"}
    count={formatCount(reel.saveCount)}
    onPress={toggleSave}
  />
  
  {/* Share */}
  <ActionButton
    icon="↗️"
    onPress={share}
  />
</View>
```

#### **4. Reward Badge (Bottom)**
```tsx
<View style={styles.rewardBadge}>
  <LinearGradient
    colors={['rgba(255,107,53,0.9)', 'rgba(255,107,53,0.7)']}
    style={styles.gradient}
  >
    <Text style={styles.rewardText}>
      💰 {reel.usdcReward} USDC 획득!
    </Text>
    <Text style={styles.voucherText}>
      {reel.voucherDescription}
    </Text>
  </LinearGradient>
</View>
```

#### **5. Comment Bottom Sheet**
```
┌─────────────────────────────────────┐
│ 💬 댓글 1,234                [X]     │
├─────────────────────────────────────┤
│ 👤 user1  · 2시간 전                │
│    대박! 나도 가봐야겠다 🔥          │
│    [좋아요 45]  [답글]              │
│                                     │
│ 👤 user2  · 5시간 전                │
│    여기 진짜 맛있어요!               │
│    [좋아요 12]  [답글]              │
│                                     │
├─────────────────────────────────────┤
│ 😊  댓글을 입력하세요...     [전송] │
└─────────────────────────────────────┘
```

---

## 🎯 **TAB 3: 미션 (Missions) - GPS Tasks**

### **Primary Function**
- **Task tracking with GPS verification**
- Daily/weekly/special missions
- Progress bars and completion rewards
- Gamification with badges

### **Wireframe**

```
┌─────────────────────────────────────┐
│ ≡  미션                    🔔  ⚙️    │  ← Header
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │  🎯 오늘의 미션                  │ │  ← Daily
│ │  ▓▓▓▓▓▓▓░░░  70% (7/10)        │ │
│ │  💰 +10,000 USDC                │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │  ✅ 강남 3곳 체크인               │ │  ← Completed
│ │  완료!  +3,000 USDC             │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │  🔄 명동 카페 체크인              │ │  ← In Progress
│ │  📍 150m 거리                    │ │
│ │  ▓▓░░░  40% (2/5)               │ │
│ │  [ 지도에서 보기 ]               │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │  🔒 VIP 미션 (레벨 5 필요)       │ │  ← Locked
│ │  💎 +50,000 USDC                │ │
│ └─────────────────────────────────┘ │
│                                     │
├─────────────────────────────────────┤
│  🗺️   📱   🎯   💰   👤             │  ← Tab Bar
└─────────────────────────────────────┘
```

### **Components**

#### **1. Mission Card**
```tsx
<MissionCard status={mission.status}>
  {/* Header */}
  <View style={styles.header}>
    <Icon name={getStatusIcon(mission.status)} size={24} />
    <Title>{mission.title}</Title>
    {mission.isVIP && <Badge>VIP</Badge>}
  </View>
  
  {/* Progress */}
  <ProgressBar
    progress={mission.progress}
    color={mission.status === 'completed' ? 'green' : 'orange'}
  />
  <Text style={styles.progressText}>
    {mission.current}/{mission.total} 완료
  </Text>
  
  {/* Reward */}
  <View style={styles.reward}>
    <Text>💰 +{mission.usdcReward} USDC</Text>
  </View>
  
  {/* CTA */}
  {mission.status === 'in_progress' && (
    <Button onPress={() => navigateToMap(mission)}>
      지도에서 보기
    </Button>
  )}
  
  {mission.status === 'locked' && (
    <Text style={styles.requirement}>
      레벨 {mission.requiredLevel} 필요
    </Text>
  )}
</MissionCard>
```

#### **2. GPS Verification Flow**
```
Step 1: Start Mission
┌─────────────────────────────────────┐
│  🎯 명동 카페 체크인 미션             │
│                                     │
│  요구사항:                           │
│  ✓ GPS 반경 40m 이내                │
│  ✓ Wi-Fi 스캔 완료                  │
│  ✓ 체류 시간 5분 이상                │
│  ✓ 영상 촬영 (15초)                 │
│                                     │
│  [ 시작하기 ]                        │
└─────────────────────────────────────┘

Step 2: GPS Verification (Real-time)
┌─────────────────────────────────────┐
│  📍 위치 확인 중...                  │
│                                     │
│  ⊙ GPS 정확도: 15m  ✅              │
│  📶 Wi-Fi 신호: 3개 감지  ✅         │
│  ⏱️ 체류 시간: 00:03:45  ⏳         │
│  🎥 영상 촬영: 대기 중  ⏳           │
│                                     │
│  ▓▓▓░░  60/100 점                   │
│  (통과: 60점 이상)                   │
└─────────────────────────────────────┘

Step 3: Video Recording
┌─────────────────────────────────────┐
│         CAMERA VIEW                 │
│         (9:16)                      │
│                                     │
│   [ ⏺️ REC 00:12 ]                  │
│                                     │
│   가이드:                            │
│   • 매장 외관 촬영                   │
│   • 간판 포함                        │
│   • 최소 15초                        │
│                                     │
│  [ ⏹️ 정지 ]    [ ✓ 완료 ]          │
└─────────────────────────────────────┘

Step 4: Success
┌─────────────────────────────────────┐
│  🎉 미션 완료!                       │
│                                     │
│  💰 +3,000 USDC                     │
│  ☕ 아메리카노 무료 쿠폰              │
│                                     │
│  획득 배지:                          │
│  🏆 명동 탐험가 (3/5)                │
│                                     │
│  [ 피드에 공유하기 ]                 │
│  [ 다음 미션 보기 ]                  │
└─────────────────────────────────────┘
```

---

## 💰 **TAB 4: 지갑 (Wallet) - Rewards**

### **Primary Function**
- **USDC cryptocurrency balance**
- Voucher inventory management
- Transaction history
- Withdrawal to external wallet

### **Wireframe**

```
┌─────────────────────────────────────┐
│ ≡  지갑                    📊  ⚙️    │  ← Header
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │  💰 USDC 잔액                    │ │  ← Balance Card
│ │                                 │ │
│ │  ₮  125,500 USDC                │ │
│ │  ≈ ₩ 167,000                    │ │
│ │                                 │ │
│ │  [💸 출금]  [📈 통계]  [🔄 새로고침] │ │
│ └─────────────────────────────────┘ │
│                                     │
│  📌 보유 쿠폰 (5)                    │
│ ┌─────────────────────────────────┐ │
│ │ ☕ 스타벅스 아메리카노              │ │  ← Voucher
│ │ 📅 2025-11-30까지                │ │
│ │ [ 사용하기 ]                     │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 🍔 맥도날드 세트 할인 (30%)        │ │
│ │ 📅 2025-12-15까지                │ │
│ │ [ 사용하기 ]                     │ │
│ └─────────────────────────────────┘ │
│                                     │
│  📜 거래 내역                        │
│  오늘                                │
│  + 3,000 USDC  · 명동 카페 체크인    │
│  + 2,500 USDC  · 미션 완료           │
│                                     │
│  어제                                │
│  - 50,000 USDC · 출금 (Coinbase)    │
│  + 5,000 USDC  · 강남 식당 체크인    │
│                                     │
├─────────────────────────────────────┤
│  🗺️   📱   🎯   💰   👤             │  ← Tab Bar
└─────────────────────────────────────┘
```

### **Components**

#### **1. Balance Card**
```tsx
<Card style={styles.balanceCard}>
  <LinearGradient
    colors={['#FF6B35', '#FF8F5A']} // ZZIK Orange gradient
    style={styles.gradient}
  >
    <Text style={styles.label}>💰 USDC 잔액</Text>
    <Text style={styles.amount}>
      ₮ {formatNumber(balance.usdc)}
    </Text>
    <Text style={styles.fiat}>
      ≈ ₩ {formatNumber(balance.krw)}
    </Text>
    
    <View style={styles.actions}>
      <Button variant="secondary" onPress={withdraw}>
        💸 출금
      </Button>
      <Button variant="outline" onPress={showStats}>
        📈 통계
      </Button>
      <IconButton icon="🔄" onPress={refresh} />
    </View>
  </LinearGradient>
</Card>
```

#### **2. Voucher List**
```tsx
<SectionList
  sections={[
    { title: '📌 보유 쿠폰', data: vouchers },
    { title: '📜 거래 내역', data: transactions },
  ]}
  renderItem={({ item, section }) =>
    section.title.includes('쿠폰') ? (
      <VoucherCard voucher={item} />
    ) : (
      <TransactionRow transaction={item} />
    )
  }
/>
```

#### **3. Withdrawal Modal**
```
┌─────────────────────────────────────┐
│ 💸 USDC 출금                  [X]   │
├─────────────────────────────────────┤
│  출금 금액                           │
│  ┌─────────────────────────────┐   │
│  │ 50,000                      │   │
│  └─────────────────────────────┘   │
│  잔액: 125,500 USDC                 │
│                                     │
│  받는 주소                           │
│  ┌─────────────────────────────┐   │
│  │ 0x742d35Cc6634C0532925...   │   │
│  └─────────────────────────────┘   │
│  [QR 스캔]                          │
│                                     │
│  수수료: 100 USDC (네트워크 비용)    │
│  받을 금액: 49,900 USDC             │
│                                     │
│  ⚠️ 출금은 1-3 영업일 소요됩니다     │
│                                     │
│  [ 취소 ]        [ 출금하기 ]       │
└─────────────────────────────────────┘
```

---

## 👤 **TAB 5: 프로필 (Profile) - User Stats**

### **Primary Function**
- **User profile with level/XP system**
- Badge collection (Pokemon GO-style)
- Social stats (followers, following)
- Settings and logout

### **Wireframe**

```
┌─────────────────────────────────────┐
│ ≡  프로필                  🔔  ⚙️    │  ← Header
├─────────────────────────────────────┤
│      ┌──────────────┐               │
│      │   AVATAR     │               │  ← Profile Photo
│      │   (100x100)  │               │
│      └──────────────┘               │
│                                     │
│      @username                      │
│      95년생 여성 창업자 🚀           │  ← Bio
│                                     │
│  ┌───────┬───────┬────────┐        │
│  │ 125   │  342  │  89    │        │  ← Stats
│  │ 체크인 │ 팔로워│ 팔로잉  │        │
│  └───────┴───────┴────────┘        │
│                                     │
│  [ ✏️ 프로필 수정 ]  [ 📤 공유 ]      │
│                                     │
├─────────────────────────────────────┤
│  🏆 레벨 & 경험치                    │
│  ┌─────────────────────────────────┐│
│  │ 레벨 7  탐험가                   ││
│  │ ▓▓▓▓▓▓▓▓░░  8,450 / 10,000 XP  ││
│  │ 다음 레벨까지 1,550 XP           ││
│  └─────────────────────────────────┘│
│                                     │
│  🎖️ 획득 배지 (12/50)               │
│  🏅 🏆 🌟 🔥 💎 ⭐                   │  ← Badge Row
│  ✨ 🎯 🚀 💰 📍 🗺️                   │
│  [ 전체 보기 → ]                    │
│                                     │
│  📊 통계                             │
│  • 총 획득 USDC: 245,000            │
│  • 방문한 장소: 125곳                │
│  • 업로드한 영상: 89개               │
│  • 받은 좋아요: 12.5K                │
│                                     │
│  ⚙️ 설정                            │
│  • 알림 설정                         │
│  • 개인정보 보호                     │
│  • 고객 지원                         │
│  • 로그아웃                          │
│                                     │
├─────────────────────────────────────┤
│  🗺️   📱   🎯   💰   👤             │  ← Tab Bar
└─────────────────────────────────────┘
```

### **Components**

#### **1. Profile Header**
```tsx
<View style={styles.profileHeader}>
  <Avatar
    source={{ uri: user.avatarUrl }}
    size={100}
    onPress={changeAvatar}
  />
  
  <Text style={styles.username}>@{user.username}</Text>
  <Text style={styles.bio}>{user.bio}</Text>
  
  <View style={styles.stats}>
    <Stat label="체크인" value={user.checkinCount} />
    <Stat label="팔로워" value={user.followerCount} />
    <Stat label="팔로잉" value={user.followingCount} />
  </View>
  
  <View style={styles.actions}>
    <Button variant="secondary" onPress={editProfile}>
      ✏️ 프로필 수정
    </Button>
    <Button variant="outline" onPress={shareProfile}>
      📤 공유
    </Button>
  </View>
</View>
```

#### **2. Level Progress**
```tsx
<Card style={styles.levelCard}>
  <View style={styles.header}>
    <Text style={styles.level}>레벨 {user.level}</Text>
    <Text style={styles.title}>{user.levelTitle}</Text>
  </View>
  
  <ProgressBar
    progress={user.xp / user.xpToNextLevel}
    color="#00D9A3" // ZZIK Green
  />
  
  <Text style={styles.xpText}>
    {user.xp} / {user.xpToNextLevel} XP
  </Text>
  <Text style={styles.remaining}>
    다음 레벨까지 {user.xpToNextLevel - user.xp} XP
  </Text>
</Card>
```

#### **3. Badge Grid**
```tsx
<View style={styles.badgeSection}>
  <Text style={styles.sectionTitle}>
    🎖️ 획득 배지 ({user.badges.length}/50)
  </Text>
  
  <FlatList
    data={user.badges}
    numColumns={6}
    renderItem={({ item }) => (
      <BadgeIcon
        emoji={item.emoji}
        unlocked={item.unlocked}
        onPress={() => showBadgeDetail(item)}
      />
    )}
  />
  
  <Button variant="text" onPress={showAllBadges}>
    전체 보기 →
  </Button>
</View>
```

#### **4. Badge Detail Modal**
```
┌─────────────────────────────────────┐
│ 🏅 강남 탐험가                [X]    │
├─────────────────────────────────────┤
│          [ 🏅 ]                     │
│       (100x100 icon)                │
│                                     │
│  강남 지역 10곳 체크인 완료          │
│                                     │
│  진행도: ▓▓▓▓▓▓▓░░░  7/10          │
│                                     │
│  보상:                               │
│  • +5,000 USDC                      │
│  • 강남 VIP 쿠폰                     │
│                                     │
│  [ 닫기 ]                           │
└─────────────────────────────────────┘
```

---

## 🎨 Design System Integration

### **Colors (OKLCH)**
```tsx
const colors = {
  primary: 'oklch(65% 0.20 35)',     // Orange #FF6B35
  secondary: 'oklch(48% 0.13 245)',  // Navy #004E89
  accent: 'oklch(75% 0.15 165)',     // Green #00D9A3
  
  // Semantic
  success: 'oklch(65% 0.20 145)',
  warning: 'oklch(70% 0.18 80)',
  error: 'oklch(60% 0.22 30)',
  
  // Neutrals
  background: 'oklch(100% 0 240)',
  surface: 'oklch(98% 0.002 240)',
  text: 'oklch(12% 0.004 240)',
  textSecondary: 'oklch(45% 0.015 240)',
};
```

### **Typography**
```tsx
const typography = {
  // Korean (default)
  fontFamily: 'Pretendard',
  
  // Sizes (4px base)
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  
  // Weights
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};
```

### **Spacing (4px Base)**
```tsx
const spacing = {
  0: 0,
  1: 4,   // 4px
  2: 8,   // 8px
  3: 12,  // 12px
  4: 16,  // 16px
  6: 24,  // 24px
  8: 32,  // 32px
  12: 48, // 48px
};
```

### **Shadows (iOS-style)**
```tsx
const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 15,
    elevation: 8,
  },
};
```

---

## 🔄 User Flows

### **Flow 1: Check-in Process**
```
1. [Map Tab] → Tap voucher marker
2. [Bottom Sheet] → View details → "체크인 시작"
3. [GPS Verification] → Real-time scoring (60+ points)
4. [Video Recording] → 15s minimum
5. [Success Screen] → Reward claimed
6. [Feed Tab] → Auto-post to feed (optional)
```

### **Flow 2: Mission Completion**
```
1. [Missions Tab] → Select active mission
2. [Mission Detail] → "지도에서 보기"
3. [Map Tab] → Navigate to location
4. [Check-in] → Complete requirements
5. [Missions Tab] → Progress updated
6. [Reward Screen] → USDC + Badge
```

### **Flow 3: Withdraw USDC**
```
1. [Wallet Tab] → "출금" button
2. [Withdrawal Modal] → Enter amount + address
3. [Confirmation] → Review details
4. [2FA] → Biometric/PIN verification
5. [Processing] → Transaction pending (1-3 days)
6. [Email] → Confirmation receipt
```

---

## 📊 Technical Specifications

### **Performance Targets**
| Metric | Target | Measurement |
|--------|--------|-------------|
| **App Launch** | < 2s | Cold start to interactive |
| **Map Load** | < 1s | Mapbox tiles render |
| **Video Buffer** | < 500ms | First frame display |
| **Check-in** | < 3s | GPS verification complete |
| **Feed Scroll** | 60 FPS | Smooth infinite scroll |

### **Device Support**
- **iOS**: 14.0+ (iPhone 8 and newer)
- **Android**: 8.0+ (API level 26)
- **Screen Sizes**: 320px - 414px width (mobile-first)

### **Permissions Required**
```json
{
  "ios": {
    "NSLocationWhenInUseUsageDescription": "체크인 시 위치 정보 사용",
    "NSLocationAlwaysUsageDescription": "백그라운드 미션 추적",
    "NSCameraUsageDescription": "영상 촬영",
    "NSPhotoLibraryUsageDescription": "사진 업로드"
  },
  "android": {
    "ACCESS_FINE_LOCATION": true,
    "ACCESS_COARSE_LOCATION": true,
    "CAMERA": true,
    "READ_EXTERNAL_STORAGE": true
  }
}
```

---

## 🧪 Usability Testing Checklist

### **Tab 1 - 탐험 (Explore)**
- [ ] Map loads within 1 second
- [ ] Voucher markers appear correctly
- [ ] User location updates in real-time
- [ ] Radar toggle works smoothly
- [ ] Bottom sheet slides correctly
- [ ] Filter applies immediately

### **Tab 2 - 피드 (Feed)**
- [ ] Videos auto-play at 80% visibility
- [ ] Swipe gesture is smooth (60 FPS)
- [ ] Double-tap like animates
- [ ] Comment bottom sheet opens
- [ ] Share functionality works
- [ ] Auto-play respects battery saver

### **Tab 3 - 미션 (Missions)**
- [ ] Mission cards display correctly
- [ ] Progress bars animate smoothly
- [ ] GPS verification scores in real-time
- [ ] Video recording starts instantly
- [ ] Success screen shows rewards
- [ ] Badge unlocks trigger animation

### **Tab 4 - 지갑 (Wallet)**
- [ ] Balance updates immediately
- [ ] Vouchers display correctly
- [ ] Transaction history loads fast
- [ ] Withdrawal modal validates input
- [ ] QR scanner works
- [ ] Fiat conversion is accurate

### **Tab 5 - 프로필 (Profile)**
- [ ] Avatar uploads correctly
- [ ] Stats display accurately
- [ ] Level progress bar animates
- [ ] Badge grid scrolls smoothly
- [ ] Settings save immediately
- [ ] Logout clears session

---

## 📱 Responsive Breakpoints

### **Mobile Sizes**
```tsx
const breakpoints = {
  small: 320,   // iPhone SE
  medium: 375,  // iPhone 12/13
  large: 414,   // iPhone 12 Pro Max
  xlarge: 428,  // iPhone 14 Pro Max
};
```

### **Adaptive Layouts**
- **320px**: Single column, compact spacing
- **375px**: Standard layout (default)
- **414px**: Larger tap targets, more padding
- **Tablet**: Side-by-side panels (future)

---

## 🎬 Animation Specifications

### **Micro-interactions**
| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| **Button Press** | Scale 0.95 | 100ms | ease-out |
| **Card Swipe** | Slide + Fade | 250ms | spring |
| **Like Heart** | Scale + Rotate | 350ms | spring |
| **Progress Bar** | Width transition | 500ms | ease-in-out |
| **Badge Unlock** | Pop + Glow | 800ms | bounce |
| **Map Marker** | Bounce | 300ms | ease-out |

### **Haptic Feedback**
```tsx
import * as Haptics from 'expo-haptics';

// Button press
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

// Success
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

// Error
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
```

---

## 🔐 Security Considerations

### **GPS Spoofing Prevention**
- 5-factor integrity algorithm (60+ points required)
- Wi-Fi SSID cross-reference
- Accelerometer/gyroscope data
- Network latency checks
- Server-side PostGIS validation

### **Data Privacy**
- No GPS coordinates stored in logs
- SSID hashed after 7 days
- Video metadata stripped
- User location obfuscated in feed
- GDPR/CCPA compliant

---

## 📝 Development Roadmap

### **Phase 1: MVP (Weeks 1-2)**
- [ ] Tab 1 (Explore) - Basic map + markers
- [ ] Tab 3 (Missions) - Mission list + GPS verification
- [ ] Tab 4 (Wallet) - Balance display + transaction history

### **Phase 2: Social (Weeks 3-4)**
- [ ] Tab 2 (Feed) - Video upload + infinite scroll
- [ ] Like/comment/share functionality
- [ ] Follow/unfollow users

### **Phase 3: Profile (Weeks 5-6)**
- [ ] Tab 5 (Profile) - User profile + stats
- [ ] Level/XP system
- [ ] Badge collection

### **Phase 4: Polish (Weeks 7-8)**
- [ ] Animations + haptic feedback
- [ ] Dark mode support
- [ ] Performance optimization
- [ ] Beta testing

---

**Status**: ✅ Wireframes Complete  
**Next**: Technical Architecture Document

---

**Notes**:
- All dimensions follow ZZIK design system (4px base)
- Colors use OKLCH for perceptual uniformity
- Wireframes prioritize mobile-first (portrait mode)
- GPS integrity is server-verified (client only collects data)
- Compliance: No hospital real names in public screens
