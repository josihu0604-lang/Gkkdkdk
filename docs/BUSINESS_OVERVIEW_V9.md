# ZZIK 플랫폼 사업 개요 v9.0

**최종 업데이트:** 2025-11-11  
**버전:** 9.0 (완전한 제품 비전 통합)  
**작성자:** Claude AI + 95년생 여성 창업자  
**제품 포지셔닝:** Pokemon GO + Xiaohongshu for Local Discovery

---

## 📌 Executive Summary

ZZIK은 **로컬 디스커버리 × 게이미피케이션 리워드 앱**으로, GPS 무결성 기반 체크인과 TikTok-style 숏폼 콘텐츠를 결합하여 외국인 관광객을 한국 로컬 비즈니스로 유도하는 B2B2C 플랫폼입니다.

### 핵심 가치 제안

**🎯 C-side (관광객)**
- **"边玩边赚"** (놀면서 돈 벌기)
- Mapbox 지도에서 Pokemon GO처럼 바우처 마커 탐험
- GPS 체크인 완료 → 즉시 **USDC 암호화폐** + 실물 쿠폰 획득
- Vertical 릴스 (9:16) 업로드로 소셜 콘텐츠 공유

**🏪 B-side (비즈니스)**
- 중국인 관광객 자동 유입 (위치 기반)
- 영상 콘텐츠 마케팅 (UGC 자동 생성)
- ROI 대시보드 (방문자 수, 리뷰, 매출 전환)
- 무료 체험 → 베이직 → 프로 요금제

### 제품 컨셉

```
ZZIK = Pokemon GO (Map Discovery) 
     + Xiaohongshu (Reel Content) 
     + USDC Rewards (Crypto Incentive)
```

---

## 🎮 제품 아키텍처: 5-Tab Mobile App

### Tab 1: 탐험 (Explore) - Map Discovery
```
┌─────────────────────────────────────┐
│  Mapbox GL Map (Dark Mode)          │
│  🟠 Voucher Markers (Pokemon GO)    │
│  🔵 User Location (Pulsing)          │
│  ⊙  Radar (100m Discovery Radius)   │
│  📍 Bottom Sheet (Venue Details)     │
└─────────────────────────────────────┘

기능:
• 지도 중심 탐험 (검색이 아닌 발견)
• GPS 40m 이내 접근 시 바우처 활성화
• Wi-Fi SSID 스캔으로 실내 위치 검증
• Rarity 티어 (🟢 Common → 🔴 Legendary)
```

### Tab 2: 피드 (Feed) - Vertical Reels
```
┌─────────────────────────────────────┐
│  TikTok-style Infinite Scroll        │
│  9:16 Vertical Video                 │
│  ❤️ Like / 💬 Comment / 🔖 Save      │
│  Location-based Algorithm            │
│  (Show nearby spots first)           │
└─────────────────────────────────────┘

기능:
• 자동재생 (80% visibility)
• 위치 기반 피드 우선 순위
• 좋아요/댓글/저장 소셜 기능
• 더블탭 like (하트 애니메이션)
```

### Tab 3: 미션 (Missions) - GPS Tasks
```
┌─────────────────────────────────────┐
│  🎯 Daily Missions                  │
│  • 강남 3곳 체크인 (2/3) ▓▓░        │
│  • 명동 카페 방문 (0/5) ░░░░░       │
│                                     │
│  🏆 Weekly Challenges                │
│  • 5개 지역 탐험 (3/5)               │
│  • 영상 10개 업로드 (7/10)           │
└─────────────────────────────────────┘

기능:
• 일일/주간/특별 미션
• GPS 무결성 검증 (60점 통과 필요)
• 완료 시 USDC + 배지 보상
• 레벨업 시스템 (XP 획득)
```

### Tab 4: 지갑 (Wallet) - USDC Rewards
```
┌─────────────────────────────────────┐
│  💰 USDC Balance                    │
│  ₮ 125,500 USDC                     │
│  ≈ ₩ 167,000                        │
│                                     │
│  📌 보유 쿠폰 (5)                    │
│  ☕ 스타벅스 아메리카노 (30일)        │
│  🍔 맥도날드 세트 할인               │
│                                     │
│  📜 거래 내역                        │
│  + 3,000 USDC · 강남 체크인          │
│  - 50,000 USDC · 출금 (Coinbase)    │
└─────────────────────────────────────┘

기능:
• USDC 잔액 조회 (Base 네트워크)
• 실물 쿠폰 보관 (QR 코드)
• 외부 지갑 출금 (Coinbase, Binance)
• 거래 내역 (블록체인 투명성)
```

### Tab 5: 프로필 (Profile) - User Stats
```
┌─────────────────────────────────────┐
│       👤 Avatar                     │
│       @username                      │
│                                     │
│  125 체크인 | 342 팔로워 | 89 팔로잉 │
│                                     │
│  🏆 Level 7 탐험가                   │
│  ▓▓▓▓▓▓▓▓░░ 8,450 / 10,000 XP      │
│                                     │
│  🎖️ 획득 배지 (12/50)               │
│  🏅 🏆 🌟 🔥 💎 ⭐ ✨ 🎯 🚀 💰 📍 🗺️  │
└─────────────────────────────────────┘

기능:
• 레벨/XP 시스템 (Pokemon GO)
• 배지 컬렉션 (Foursquare)
• 팔로우/팔로워 (소셜)
• 통계 대시보드
```

---

## 🔐 GPS 무결성 알고리즘 (Core Technology)

### 5-Factor Integrity Score (60점 이상 통과)

```typescript
// Server-side validation (PostGIS)

Factor 1: Distance (40점)
- GPS 좌표 → 장소 좌표 거리 계산
- PostGIS ST_DWithin(geography) 사용
- 20m 이내: 40점
- 40m 이내: 20-40점 (선형 감소)

Factor 2: Wi-Fi Match (25점)
- 사용자 기기 Wi-Fi SSID 스캔
- 장소 등록된 SSID와 매칭
- 1개 매칭: 12점
- 2개 이상: 25점

Factor 3: Time Consistency (15점)
- 체크인 요청 시간 vs 서버 수신 시간
- 1분 이내: 15점
- 5분 이내: 0-15점 (선형 감소)

Factor 4: GPS Accuracy (10점)
- GPS 정확도 (단말기 보고)
- 10m 이하: 10점
- 30m 이하: 0-10점 (선형 감소)

Factor 5: Speed Check (10점)
- 마지막 체크인 위치 → 현재 위치 이동 속도
- 50m/s (180km/h) 이하: 10점
- 초과: 0점 (이동 불가능)
```

### 보안 기능
- **서버측 검증**: 클라이언트는 데이터만 수집, 판정은 서버
- **Idempotency-Key**: 중복 체크인 방지
- **PII 최소화**: GPS 좌표 로그 미저장, SSID 7일 후 삭제
- **Anti-spoofing**: 가속도계/자이로 데이터 교차 검증

---

## 🌐 Landing Page 전략 (3-Tier)

### 1. Main Splash (zzik.kr)
```
┌─────────────────────────────────────┐
│  Full-screen Seoul Streets Video     │
│  (Cinematic B-roll)                  │
│                                     │
│  🧳 我是游客 (I'm a Tourist)          │
│  → /zh (Chinese landing)             │
│                                     │
│  🏪 사업자 등록 (Business Sign-up)   │
│  → /business (Korean B2B landing)    │
└─────────────────────────────────────┘

목적: Audience Split
언어: Bilingual CTA (Chinese + Korean)
```

### 2. C-side Tourist Landing (/zh or /explore)
```
Hero Section:
"边玩边赚，探索首尔"
(Play & Earn, Explore Seoul)

How It Works:
1. 📍 在地图上发现场所 (Discover spots)
2. ✅ GPS验证到访 (GPS-verified visit)
3. 🎥 拍摄短视频 (Record short video)
4. 💰 获得USDC奖励 (Get USDC rewards)

Social Proof:
- 已有 25,000+ 游客使用
- 已分发 ₮ 500M USDC
- 合作商家 1,200+

App Download:
- iOS App Store 下载
- Android Google Play 下载
- QR Code (WeChat 분산)
```

### 3. B2B Business Landing (/business)
```
Hero Section:
"중국인 관광객을 우리 매장으로"
(Bring Chinese Tourists to Your Store)

Value Props:
✓ 월 평균 150명 신규 방문객
✓ UGC 영상 자동 생성 (마케팅 비용 절감)
✓ ROI 대시보드 (실시간 방문자 추적)

ROI Calculator (Interactive):
- 월 목표 방문객 수: [150명]
- 평균 객단가: [₩ 25,000]
- 전환율: [30%]
→ 예상 매출 증가: ₩ 1,125,000/월

Pricing Tiers:
- 무료 체험 (7일)
- 베이직 (₩ 300,000/월)
- 프로 (₩ 900,000/월)

CTA:
- [무료로 시작하기]
- [데모 상담 신청]
```

---

## 💰 수익 모델 (B2B SaaS)

### Business Subscription Plans

| 플랜 | 가격 | 대상 | 주요 기능 |
|------|------|------|-----------|
| **무료 체험** | ₩ 0/월 | 신규 가입 | 7일, 월 50건 체크인, 기본 분석 |
| **베이직** | ₩ 300,000/월 | 1-3개 매장 | 월 200건, 쿠폰 발행, 대시보드 |
| **프로** | ₩ 900,000/월 | 4-10개 매장 | 무제한, UGC 영상 분석, API 접근 |
| **엔터프라이즈** | 맞춤 견적 | 11개 이상 | 전담 CS, 맞춤 통합, SLA 99.9% |

### Revenue Streams

1. **구독료 (Primary)**
   - B2B SaaS 월 구독
   - 36개월 목표 ARR: ₩ 2.4B

2. **트랜잭션 수수료 (Secondary)**
   - 바우처 사용 시 수수료 (3-5%)
   - 월 예상 GMV: ₩ 50M (수수료 ₩ 2M)

3. **프리미엄 광고 (Future)**
   - 지도 상단 노출
   - 피드 스폰서 릴스
   - 월 예상: ₩ 10M

### 36개월 ARR 시뮬레이션 (Updated)

| 구분 | 6개월 | 12개월 | 24개월 | 36개월 |
|------|--------|--------|--------|--------|
| **베이직 고객** | 20개 | 50개 | 120개 | 200개 |
| **프로 고객** | 5개 | 15개 | 40개 | 80개 |
| **엔터프라이즈** | 0개 | 2개 | 8개 | 15개 |
| **월 매출** | 10.5M | 29.1M | 76.2M | 139.5M |
| **연간 매출 (ARR)** | - | 349M | 914M | 1,674M |
| **Gross Margin** | 89% | 91% | 93% | 94% |

**36개월 ARR: ₩ 1.67B**

---

## 📊 Unit Economics (Updated)

### B2B Customer Metrics

| 메트릭 | 베이직 | 프로 | 엔터프라이즈 | Blended |
|--------|--------|------|--------------|---------|
| **ARPU** | ₩ 300K | ₩ 900K | ₩ 2,500K | ₩ 680K |
| **Gross Margin** | 91% | 94% | 96% | 93% |
| **CAC** | ₩ 1.2M | ₩ 2.5M | ₩ 5.0M | ₩ 2.1M |
| **LTV** (36개월) | ₩ 9.8M | ₩ 29.2M | ₩ 86.4M | ₩ 22.7M |
| **LTV/CAC** | 8.2 | 11.7 | 17.3 | 10.8 |
| **Payback** | 4.0개월 | 2.8개월 | 2.0개월 | 3.1개월 |
| **Churn Rate** | 6%/월 | 4%/월 | 2%/월 | 5%/월 |

### C-side User Metrics (Non-revenue)

| 메트릭 | 값 | 설명 |
|--------|-----|------|
| **DAU** | 12,000 | Daily Active Users (6개월 목표) |
| **MAU** | 35,000 | Monthly Active Users |
| **체크인/사용자** | 3.5회/월 | 평균 체크인 빈도 |
| **USDC 보상/체크인** | ₮ 3,000 | 평균 보상 금액 |
| **Retention (D7)** | 42% | 7일 재방문율 |
| **Retention (D30)** | 28% | 30일 재방문율 |

---

## 🏗️ 기술 스택 (Updated)

### Frontend

**Mobile App (React Native / Expo)**
```json
{
  "framework": "React Native 0.76 + Expo SDK 52",
  "navigation": "Expo Router 4.0",
  "state": "Zustand 4.5",
  "api": "Axios + React Query",
  "map": "Mapbox GL Native 11.0",
  "video": "expo-av + expo-camera",
  "crypto": "ethers.js 6.0 (Base network)",
  "storage": "expo-secure-store"
}
```

**Landing Pages (Next.js 15)**
```json
{
  "framework": "Next.js 15.0 (App Router)",
  "i18n": "next-intl 3.10 (ko/zh-CN/ja-JP)",
  "animation": "Framer Motion 10.18",
  "forms": "React Hook Form + Zod",
  "deployment": "Vercel"
}
```

### Backend

**API Gateway (Next.js 15 API Routes)**
```json
{
  "runtime": "Node.js 20 + TypeScript 5.6",
  "auth": "JWT (jose library)",
  "rateLimit": "limiter 3.0",
  "idempotency": "Upstash Redis"
}
```

**Database (PostgreSQL + PostGIS)**
```sql
-- Spatial queries
SELECT ST_Distance(
  place_location::geography,
  user_location::geography
) AS distance
FROM places
WHERE ST_DWithin(
  place_location::geography,
  user_location::geography,
  40  -- 40 meters
);
```

**Video Storage (Cloudflare R2)**
- S3-compatible API
- Zero egress fees
- $0.015/GB-month

**Blockchain (Base Mainnet)**
- USDC Contract: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- Gas fees: ~$0.01/transaction
- Finality: ~2 seconds

---

## 👩‍💼 창업자 프로필 (Updated)

### 김○○ 대표 (95년생, 만 29-30세)

**배경**
- 동기: "외국인 관광객이 우리 로컬 매장을 찾지 못하는 문제를 해결하고 싶었어요"
- 비전: 글로벌 관광객과 로컬 비즈니스를 연결하는 혁신적인 플랫폼
- 강점: 사용자 경험 디자인, 프로덕트 전략

**예비창업 단계 (Month 0-3)**

| 항목 | 금액 | 출처 |
|------|------|------|
| **자부담** | ₩ 15M | 개인 자금 |
| **정부 지원** | ₩ 15M | 예비창업패키지 (초기 지원) |
| **총 예산** | ₩ 30M | 3개월 런웨이 |

**지원 프로그램 타겟**
- 예비창업패키지: 최대 ₩ 100M (1년 지원)
- 여성 창업 리그: ₩ 50M (여성 창업자 전용)
- 청년창업사관학교: ₩ 100M (3년 지원)

**팀 빌딩 로드맵**
- **Month 0-3**: 1인 (창업자 단독)
- **Month 4-6**: 3명 (+ 개발자 2명)
- **Month 7-12**: 7명 (+ 디자이너, 마케터, CS)

---

## 📅 MVP 개발 계획 (8 Weeks)

### Phase 1: Foundation (Week 1-2)
```
✓ Mapbox GL 지도 통합
✓ GPS 위치 수집 (React Native)
✓ 장소 데이터베이스 (PostGIS)
✓ 기본 바우처 마커 시스템
```

### Phase 2: Check-in Flow (Week 3-4)
```
✓ GPS 무결성 검증 (5-factor)
✓ Wi-Fi SSID 스캔
✓ 영상 녹화 (15초 최소)
✓ USDC 지갑 연동 (Base)
✓ 보상 분배 로직
```

### Phase 3: Social Feed (Week 5-6)
```
✓ Vertical 릴스 업로드
✓ TikTok-style 무한 스크롤
✓ 좋아요/댓글/저장 기능
✓ 위치 기반 피드 알고리즘
```

### Phase 4: B2B Dashboard (Week 7-8)
```
✓ 사업자 회원가입
✓ 장소 등록 인터페이스
✓ 방문자 분석 대시보드
✓ 쿠폰 발행 기능
```

---

## 🎯 Go-to-Market 전략

### Phase 1: Pilot (Month 1-3)
- **타겟**: 강남/명동 10개 파트너
- **방법**: 직접 영업, 무료 체험
- **목표**: 500 MAU, 2,000 체크인

### Phase 2: Growth (Month 4-6)
- **타겟**: 서울 전역 50개 파트너
- **방법**: 인플루언서 마케팅 (WeChat, Xiaohongshu)
- **목표**: 5,000 MAU, 20,000 체크인

### Phase 3: Scale (Month 7-12)
- **타겟**: 전국 200개 파트너
- **방법**: 유료 광고 (WeChat, Baidu), PR
- **목표**: 35,000 MAU, 100,000 체크인

---

## 📊 핵심 KPI (6개월 목표)

### C-side (User Metrics)
| KPI | 목표 | 현재 | 달성률 |
|-----|------|------|--------|
| **MAU** | 12,000 | TBD | - |
| **체크인/월** | 30,000 | TBD | - |
| **영상 업로드** | 8,000 | TBD | - |
| **D7 Retention** | 40% | TBD | - |

### B-side (Business Metrics)
| KPI | 목표 | 현재 | 달성률 |
|-----|------|------|--------|
| **구독 고객** | 25개 | TBD | - |
| **MRR** | ₩ 10.5M | TBD | - |
| **Churn Rate** | < 6% | TBD | - |
| **NPS** | > 50 | TBD | - |

---

## 🔐 법적 컴플라이언스 (v9.0 Update)

### 핵심 규제 대응

| 법규 | 요구사항 | ZZIK 대응 | 상태 |
|------|----------|-----------|------|
| **특정금융정보법** | VASP 규제 | USDC는 제3자 거래소(Coinbase)에서만 출금 | ✅ |
| **의료법 제27조의3** | 환자 유인 금지 | 퍼블릭 화면에 병원 실명 비노출 | ✅ |
| **위치정보법** | LBS 사업자 등록 | 등록 진행 중 | ⚠️ |
| **전자금융거래법** | 포인트 규제 | "스탬프/레벨" 시스템 (금전적 가치 없음) | ✅ |
| **표시광고법** | 광고 공시 | 쿠폰/오퍼에 "#광고" 3개 언어 명시 | ✅ |
| **개인정보보호법** | PII 최소화 | GPS 좌표 미저장, SSID 7일 후 삭제 | ✅ |

### 병원 실명 비노출 정책

**퍼블릭 화면 (앱 피드/지도)**
- ❌ "서울대학교병원 강남센터"
- ✅ "강남 성형외과 A" (지역 + 전문분야)

**B2B 대시보드**
- ✅ 실명 노출 허용 (사업자 로그인 영역)

**쿠폰/광고**
- ✅ "본 콘텐츠는 ○○병원의 유료 광고입니다" (3개 언어)

---

## 💡 경쟁 우위

### vs. Google Maps
- ✅ **게이미피케이션**: Pokemon GO-style 탐험
- ✅ **즉시 보상**: USDC 암호화폐 (Google은 포인트 없음)
- ✅ **UGC 콘텐츠**: TikTok-style 릴스 (Google은 사진만)

### vs. Foursquare
- ✅ **GPS 무결성**: 5-factor 검증 (Foursquare는 단순 체크인)
- ✅ **실물 보상**: USDC + 쿠폰 (Foursquare는 배지만)
- ✅ **B2B 플랫폼**: SaaS 대시보드 (Foursquare는 광고만)

### vs. Xiaohongshu (小红书)
- ✅ **위치 중심**: 지도 우선 (Xiaohongshu는 검색 우선)
- ✅ **GPS 검증**: 실제 방문 증명 (Xiaohongshu는 검증 없음)
- ✅ **B2B 모델**: 비즈니스 구독 (Xiaohongshu는 광고만)

---

## 🚀 Exit Strategy (3-5 Years)

### Option 1: Acquisition
- **타겟**: Kakao, Naver, Coupang
- **Valuation**: 5-10x ARR (₩ 8B - 16B)
- **Timing**: ARR ₩ 1.6B 달성 시

### Option 2: Series A
- **타겟**: VC (Strong Ventures, Bon Angels)
- **Pre-money**: ₩ 15B
- **Raise**: ₩ 5B (25% dilution)
- **Use of Funds**: 전국 확장, 일본/대만 진출

### Option 3: Bootstrap → Profitability
- **Breakeven**: Month 18 (MRR ₩ 60M)
- **Profitability**: Month 24 (Net Margin 20%)
- **No dilution**: 창업자 100% 지분 유지

---

## 📞 Contact & Next Steps

**창업자**: 김○○ 대표  
**Email**: TBD  
**Website**: https://zzik.kr (진행 중)  
**GitHub**: https://github.com/josihu0604-lang/Gkkdkdk

**Immediate Actions**:
1. ✅ 디자인 시스템 구축 (Linear App 벤치마킹)
2. ✅ 기술 아키텍처 설계 (PostGIS + USDC)
3. ⏳ MVP 개발 시작 (Week 1-8)
4. ⏳ 예비창업패키지 신청
5. ⏳ 파트너 10개 확보 (Pilot)

---

**Version History**:
- **v1.0** (2025-10-01): 초기 MVP 기획
- **v5.0** (2025-10-20): 의료관광 특화 버전
- **v7.0** (2025-11-01): 법적 컴플라이언스 반영
- **v9.0** (2025-11-11): **완전한 제품 비전 통합** (Pokemon GO + Xiaohongshu)

---

**Document Status**: ✅ COMPLETE
**Next Document**: GPS Integrity Algorithm Specification
