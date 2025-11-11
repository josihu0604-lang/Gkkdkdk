# 🎨 ZZIK Design System

> Linear App 2025 완전 벤치마킹 - 다크 테마 기본

## 📦 파일 구조

```
webapp/
├── tokens.json.txt              # 원본 디자인 토큰 (W3C Format 2.0)
├── tokens.css                   # CSS 커스텀 속성 (필수! ⭐)
├── demo.html                    # 인터랙티브 데모 페이지
├── design-tokens-analysis-ko.md # 완전 분석 (한글)
├── design-tokens-analysis.md    # 완전 분석 (영문)
└── USAGE-GUIDE-KO.md           # 사용 가이드 (한글)
```

---

## 🚀 빠른 시작

### 1. CSS 파일 포함 (필수!)

```html
<!DOCTYPE html>
<html lang="ko" class="theme-dark">
<head>
  <link rel="stylesheet" href="tokens.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
  <!-- 다크 테마 기본 적용됨 -->
</body>
</html>
```

### 2. 바로 사용하기

```html
<!-- 버튼 -->
<button style="
  background: var(--brand-primary);
  color: var(--color-gray-0);
  padding: var(--spacing-3) var(--spacing-6);
  border-radius: var(--radius-base);
  border: none;
  cursor: pointer;
">
  클릭하세요
</button>

<!-- 카드 -->
<div style="
  background: var(--bg-elevated);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  box-shadow: var(--shadow-md);
">
  <h3 style="color: var(--text-primary);">카드 제목</h3>
  <p style="color: var(--text-secondary);">카드 내용</p>
</div>
```

---

## 🎯 핵심 특징

### ✨ 다크 테마 기본
- 기본적으로 다크 테마 적용
- 자동 라이트 모드 지원 (`prefers-color-scheme`)
- 클래스 기반 테마 전환 가능

### 🎨 OKLCH 컬러 스페이스
- 인간의 시각에 최적화된 색 공간
- 지각적으로 균일한 밝기
- 최신 디스플레이 지원

### 📏 4px 기본 단위
- 모든 간격이 4px의 배수
- 일관된 시각적 리듬
- Linear의 간격 시스템

### 🌑 다층 그림자
- 2-3개 레이어로 현실적 깊이
- 7단계 높이 시스템
- 부드러운 전환

### 🎪 스프링 애니메이션
- 탄성 있는 튀는 효과
- Linear의 시그니처 느낌
- `cubic-bezier(0.34, 1.56, 0.64, 1)`

---

## 📊 디자인 토큰 요약

| 카테고리 | 개수 | 하이라이트 |
|----------|------|-----------|
| **그레이 스케일** | 13단계 | 세밀한 상태 표현 |
| **브랜드 컬러** | 10단계 | 보라색 (290°) |
| **액센트 컬러** | 10단계 | 파란색 (240°) |
| **폰트 크기** | 9단계 | 12px ~ 48px |
| **간격** | 14단계 | 4px ~ 128px |
| **그림자** | 7레벨 | 다층 시스템 |
| **애니메이션** | 5+5 | 시간 + 이징 |

---

## 🎨 시맨틱 토큰 (다크 테마)

### 배경 (Background)
```css
--bg-primary        /* 메인 배경 (검은색) */
--bg-secondary      /* 보조 배경 */
--bg-elevated       /* 카드, 모달 (회색-900) */
--bg-hover          /* Hover 상태 */
```

### 텍스트 (Text)
```css
--text-primary      /* 주요 텍스트 (밝은색) */
--text-secondary    /* 보조 텍스트 */
--text-tertiary     /* 3차 텍스트 */
```

### 브랜드 (Brand)
```css
--brand-primary     /* 보라색 메인 */
--brand-hover       /* Hover 상태 */
--brand-active      /* Active 상태 */
```

### 액센트 (Accent)
```css
--accent-primary    /* 파란색 메인 */
--accent-hover      /* Hover 상태 */
```

---

## 💡 사용 예시

### 버튼 컴포넌트

```css
.btn-primary {
  background: var(--brand-primary);
  color: var(--color-gray-0);
  padding: var(--spacing-3) var(--spacing-6);
  border-radius: var(--radius-base);
  box-shadow: var(--shadow-sm);
  transition: all var(--duration-fast) var(--easing-out);
}

.btn-primary:hover {
  background: var(--brand-hover);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}
```

### 카드 컴포넌트

```css
.card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  box-shadow: var(--shadow-md);
  transition: 
    box-shadow var(--duration-base) var(--easing-spring),
    transform var(--duration-base) var(--easing-spring);
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

---

## 🎭 테마 전환

### JavaScript로 테마 전환

```javascript
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.classList.contains('theme-dark');
  
  if (isDark) {
    html.classList.remove('theme-dark');
    html.classList.add('theme-light');
  } else {
    html.classList.remove('theme-light');
    html.classList.add('theme-dark');
  }
}
```

### HTML 클래스로 테마 설정

```html
<!-- 다크 테마 (기본) -->
<html class="theme-dark">

<!-- 라이트 테마 -->
<html class="theme-light">
```

---

## 📱 반응형 브레이크포인트

```css
/* 모바일: 기본 (< 640px) */
.element { padding: var(--spacing-4); }

/* 태블릿: 768px 이상 */
@media (min-width: 768px) {
  .element { padding: var(--spacing-6); }
}

/* 데스크탑: 1024px 이상 */
@media (min-width: 1024px) {
  .element { padding: var(--spacing-8); }
}
```

---

## 🔍 더 알아보기

### 📖 문서
- **[USAGE-GUIDE-KO.md](USAGE-GUIDE-KO.md)** - 상세 사용 가이드
- **[design-tokens-analysis-ko.md](design-tokens-analysis-ko.md)** - 완전 분석 (35KB!)

### 🎨 데모
- **[demo.html](demo.html)** - 인터랙티브 데모 페이지 열어보기

### 💾 원본
- **[tokens.json.txt](tokens.json.txt)** - W3C Design Tokens Format 2.0

---

## 🎯 왜 이 시스템을 사용해야 하나?

### ✅ Linear 품질
- Linear App 2025 완전 벤치마킹
- 세련되고 프로페셔널한 느낌
- 프로덕션 검증된 디자인 패턴

### ✅ 과학적 접근
- OKLCH 컬러 스페이스 (최신 표준)
- 지각적 균일성 보장
- 수학적으로 일관된 스케일

### ✅ 개발자 친화적
- CSS 변수로 즉시 사용
- 타입세이프한 토큰 구조
- 완벽한 문서화

### ✅ 다크 테마 우선
- 현대적인 기본 테마
- 눈의 피로 감소
- 에너지 절약 (OLED)

### ✅ 확장 가능
- 새 토큰 쉽게 추가
- 커스터마이징 용이
- 모든 프레임워크 호환

---

## 🚦 시작하기 단계별

### Step 1: tokens.css 포함
```html
<link rel="stylesheet" href="tokens.css">
```

### Step 2: 폰트 로드 (선택)
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Step 3: 테마 설정
```html
<html class="theme-dark">
```

### Step 4: 토큰 사용
```css
background: var(--bg-elevated);
color: var(--text-primary);
padding: var(--spacing-6);
```

### Step 5: demo.html 참고
브라우저에서 `demo.html`을 열어 실제 예시 확인!

---

## 🎨 색상 팔레트 미리보기

### Primary (Brand Purple - 290°)
```
50  ████ 97% 밝기
500 ████ 60% 밝기 ← 메인
900 ████ 20% 밝기
```

### Accent (Blue - 240°)
```
50  ████ 96% 밝기
500 ████ 55% 밝기 ← 메인
900 ████ 15% 밝기
```

### Gray (13 단계)
```
0    ████ 100% (흰색)
500  ████  55% (중간)
1000 ████   0% (검은색)
```

---

## 💡 Pro Tips

### 1. 시맨틱 토큰 우선
```css
/* ❌ 나쁜 예 */
color: var(--color-gray-300);

/* ✅ 좋은 예 */
color: var(--text-secondary);
```

### 2. 스프링 이징 활용
```css
/* Linear의 시그니처 튀는 효과 */
transition: transform var(--duration-base) var(--easing-spring);
```

### 3. GPU 가속 속성
```css
/* transform은 GPU 가속 */
transform: translateY(-2px);
```

### 4. 다층 그림자
```css
/* 2-3개 레이어로 깊이감 */
box-shadow: var(--shadow-md);
```

---

## 🔧 통합 가이드

### Tailwind CSS
```javascript
// tailwind.config.js에 토큰 추가
module.exports = {
  theme: {
    extend: {
      colors: {
        'brand': 'var(--brand-primary)',
        'accent': 'var(--accent-primary)',
      }
    }
  }
}
```

### React
```jsx
// CSS 모듈로 사용
import './tokens.css';

function Button() {
  return (
    <button style={{
      background: 'var(--brand-primary)',
      padding: 'var(--spacing-3) var(--spacing-6)',
      borderRadius: 'var(--radius-base)'
    }}>
      클릭
    </button>
  );
}
```

### Vue
```vue
<template>
  <button class="btn-primary">클릭</button>
</template>

<style>
@import './tokens.css';

.btn-primary {
  background: var(--brand-primary);
  padding: var(--spacing-3) var(--spacing-6);
}
</style>
```

---

## 📊 통계

| 항목 | 값 |
|------|-----|
| 총 토큰 수 | 150+ |
| 파일 크기 | 12.5KB (tokens.css) |
| 브라우저 지원 | Chrome 111+, Safari 15.4+, Firefox 113+ |
| 표준 준수 | W3C DTCG 2.0 |
| 테마 | 다크 (기본) + 라이트 |

---

## 🎓 학습 리소스

1. **OKLCH 컬러**: [oklch.com](https://oklch.com)
2. **W3C Tokens**: [tr.designtokens.org](https://tr.designtokens.org)
3. **Inter 폰트**: [rsms.me/inter](https://rsms.me/inter)
4. **Linear Design**: [linear.app](https://linear.app)

---

## ✨ 결론

**ZZIK Design System**은 Linear App의 세련된 디자인을 완전히 벤치마킹한 프로덕션 수준의 디자인 시스템입니다.

- 🌑 **다크 테마 기본**
- 🎨 **OKLCH 컬러 과학**
- 📏 **4px 기본 단위**
- 🌑 **다층 그림자**
- 🎪 **스프링 애니메이션**

**지금 바로 `tokens.css`를 포함하고 `demo.html`을 확인해보세요!** 🚀

---

*ZZIK Design System v1.0.0 - Linear App 2025 완전 벤치마킹*  
*다크 테마 기본, 세련된 UI, 개발자 친화적* ✨
