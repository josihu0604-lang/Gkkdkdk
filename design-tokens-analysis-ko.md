# ZZIK 디자인 시스템 - 완전 분석 (한글)

## 📋 개요

**시스템 이름:** ZZIK Design System  
**버전:** 1.0.0  
**표준:** W3C Design Tokens Format 2.0  
**벤치마킹 대상:** Linear App 2025 (완전 벤치마킹)  
**파일 크기:** 9,977 바이트  

---

## 🎨 1. 컬러 시스템 분석

### 1.1 그레이 스케일 (13단계)

**사용 기술:** OKLCH 컬러 스페이스 (인간의 지각에 최적화된 색 공간)

| 단계 | 값 | 밝기 | 채도 | 색상 | 설명 |
|------|-----|------|------|------|------|
| 0 | `oklch(100% 0 240)` | 100% | 0 | 240° | 순수한 흰색 |
| 50 | `oklch(98% 0.002 240)` | 98% | 0.002 | 240° | 거의 흰색 |
| 100 | `oklch(96% 0.004 240)` | 96% | 0.004 | 240° | 밝은 회색 |
| 200 | `oklch(92% 0.008 240)` | 92% | 0.008 | 240° | |
| 300 | `oklch(85% 0.012 240)` | 85% | 0.012 | 240° | |
| 400 | `oklch(70% 0.015 240)` | 70% | 0.015 | 240° | |
| 500 | `oklch(55% 0.018 240)` | 55% | 0.018 | 240° | **중간 회색** |
| 600 | `oklch(45% 0.015 240)` | 45% | 0.015 | 240° | |
| 700 | `oklch(32% 0.012 240)` | 32% | 0.012 | 240° | |
| 800 | `oklch(20% 0.008 240)` | 20% | 0.008 | 240° | |
| 900 | `oklch(12% 0.004 240)` | 12% | 0.004 | 240° | |
| 950 | `oklch(8% 0.002 240)` | 8% | 0.002 | 240° | 거의 검은색 |
| 1000 | `oklch(0% 0 240)` | 0% | 0 | 240° | **순수한 검은색** |

**핵심 인사이트:**
- 🔵 **파란색 색조(240°)** 사용으로 약간의 차가운 느낌
- 📈 **채도는 500에서 최고점**(0.018) - 미묘한 색상 존재감
- ⚖️ 중간점을 중심으로 대칭적인 채도 분포
- 🎯 **13단계**의 세밀한 구분으로 UI 상태 표현에 탁월

**왜 13단계일까?**
- 일반적인 10단계 시스템보다 더 세밀함
- UI의 다양한 상태(hover, active, disabled 등)를 정밀하게 표현
- Linear의 세련된 미학에 부합

### 1.2 메인 브랜드 컬러 (보라색)

**용도:** Linear의 시그니처 브랜드 색상

| 단계 | 값 | 밝기 | 채도 | 색상 | 사용 예시 |
|------|-----|------|------|------|----------|
| 50 | `oklch(97% 0.02 290)` | 97% | 0.02 | 290° | 배경색 |
| 100 | `oklch(94% 0.04 290)` | 94% | 0.04 | 290° | hover 상태 |
| 200 | `oklch(88% 0.08 290)` | 88% | 0.08 | 290° | |
| 300 | `oklch(80% 0.12 290)` | 80% | 0.12 | 290° | |
| 400 | `oklch(70% 0.16 290)` | 70% | 0.16 | 290° | |
| 500 | `oklch(60% 0.20 290)` | 60% | **0.20** | 290° | **메인 브랜드** |
| 600 | `oklch(50% 0.18 290)` | 50% | 0.18 | 290° | |
| 700 | `oklch(40% 0.15 290)` | 40% | 0.15 | 290° | |
| 800 | `oklch(30% 0.12 290)` | 30% | 0.12 | 290° | |
| 900 | `oklch(20% 0.08 290)` | 20% | 0.08 | 290° | 다크 테마 |

**핵심 인사이트:**
- 💜 **마젠타/보라색 색조(290°)** - 독특한 브랜드 아이덴티티
- ✨ 500에서 최대 채도(0.20) = 선명하지만 과하지 않음
- 📊 밝기는 10% 단위로 부드러운 그라데이션
- 🌙 어두운 톤에서는 채도를 낮춰 가독성 향상

### 1.3 액센트 컬러 (파란색)

**용도:** 활성 상태, 인터랙티브 요소

| 단계 | 값 | 밝기 | 채도 | 색상 | 사용 예시 |
|------|-----|------|------|------|----------|
| 50 | `oklch(96% 0.03 240)` | 96% | 0.03 | 240° | 연한 배경 |
| 500 | `oklch(55% 0.22 240)` | 55% | **0.22** | 240° | **메인 액센트** |
| 900 | `oklch(15% 0.08 240)` | 15% | 0.08 | 240° | 다크 모드 |

**핵심 인사이트:**
- 🔵 **순수한 파란색(240°)** - 보편적으로 이해되는 인터랙션 색상
- 🎯 Primary보다 높은 채도(0.22) - 주목을 끌기 위함
- 🤝 보라색 primary와 충돌 없이 조화로움

### 1.4 시맨틱 컬러 (의미 기반 색상)

| 용도 | 값 | 색상 | 밝기 | 채도 | 색상각 | 사용처 |
|------|-----|------|------|------|--------|--------|
| Success | `oklch(65% 0.20 145)` | 초록색 | 65% | 0.20 | 145° | 성공 메시지 |
| Warning | `oklch(70% 0.18 80)` | 노란색 | 70% | 0.18 | 80° | 경고 메시지 |
| Error | `oklch(60% 0.22 30)` | 빨간색 | 60% | 0.22 | 30° | 에러 메시지 |
| Info | `oklch(60% 0.20 230)` | 청록색 | 60% | 0.20 | 230° | 정보 메시지 |

**핵심 인사이트:**
- ⚖️ 일관된 밝기(60-70%) - 동일한 시각적 무게감
- 🎨 일관된 채도(0.18-0.22) - 균형잡힌 생동감
- 🧠 표준적인 색상 심리학 적용
- 🔬 OKLCH로 모든 상태에서 지각적 균일성 보장

---

## 📝 2. 타이포그래피 시스템

### 2.1 폰트 패밀리

**산세리프 (본문용):**
```
["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"]
```
- **주요 폰트:** Inter Variable 폰트 (Linear의 선택)
- **대체 폰트:** 시스템 폰트로 성능 최적화
- **전략:** 점진적 향상(Progressive Enhancement)

**모노스페이스 (코드용):**
```
["SF Mono", "Monaco", "Cascadia Code", "Courier New", "monospace"]
```
- **주요:** SF Mono (애플의 개발자용 폰트)
- **크로스 플랫폼:** macOS, Windows, Linux 모두 커버

### 2.2 폰트 크기 (9단계 스케일)

| 단계 | 값 | 픽셀 | 사용처 |
|------|-----|------|--------|
| xs | 0.75rem | 12px | 캡션, 메타데이터 |
| sm | 0.875rem | 14px | 보조 텍스트 |
| base | 1rem | **16px** | **본문 텍스트** |
| lg | 1.125rem | 18px | 큰 본문 |
| xl | 1.25rem | 20px | 작은 제목 |
| 2xl | 1.5rem | 24px | 부제목 |
| 3xl | 1.875rem | 30px | 페이지 제목 |
| 4xl | 2.25rem | 36px | 히어로 텍스트 |
| 5xl | 3rem | 48px | 대형 디스플레이 |

**스케일 비율 분석:**
- xs → sm: 1.167배 (16.7% 증가)
- sm → base: 1.143배 (14.3% 증가)
- base → lg: 1.125배 (12.5% 증가)
- 대략 **장2도 스케일(1.125)** 따름

**왜 이 비율일까?**
- 자연스러운 시각적 계층 구조
- 너무 급격하지 않은 크기 변화
- 읽기 편한 조화로운 비율

### 2.3 폰트 굵기

| 이름 | 값 | 사용처 |
|------|-----|--------|
| normal | 400 | 본문 텍스트 |
| medium | 500 | 강조 |
| semibold | 600 | 부제목 |
| bold | 700 | 제목 |

**인사이트:** 
- 4가지 굵기만 사용으로 일관성 유지
- Inter Variable은 전체 범위 지원하지만 선택적으로 제한

### 2.4 행간(Line Height)

| 이름 | 값 | 비율 | 사용처 |
|------|-----|------|--------|
| tight | 1.2 | 120% | 제목, 타이트한 레이아웃 |
| snug | 1.375 | 137.5% | UI 레이블 |
| normal | 1.5 | 150% | **본문 텍스트** |
| relaxed | 1.625 | 162.5% | 긴 글 콘텐츠 |
| loose | 1.75 | 175% | 최대 가독성 |

**적용 팁:**
- 제목: tight 사용 (공간 절약, 임팩트)
- 본문: normal 사용 (가독성 최적)
- 긴 글: relaxed/loose 사용 (눈의 피로 감소)

### 2.5 자간(Letter Spacing)

| 이름 | 값 | 사용처 |
|------|-----|--------|
| tighter | -0.05em | 큰 제목 (48px+) |
| tight | -0.025em | 제목 |
| normal | 0 | 본문 텍스트 |
| wide | 0.025em | 대문자, 작은 텍스트 |

**왜 음수 값을?**
- 큰 텍스트는 시각적으로 자간이 넓어 보임
- 음수 값으로 보정하면 균형잡힌 느낌

---

## 📏 3. 간격 시스템 (Spacing)

**기본 단위:** 4px (0.25rem)  
**철학:** Linear의 일관된 간격 리듬

| 토큰 | 값 | 픽셀 | 일반 용도 |
|------|-----|------|-----------|
| 0 | 0 | 0px | 간격 없음 |
| 1 | 0.25rem | **4px** | **기본 단위** |
| 2 | 0.5rem | 8px | 타이트한 간격 |
| 3 | 0.75rem | 12px | 컴팩트한 패딩 |
| 4 | 1rem | 16px | 표준 간격 |
| 5 | 1.25rem | 20px | |
| 6 | 1.5rem | 24px | 섹션 간격 |
| 8 | 2rem | 32px | 큰 간격 |
| 10 | 2.5rem | 40px | |
| 12 | 3rem | 48px | 주요 섹션 |
| 16 | 4rem | 64px | |
| 20 | 5rem | 80px | |
| 24 | 6rem | 96px | 페이지 레벨 간격 |
| 32 | 8rem | 128px | 최대 간격 |

**수학적 패턴:**
- 1-12: 점진적 증가 (4px 기준)
- 12-32: 큰 점프 (16-32px)
- 모든 값이 4px로 나누어떨어짐

**실전 활용 예시:**
```css
/* 버튼 */
padding: var(--spacing-3) var(--spacing-6); /* 12px 24px */

/* 카드 */
padding: var(--spacing-6); /* 24px */
gap: var(--spacing-4); /* 16px */

/* 섹션 간격 */
margin-bottom: var(--spacing-12); /* 48px */
```

---

## 🔲 4. 모서리 둥글기 (Border Radius)

| 토큰 | 값 | 픽셀 | 사용처 |
|------|-----|------|--------|
| none | 0 | 0px | 날카로운 모서리 |
| sm | 0.25rem | 4px | 타이트한 반경 |
| base | 0.375rem | **6px** | **Linear 기본값** |
| md | 0.5rem | 8px | 카드 |
| lg | 0.75rem | 12px | 패널 |
| xl | 1rem | 16px | 큰 카드 |
| 2xl | 1.5rem | 24px | 피처 카드 |
| full | 9999px | ∞ | **알약/원형** |

**핵심 인사이트:** 
- 6px 기본 반경은 Linear의 시그니처
- 부드럽지만 과하게 둥글지 않은 미학
- "딱 적당한" 느낌

**적용 예시:**
```css
/* 버튼 */
border-radius: var(--border-radius-base); /* 6px */

/* 입력 필드 */
border-radius: var(--border-radius-md); /* 8px */

/* 아바타 */
border-radius: var(--border-radius-full); /* 완전한 원 */
```

---

## 🌑 5. 그림자 시스템 (6단계 깊이)

### 다층 그림자 아키텍처

각 그림자는 **2-3개의 레이어**를 사용하여 현실적인 깊이 표현:

| 레벨 | 레이어 수 | 최대 Y이동 | 최대 블러 | 최대 불투명도 | 사용처 |
|------|-----------|------------|-----------|---------------|--------|
| **xs** | 1 | 1px | 2px | 4% | 미묘한 테두리 |
| **sm** | 2 | 1px | 3px | 8% | hover 상태 |
| **base** | 2 | 2px | 4px | 8% | 카드 |
| **md** | 3 | 4px | 6px | 8% | 드롭다운 |
| **lg** | 3 | 10px | 15px | 10% | 모달 |
| **xl** | 3 | 20px | 25px | 12% | 플로팅 패널 |
| **2xl** | 3 | 25px | 50px | 15% | 최대 높이 |

### 그림자 해부학 예시 (md 레벨):

```css
box-shadow:
  0 4px 6px 0 rgba(0, 0, 0, 0.08),  /* 메인 그림자 */
  0 2px 4px 0 rgba(0, 0, 0, 0.04),  /* 중간 레이어 */
  0 1px 2px 0 rgba(0, 0, 0, 0.02);  /* 접촉 그림자 */
```

**디자인 철학:**
- 🎨 여러 레이어로 현실적인 빛의 확산 표현
- 📈 높이가 올라갈수록 불투명도 증가 (4% → 15%)
- 📐 Y-offset은 기하급수적 증가로 깊이감 표현
- 🔆 X-offset 없음 (위에서 아래로 비추는 조명 모델)

**실전 활용:**
```css
/* 일반 카드 */
box-shadow: var(--shadow-base);

/* hover 시 */
.card:hover {
  box-shadow: var(--shadow-md);
}

/* 모달 */
.modal {
  box-shadow: var(--shadow-xl);
}
```

---

## ⏱️ 6. 애니메이션 시스템

### 6.1 지속 시간(Duration)

| 토큰 | 값 | 사용처 |
|------|-----|--------|
| instant | 0ms | 즉각적인 변화 |
| fast | 150ms | 마이크로 인터랙션 |
| base | 250ms | **표준 전환** |
| slow | 350ms | 부드러운 움직임 |
| slower | 500ms | 극적인 효과 |

**인사이트:** 
- 150ms 단위로 증가 - 지각적으로 일관된 타이밍
- 250ms가 기본값 - 대부분의 UI 전환에 적합

### 6.2 이징 함수 (Cubic Bezier)

| 토큰 | 곡선 | 값 | 느낌 |
|------|------|-----|------|
| linear | 선형 | [0, 0, 1, 1] | 로봇 같은 |
| in | Ease-in | [0.4, 0, 1, 1] | 가속 |
| out | Ease-out | [0, 0, 0.2, 1] | 감속 |
| inOut | Ease-in-out | [0.4, 0, 0.2, 1] | 양쪽 부드러움 |
| spring | **Linear의 바운스** | [0.34, 1.56, 0.64, 1] | **탄성 오버슈트** |

**Spring 이징 분석:**
```
[0.34, 1.56, 0.64, 1]
       ^^^^
    1.0을 초과 = 오버슈트 효과!
```

- 컨트롤 포인트 2 (1.56)이 1.0 초과 = **튀어오르는 효과**
- Linear의 시그니처 재미있고 반응성 있는 느낌
- 사용처: 버튼 클릭, 모달 열기, 드래그 릴리즈

**적용 예시:**
```css
/* 표준 전환 */
transition: all 250ms cubic-bezier(0, 0, 0.2, 1);

/* Linear의 스프링 효과 */
transition: transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1);
```

---

## 📚 7. Z-Index 레이어링

**전략:** 1000+ 범위에서 10단위 증가

| 레이어 | 값 | 용도 |
|--------|-----|------|
| base | 0 | 일반 흐름 |
| dropdown | 1000 | 드롭다운 메뉴 |
| sticky | 1020 | 고정 헤더 |
| fixed | 1030 | 고정 네비게이션 |
| modalBackdrop | 1040 | 모달 배경 |
| modal | 1050 | 모달 콘텐츠 |
| popover | 1060 | 컨텍스트 메뉴 |
| tooltip | 1070 | hover 툴팁 |
| toast | 1080 | **최상단 알림** |

**왜 1000+를 사용할까?**
- 🛡️ 서드파티 라이브러리와의 충돌 방지
- 🔢 10단위 간격으로 중간 레이어 삽입 가능
- 🏗️ 명확한 계층적 관계

**실전 팁:**
```css
/* 네비게이션 */
nav { z-index: var(--z-index-sticky); } /* 1020 */

/* 모달 */
.modal-backdrop { z-index: var(--z-index-modal-backdrop); } /* 1040 */
.modal { z-index: var(--z-index-modal); } /* 1050 */

/* 알림 */
.toast { z-index: var(--z-index-toast); } /* 1080 */
```

---

## 📱 8. 반응형 브레이크포인트

| 토큰 | 값 | 뷰포트 | 기기 유형 |
|------|-----|--------|-----------|
| sm | 640px | ≥640px | 큰 휴대폰 (가로) |
| md | 768px | ≥768px | 태블릿 |
| lg | 1024px | ≥1024px | 소형 노트북 |
| xl | 1280px | ≥1280px | 데스크탑 |
| 2xl | 1536px | ≥1536px | 대형 디스플레이 |

**모바일 우선 전략:**
- 기본 스타일: <640px (휴대폰)
- 각 브레이크포인트에서 복잡도 추가
- Tailwind CSS 기본값과 일치

**적용 예시:**
```css
/* 모바일 우선 */
.container {
  padding: var(--spacing-4); /* 16px */
}

/* 태블릿 이상 */
@media (min-width: 768px) {
  .container {
    padding: var(--spacing-8); /* 32px */
  }
}

/* 데스크탑 이상 */
@media (min-width: 1280px) {
  .container {
    padding: var(--spacing-12); /* 48px */
  }
}
```

---

## 🔬 기술 심화 분석

### OKLCH 컬러 스페이스의 장점

**왜 RGB/HSL이 아닌 OKLCH인가?**

#### 1. 지각적 균일성 (Perceptual Uniformity)
```
RGB의 문제:
rgb(128, 128, 0)   - 어두운 노란색으로 보임
rgb(128, 0, 0)     - 더 어두운 빨간색으로 보임
→ 같은 숫자 값이지만 밝기가 다르게 보임!

OKLCH의 해결:
oklch(50% 0.2 90)  - 정확히 50% 밝기의 노란색
oklch(50% 0.2 30)  - 정확히 50% 밝기의 빨간색
→ 같은 밝기 값 = 실제로 같은 밝기로 보임!
```

#### 2. 더 나은 컬러 조작
- 밝기 조정이 선형적이고 자연스러움
- 밝게/어둡게 할 때 색조 변화 없음
- 채도 조절이 예측 가능

#### 3. 더 넓은 색 영역
- P3, Rec2020 컬러까지 접근 가능
- 최신 디스플레이를 위한 미래 대비
- 오래된 브라우저에서도 우아한 폴백

#### 4. 수학적 정밀성
```
oklch(L C H)
      │ │ └─ Hue: 0-360° (색상 휠)
      │ └─── Chroma: 0-0.4+ (채도 강도)
      └───── Lightness: 0-100% (지각적 밝기)
```

**실전 예시:**
```css
/* RGB - 예측 불가능 */
color: rgb(100, 100, 200);
color: rgb(80, 80, 180);    /* 20% 어둡게? 실제로는 다르게 보임 */

/* OKLCH - 예측 가능 */
color: oklch(60% 0.2 240);
color: oklch(48% 0.2 240);  /* 정확히 20% 어둡게 보임 */
```

### W3C Design Tokens Format 준수

**사용된 표준 기능:**

#### 1. 스키마 검증
```json
"$schema": "https://tr.designtokens.org/format/2.0/schema.json"
```
- 자동 검증 및 IDE 자동완성
- 표준 준수 보장

#### 2. 타입 시스템
```json
"colors": {
  "$type": "color",  // 그룹 레벨 타입 선언
  "primary": {
    "500": { "$value": "oklch(60% 0.20 290)" }
  }
}
```

지원 타입:
- `color`: 색상
- `dimension`: 크기 (px, rem, em)
- `fontFamily`: 폰트 패밀리
- `fontWeight`: 폰트 굵기
- `duration`: 시간
- `cubicBezier`: 이징 곡선
- `shadow`: 그림자
- `number`: 숫자

#### 3. 토큰 구조
```json
"tokenName": {
  "$value": "실제 값",
  "$description": "사람이 읽을 수 있는 설명",
  "$type": "선택적 타입 오버라이드"
}
```

#### 4. 중첩 그룹
- 계층적 구조 (colors.primary.500)
- 부모 그룹에서 타입 상속
- 네임스페이스 토큰 참조

**혜택:**
- ✅ 크로스 플랫폼 호환성 (Figma, Style Dictionary, Tokens Studio)
- ✅ 자동화된 코드 생성
- ✅ 디자인-코드 핸드오프
- ✅ 버전 관리 친화적

---

## 🎯 실전 활용 사례

### 1. 버튼 상태 예시

```css
/* Primary 버튼 */
.button-primary {
  /* 색상 */
  background: var(--colors-primary-500);     /* 일반 */
  color: var(--colors-gray-0);               /* 흰색 텍스트 */
  
  /* 간격 */
  padding: var(--spacing-3) var(--spacing-6); /* 12px 24px */
  
  /* 모서리 */
  border-radius: var(--border-radius-base);   /* 6px */
  
  /* 그림자 */
  box-shadow: var(--shadows-sm);
  
  /* 애니메이션 */
  transition: 
    background var(--animation-duration-fast) var(--animation-easing-out),
    box-shadow var(--animation-duration-fast) var(--animation-easing-out);
}

/* Hover 상태 */
.button-primary:hover {
  background: var(--colors-primary-600);
  box-shadow: var(--shadows-md);
}

/* Active/눌림 상태 */
.button-primary:active {
  background: var(--colors-primary-700);
  box-shadow: var(--shadows-xs);
  transform: scale(0.98);
}

/* Disabled 상태 */
.button-primary:disabled {
  background: var(--colors-gray-200);
  color: var(--colors-gray-400);
  box-shadow: none;
  cursor: not-allowed;
}
```

### 2. 카드 컴포넌트

```css
.card {
  /* 배경 */
  background: var(--colors-gray-0);           /* 흰색 */
  
  /* 테두리 */
  border: 1px solid var(--colors-gray-200);
  border-radius: var(--border-radius-lg);     /* 12px */
  
  /* 간격 */
  padding: var(--spacing-6);                  /* 24px */
  
  /* 그림자 */
  box-shadow: var(--shadows-md);              /* 3레이어 */
  
  /* 애니메이션 */
  transition: 
    box-shadow var(--animation-duration-base) var(--animation-easing-spring),
    transform var(--animation-duration-base) var(--animation-easing-spring);
}

/* Hover 시 들어올리기 */
.card:hover {
  box-shadow: var(--shadows-lg);
  transform: translateY(-2px);
}

/* 카드 헤더 */
.card-header {
  padding-bottom: var(--spacing-4);
  border-bottom: 1px solid var(--colors-gray-100);
  margin-bottom: var(--spacing-4);
}

/* 카드 제목 */
.card-title {
  font-size: var(--typography-font-sizes-xl);        /* 20px */
  font-weight: var(--typography-font-weights-semibold); /* 600 */
  line-height: var(--typography-line-heights-tight); /* 1.2 */
  color: var(--colors-gray-900);
}

/* 카드 본문 */
.card-body {
  font-size: var(--typography-font-sizes-base);      /* 16px */
  line-height: var(--typography-line-heights-normal); /* 1.5 */
  color: var(--colors-gray-700);
}
```

### 3. 타이포그래피 계층

```css
/* H1 - 페이지 제목 */
h1 {
  font-family: var(--typography-font-families-sans);
  font-size: var(--typography-font-sizes-4xl);      /* 36px */
  font-weight: var(--typography-font-weights-bold); /* 700 */
  line-height: var(--typography-line-heights-tight); /* 1.2 */
  letter-spacing: var(--typography-letter-spacing-tighter); /* -0.05em */
  color: var(--colors-gray-1000);
  margin-bottom: var(--spacing-6);
}

/* H2 - 섹션 제목 */
h2 {
  font-size: var(--typography-font-sizes-2xl);      /* 24px */
  font-weight: var(--typography-font-weights-semibold); /* 600 */
  line-height: var(--typography-line-heights-snug); /* 1.375 */
  letter-spacing: var(--typography-letter-spacing-tight); /* -0.025em */
  color: var(--colors-gray-900);
  margin-bottom: var(--spacing-4);
}

/* 본문 텍스트 */
p {
  font-size: var(--typography-font-sizes-base);     /* 16px */
  font-weight: var(--typography-font-weights-normal); /* 400 */
  line-height: var(--typography-line-heights-normal); /* 1.5 */
  color: var(--colors-gray-700);
  margin-bottom: var(--spacing-4);
}

/* 캡션/작은 텍스트 */
.caption {
  font-size: var(--typography-font-sizes-sm);       /* 14px */
  line-height: var(--typography-line-heights-snug); /* 1.375 */
  color: var(--colors-gray-500);
}
```

### 4. 인풋 필드

```css
.input {
  /* 크기 */
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);      /* 12px 16px */
  
  /* 폰트 */
  font-family: var(--typography-font-families-sans);
  font-size: var(--typography-font-sizes-base);    /* 16px */
  
  /* 스타일 */
  background: var(--colors-gray-0);
  border: 1px solid var(--colors-gray-300);
  border-radius: var(--border-radius-md);          /* 8px */
  
  /* 애니메이션 */
  transition: 
    border-color var(--animation-duration-fast) var(--animation-easing-out),
    box-shadow var(--animation-duration-fast) var(--animation-easing-out);
}

/* Focus 상태 */
.input:focus {
  outline: none;
  border-color: var(--colors-accent-500);
  box-shadow: 
    0 0 0 3px var(--colors-accent-500) / 0.1,  /* 포커스 링 */
    var(--shadows-sm);
}

/* 에러 상태 */
.input.error {
  border-color: var(--colors-semantic-error);
}

.input.error:focus {
  box-shadow: 
    0 0 0 3px var(--colors-semantic-error) / 0.1,
    var(--shadows-sm);
}
```

### 5. 모달

```css
/* 배경 오버레이 */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: var(--colors-gray-1000) / 0.5;  /* 반투명 검정 */
  z-index: var(--z-index-modal-backdrop);     /* 1040 */
  
  /* 애니메이션 */
  animation: fadeIn var(--animation-duration-base) var(--animation-easing-out);
}

/* 모달 콘텐츠 */
.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  
  /* 크기 */
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  
  /* 스타일 */
  background: var(--colors-gray-0);
  border-radius: var(--border-radius-xl);     /* 16px */
  padding: var(--spacing-8);                  /* 32px */
  
  /* 깊이 */
  box-shadow: var(--shadows-2xl);             /* 최대 그림자 */
  z-index: var(--z-index-modal);              /* 1050 */
  
  /* 애니메이션 */
  animation: 
    fadeIn var(--animation-duration-base) var(--animation-easing-out),
    slideUp var(--animation-duration-base) var(--animation-easing-spring);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translate(-50%, -45%); }
  to { transform: translate(-50%, -50%); }
}
```

---

## 📊 통계 요약

| 카테고리 | 개수 | 세밀도 |
|----------|------|--------|
| **그레이 단계** | 13 | 매우 세밀함 |
| **Primary 단계** | 10 | 표준 |
| **Accent 단계** | 10 | 표준 |
| **시맨틱 컬러** | 4 | 필수 |
| **폰트 크기** | 9 | 포괄적 |
| **폰트 굵기** | 4 | 최소 |
| **행간** | 5 | 충분함 |
| **간격 단위** | 14 | 광범위 |
| **모서리 반경** | 8 | 완전함 |
| **그림자 레벨** | 7 | 매우 상세 |
| **애니메이션 시간** | 5 | 적절함 |
| **이징 함수** | 5 | 다양함 |
| **Z-Index 레이어** | 9 | 철저함 |
| **브레이크포인트** | 5 | 표준 |

**총 토큰 수:** 약 150+ 개의 개별 디자인 결정

---

## 🏆 잘 설계된 부분

### ✅ 이 시스템이 잘한 것들

1. **지각적 컬러 과학**
   - 인간의 시각에 최적화된 OKLCH
   - 일관된 채도/밝기 관계
   - 미래 지향적 색 영역

2. **수학적 일관성**
   - 전체적으로 4px 기본 단위
   - 예측 가능한 스케일 비율
   - 깔끔한 숫자 진행

3. **의미론적 네이밍**
   - 목적 중심 토큰 (primary, accent, semantic)
   - 스케일 기반 구조 (50-900, xs-5xl)
   - 자기 문서화되는 구조

4. **포괄적 범위**
   - 모든 주요 디자인 영역 커버
   - 다양한 높이 레벨
   - 완전한 애니메이션 시스템

5. **표준 준수**
   - W3C Design Tokens Format 2.0
   - 플랫폼 독립적 JSON 구조
   - 툴링 지원 준비 완료

6. **프로덕션 수준 디테일**
   - 현실감 있는 다층 그림자
   - 개성 있는 스프링 이징
   - 광범위한 그레이 스케일 (13단계)

---

## 🎓 핵심 학습 포인트

### 1. 왜 13단계 그레이 스케일?
- 일반적인 10단계 시스템보다 더 세밀함
- UI 상태를 정밀하게 구분 가능
- Linear의 세련된 미학과 일치
- 미묘한 hover/focus/disabled 상태 표현

### 2. 스프링 이징의 의미
```
[0.34, 1.56, 0.64, 1]
       ^^^^
    튀어오르기 효과 생성
```
- 인터랙션에 개성 추가
- UI가 반응성 있다고 느끼게 함
- Linear의 시그니처 애니메이션 느낌

### 3. 6px 기본 모서리 반경
- 너무 둥글지 않음 (8px+)
- 너무 날카롭지 않음 (4px-)
- Linear의 "딱 적당한" 미학

### 4. 다층 그림자 시스템
- 1개 그림자: 평면적으로 보임
- 2-3개 그림자: 현실적인 깊이감
- 빛의 확산 효과 모사
- 접촉 그림자 + 메인 그림자 + 앰비언트 그림자

### 5. OKLCH의 실전 가치
```css
/* 작업 전: RGB로 밝기 조정 (예측 불가능) */
color: rgb(100, 100, 200);  /* 원본 */
color: rgb(80, 80, 160);    /* 20% 어둡게? 실제로는 부정확 */

/* 작업 후: OKLCH로 밝기 조정 (예측 가능) */
color: oklch(60% 0.2 240);  /* 원본 */
color: oklch(48% 0.2 240);  /* 정확히 20% 어둡게 */
```

---

## 🔧 구현 가이드

### 1단계: CSS 커스텀 속성

```css
/* tokens.json에서 자동 생성 */
:root {
  /* 색상 */
  --color-gray-0: oklch(100% 0 240);
  --color-gray-500: oklch(55% 0.018 240);
  --color-gray-1000: oklch(0% 0 240);
  
  --color-primary-500: oklch(60% 0.20 290);
  --color-accent-500: oklch(55% 0.22 240);
  
  --color-semantic-success: oklch(65% 0.20 145);
  --color-semantic-error: oklch(60% 0.22 30);
  
  /* 타이포그래피 */
  --font-sans: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: "SF Mono", Monaco, "Cascadia Code", monospace;
  
  --font-size-xs: 0.75rem;
  --font-size-base: 1rem;
  --font-size-4xl: 2.25rem;
  
  --font-weight-normal: 400;
  --font-weight-semibold: 600;
  
  --line-height-tight: 1.2;
  --line-height-normal: 1.5;
  
  /* 간격 */
  --spacing-1: 0.25rem;
  --spacing-4: 1rem;
  --spacing-8: 2rem;
  --spacing-12: 3rem;
  
  /* 모서리 */
  --border-radius-base: 0.375rem;
  --border-radius-lg: 0.75rem;
  --border-radius-full: 9999px;
  
  /* 그림자 */
  --shadow-sm: 
    0 1px 3px 0 rgba(0, 0, 0, 0.08),
    0 1px 2px 0 rgba(0, 0, 0, 0.04);
  
  --shadow-md: 
    0 4px 6px 0 rgba(0, 0, 0, 0.08),
    0 2px 4px 0 rgba(0, 0, 0, 0.04),
    0 1px 2px 0 rgba(0, 0, 0, 0.02);
  
  /* 애니메이션 */
  --duration-fast: 150ms;
  --duration-base: 250ms;
  
  --easing-out: cubic-bezier(0, 0, 0.2, 1);
  --easing-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  
  /* Z-Index */
  --z-dropdown: 1000;
  --z-modal: 1050;
  --z-tooltip: 1070;
  --z-toast: 1080;
}
```

### 2단계: Sass 변수 (대안)

```scss
// _colors.scss
$gray-0: oklch(100% 0 240);
$gray-500: oklch(55% 0.018 240);
$gray-1000: oklch(0% 0 240);

$primary-500: oklch(60% 0.20 290);
$accent-500: oklch(55% 0.22 240);

// _spacing.scss
$spacing-1: 0.25rem;  // 4px
$spacing-4: 1rem;     // 16px
$spacing-8: 2rem;     // 32px

// _typography.scss
$font-sans: (Inter, -apple-system, sans-serif);
$font-size-base: 1rem;
$font-weight-semibold: 600;

// 사용
.button {
  background: $primary-500;
  padding: $spacing-3 $spacing-6;
  font-family: $font-sans;
}
```

### 3단계: JavaScript/TypeScript

```typescript
// tokens.ts
export const colors = {
  gray: {
    0: 'oklch(100% 0 240)',
    500: 'oklch(55% 0.018 240)',
    1000: 'oklch(0% 0 240)',
  },
  primary: {
    500: 'oklch(60% 0.20 290)',
  },
  accent: {
    500: 'oklch(55% 0.22 240)',
  },
} as const;

export const spacing = {
  1: '0.25rem',
  4: '1rem',
  8: '2rem',
} as const;

export const typography = {
  fontFamilies: {
    sans: ['Inter', '-apple-system', 'sans-serif'],
  },
  fontSizes: {
    base: '1rem',
    xl: '1.25rem',
  },
} as const;

// 사용 (React)
import { colors, spacing } from './tokens';

const Button = styled.button`
  background: ${colors.primary[500]};
  padding: ${spacing[3]} ${spacing[6]};
`;
```

### 4단계: Tailwind CSS 통합

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    colors: {
      gray: {
        0: 'oklch(100% 0 240)',
        50: 'oklch(98% 0.002 240)',
        100: 'oklch(96% 0.004 240)',
        500: 'oklch(55% 0.018 240)',
        1000: 'oklch(0% 0 240)',
      },
      primary: {
        500: 'oklch(60% 0.20 290)',
      },
    },
    fontSize: {
      xs: '0.75rem',
      base: '1rem',
      '4xl': '2.25rem',
    },
    spacing: {
      1: '0.25rem',
      4: '1rem',
      8: '2rem',
    },
    borderRadius: {
      base: '0.375rem',  // 6px
      lg: '0.75rem',     // 12px
      full: '9999px',
    },
    boxShadow: {
      sm: '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px 0 rgb(0 0 0 / 0.04)',
      md: '0 4px 6px 0 rgb(0 0 0 / 0.08), 0 2px 4px 0 rgb(0 0 0 / 0.04)',
    },
  },
};

// 사용
<button className="bg-primary-500 text-gray-0 px-6 py-3 rounded-base shadow-sm">
  버튼
</button>
```

---

## 🚀 플랫폼별 활용

### Figma (Tokens Studio 플러그인)

1. `tokens.json` 직접 임포트
2. 변수와 자동 동기화
3. 텍스트/컬러/이펙트 스타일에 적용

**단계:**
```
1. Figma 열기
2. Plugins → Tokens Studio 설치
3. Import → tokens.json 선택
4. Sync → Figma Variables
```

### Style Dictionary (빌드 툴)

```javascript
// config.json
{
  "source": ["tokens.json"],
  "platforms": {
    "css": {
      "transformGroup": "css",
      "buildPath": "dist/css/",
      "files": [{
        "destination": "variables.css",
        "format": "css/variables"
      }]
    },
    "js": {
      "transformGroup": "js",
      "buildPath": "dist/js/",
      "files": [{
        "destination": "tokens.js",
        "format": "javascript/es6"
      }]
    }
  }
}
```

### React Native

```javascript
import { StyleSheet } from 'react-native';
import tokens from './tokens.json';

const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.colors.gray[0].$value,
    borderRadius: parseFloat(tokens.borderRadius.lg.$value),
    padding: parseFloat(tokens.spacing[6].$value),
    // 그림자는 iOS와 Android에서 다르게 처리
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3, // Android
  },
});
```

---

## 🎨 고급 테크닉

### 1. 다이나믹 테마 (다크 모드)

```css
:root {
  /* 라이트 모드 */
  --bg-primary: var(--color-gray-0);
  --bg-secondary: var(--color-gray-50);
  --text-primary: var(--color-gray-1000);
  --text-secondary: var(--color-gray-700);
  --border-color: var(--color-gray-200);
}

@media (prefers-color-scheme: dark) {
  :root {
    /* 다크 모드 */
    --bg-primary: var(--color-gray-1000);
    --bg-secondary: var(--color-gray-950);
    --text-primary: var(--color-gray-0);
    --text-secondary: var(--color-gray-300);
    --border-color: var(--color-gray-800);
  }
}

/* 사용 */
.card {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}
```

### 2. 반응형 타이포그래피

```css
h1 {
  /* 모바일: 24px */
  font-size: var(--font-size-2xl);
  
  /* 태블릿: 30px */
  @media (min-width: 768px) {
    font-size: var(--font-size-3xl);
  }
  
  /* 데스크탑: 36px */
  @media (min-width: 1024px) {
    font-size: var(--font-size-4xl);
  }
}
```

### 3. 상태 기반 그림자

```css
.card {
  box-shadow: var(--shadow-sm);
  transition: 
    box-shadow var(--duration-base) var(--easing-out),
    transform var(--duration-base) var(--easing-spring);
  
  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }
  
  &:active {
    box-shadow: var(--shadow-xs);
    transform: translateY(0);
  }
}
```

### 4. 애니메이션 조합

```css
@keyframes slideInBounce {
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal {
  animation: 
    slideInBounce 
    var(--duration-base) 
    var(--easing-spring);
}
```

---

## 🔍 다른 시스템과의 비교

| 특징 | ZZIK (Linear) | Material 3 | Tailwind | Chakra UI |
|------|---------------|------------|----------|-----------|
| **컬러 스페이스** | OKLCH | HCT | RGB/HSL | RGB/HSL |
| **그레이 단계** | 13 | 13 | 10 | 10 |
| **그림자 레이어** | 2-3 | 5 | 1 | 1-3 |
| **간격 기본** | 4px | 4dp | 4px | 4px |
| **모서리 기본** | 6px | 12dp | 8px | 6px |
| **애니메이션** | 스프링 | Emphasized | Ease-out | Ease-in-out |
| **표준 준수** | W3C 2.0 | Material | 유틸리티 | 테마 객체 |

**ZZIK의 독특한 강점:**
- ✨ 고급 컬러 과학 (OKLCH)
- 🎨 다층 그림자 현실감
- 🎪 스프링 이징 개성
- 📐 표준 기반 포맷

---

## 📚 참고 자료

1. **OKLCH 컬러 스페이스**
   - [oklch.com](https://oklch.com) - 인터랙티브 도구
   - [CSS Color Module Level 4](https://drafts.csswg.org/css-color-4/#ok-lab)

2. **W3C Design Tokens**
   - [Design Tokens Format 스펙](https://tr.designtokens.org/format/)
   - [커뮤니티 그룹](https://www.w3.org/community/design-tokens/)

3. **Linear 앱 디자인**
   - [Linear 디자인 원칙](https://linear.app/readme)
   - 세련미와 애니메이션 케이스 스터디

4. **타이포그래피**
   - [Inter 폰트](https://rsms.me/inter/)
   - [Modular Scale 계산기](https://type-scale.com/)

5. **도구**
   - [Style Dictionary](https://amzn.github.io/style-dictionary/)
   - [Tokens Studio (Figma)](https://tokens.studio/)
   - [Cobalt UI](https://cobalt-ui.pages.dev/) - 토큰 변환기

---

## ✨ 결론

이 디자인 시스템은 **성숙하고 프로덕션 준비가 완료된** Linear 품질 인터페이스 구축을 위한 기반입니다.

### 핵심 요점:

1. **과학적 기반** ✅
   - OKLCH 컬러 스페이스
   - 지각적 균일성

2. **포괄적 범위** ✅
   - 모든 디자인 영역에 걸친 150+ 토큰
   - 세밀한 제어 가능

3. **표준 준수** ✅
   - W3C Design Tokens Format 2.0
   - 크로스 플랫폼 호환

4. **디테일에 대한 주의** ✅
   - 다층 그림자
   - 스프링 이징
   - 13단계 그레이

5. **플랫폼 독립적** ✅
   - 모든 프레임워크와 호환
   - CSS 방법론 무관

### 시스템이 보여주는 깊은 이해:

- 🎨 색채 이론과 지각
- 📝 타이포그래피 계층
- 📏 공간 리듬과 조화
- 🎬 모션 디자인 원칙
- 🏗️ 레이어링과 높이
- 📱 반응형 디자인 패턴

### 추천 추가 사항:

- 🌙 다크 모드 토큰 세트
- 🧩 컴포넌트별 토큰 (button-padding-sm 등)
- ♿ 접근성 주석 (WCAG 대비 비율)
- 🎞️ 애니메이션 키프레임 프리셋
- 📐 그리드 시스템 토큰

---

*분석 완료: 2025-11-11*  
*분석가: AI 디자인 시스템 전문가*  
*파일: tokens.json.txt (9,977 바이트)*  
*Linear App 2025 완전 벤치마킹 시스템*
