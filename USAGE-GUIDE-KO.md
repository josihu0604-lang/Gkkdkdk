# ZZIK Design System - 사용 가이드 (한글)

## 📦 설치 및 사용

### 1. CSS 파일 포함하기

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <link rel="stylesheet" href="tokens.css">
  <!-- Inter 폰트 (선택적) -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
  <!-- 여기에 컨텐츠 -->
</body>
</html>
```

### 2. 기본 설정 (다크 테마)

기본적으로 **다크 테마**가 적용됩니다. 별도 설정 없이 바로 사용 가능합니다.

```html
<body>
  <!-- 자동으로 다크 테마 적용됨 -->
  <div class="card">
    <h3>다크 테마 카드</h3>
    <p>기본적으로 다크 테마입니다.</p>
  </div>
</body>
```

---

## 🎨 테마 전환

### 방법 1: 자동 (사용자 시스템 설정 따르기)

```css
/* tokens.css에 이미 포함되어 있음 */
@media (prefers-color-scheme: light) {
  :root {
    /* 자동으로 라이트 테마로 전환 */
  }
}
```

### 방법 2: 수동 (클래스 기반)

```html
<!-- 다크 테마 (기본) -->
<html class="theme-dark">

<!-- 라이트 테마 -->
<html class="theme-light">
```

### 방법 3: JavaScript 토글

```javascript
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.classList.contains('theme-dark');
  
  if (isDark) {
    html.classList.remove('theme-dark');
    html.classList.add('theme-light');
    localStorage.setItem('theme', 'light');
  } else {
    html.classList.remove('theme-light');
    html.classList.add('theme-dark');
    localStorage.setItem('theme', 'dark');
  }
}

// 버튼에 연결
<button onclick="toggleTheme()">테마 전환</button>
```

---

## 🎯 컴포넌트 예시

### 버튼 (Primary)

```html
<button class="btn-primary">
  클릭하세요
</button>
```

```css
.btn-primary {
  /* 색상 */
  background: var(--brand-primary);
  color: var(--color-gray-0);
  
  /* 간격 */
  padding: var(--spacing-3) var(--spacing-6);
  
  /* 모서리 */
  border-radius: var(--radius-base);
  
  /* 그림자 */
  box-shadow: var(--shadow-sm);
  
  /* 애니메이션 */
  transition: 
    background var(--duration-fast) var(--easing-out),
    box-shadow var(--duration-fast) var(--easing-out),
    transform var(--duration-fast) var(--easing-spring);
  
  /* 기타 */
  border: none;
  cursor: pointer;
  font-family: var(--font-sans);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
}

.btn-primary:hover {
  background: var(--brand-hover);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.btn-primary:active {
  background: var(--brand-active);
  box-shadow: var(--shadow-xs);
  transform: translateY(0);
}
```

### 카드 컴포넌트

```html
<div class="card">
  <h3 class="card-title">카드 제목</h3>
  <p class="card-content">카드 내용입니다.</p>
</div>
```

```css
.card {
  /* 배경 */
  background: var(--bg-elevated);
  
  /* 테두리 */
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  
  /* 간격 */
  padding: var(--spacing-6);
  
  /* 그림자 */
  box-shadow: var(--shadow-md);
  
  /* 애니메이션 */
  transition: 
    box-shadow var(--duration-base) var(--easing-spring),
    transform var(--duration-base) var(--easing-spring);
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.card-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
  margin-bottom: var(--spacing-3);
  color: var(--text-primary);
}

.card-content {
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
  color: var(--text-secondary);
}
```

### 입력 필드

```html
<input type="text" class="input" placeholder="텍스트를 입력하세요">
```

```css
.input {
  /* 크기 */
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  
  /* 폰트 */
  font-family: var(--font-sans);
  font-size: var(--font-size-base);
  color: var(--text-primary);
  
  /* 스타일 */
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  
  /* 애니메이션 */
  transition: 
    border-color var(--duration-fast) var(--easing-out),
    box-shadow var(--duration-fast) var(--easing-out);
}

.input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 
    0 0 0 3px rgba(55, 120, 220, 0.1),
    var(--shadow-sm);
}

.input::placeholder {
  color: var(--text-tertiary);
}
```

### 모달

```html
<div class="modal-backdrop" onclick="closeModal()">
  <div class="modal" onclick="event.stopPropagation()">
    <h2 class="modal-title">모달 제목</h2>
    <p class="modal-content">모달 내용입니다.</p>
    <button class="btn-primary" onclick="closeModal()">닫기</button>
  </div>
</div>
```

```css
/* 배경 오버레이 */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: var(--z-modal-backdrop);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn var(--duration-base) var(--easing-out);
}

/* 모달 */
.modal {
  width: 90%;
  max-width: 600px;
  background: var(--bg-elevated);
  border-radius: var(--radius-xl);
  padding: var(--spacing-8);
  box-shadow: var(--shadow-2xl);
  z-index: var(--z-modal);
  animation: 
    fadeIn var(--duration-base) var(--easing-out),
    slideUp var(--duration-base) var(--easing-spring);
}

.modal-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-4);
  color: var(--text-primary);
}

.modal-content {
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
  margin-bottom: var(--spacing-6);
  color: var(--text-secondary);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); }
  to { transform: translateY(0); }
}
```

---

## 📐 디자인 토큰 사용법

### 색상

```css
/* 배경색 */
background: var(--bg-primary);        /* 메인 배경 */
background: var(--bg-elevated);       /* 카드, 모달 */
background: var(--bg-hover);          /* Hover 상태 */

/* 텍스트 색상 */
color: var(--text-primary);           /* 주요 텍스트 */
color: var(--text-secondary);         /* 보조 텍스트 */
color: var(--text-tertiary);          /* 3차 텍스트 */

/* 브랜드 색상 */
background: var(--brand-primary);     /* 브랜드 메인 */
background: var(--brand-hover);       /* Hover */
background: var(--brand-active);      /* Active */

/* 액센트 색상 */
background: var(--accent-primary);    /* 액센트 메인 */

/* 원본 색상 (세밀한 제어) */
background: var(--color-primary-500); /* 보라색 500 */
background: var(--color-accent-600);  /* 파란색 600 */
background: var(--color-gray-900);    /* 그레이 900 */
```

### 타이포그래피

```css
/* 폰트 패밀리 */
font-family: var(--font-sans);        /* Inter */
font-family: var(--font-mono);        /* SF Mono */

/* 폰트 크기 */
font-size: var(--font-size-xs);       /* 12px */
font-size: var(--font-size-base);     /* 16px */
font-size: var(--font-size-4xl);      /* 36px */

/* 폰트 굵기 */
font-weight: var(--font-weight-normal);    /* 400 */
font-weight: var(--font-weight-semibold);  /* 600 */

/* 행간 */
line-height: var(--line-height-tight);     /* 1.2 */
line-height: var(--line-height-normal);    /* 1.5 */

/* 자간 */
letter-spacing: var(--letter-spacing-tight); /* -0.025em */
```

### 간격

```css
/* Padding */
padding: var(--spacing-4);                /* 16px */
padding: var(--spacing-3) var(--spacing-6); /* 12px 24px */

/* Margin */
margin-bottom: var(--spacing-8);          /* 32px */

/* Gap */
gap: var(--spacing-4);                    /* 16px */
```

### 모서리

```css
border-radius: var(--radius-base);        /* 6px - Linear 기본 */
border-radius: var(--radius-lg);          /* 12px */
border-radius: var(--radius-full);        /* 완전한 원 */
```

### 그림자

```css
box-shadow: var(--shadow-sm);             /* 작은 그림자 */
box-shadow: var(--shadow-md);             /* 중간 그림자 */
box-shadow: var(--shadow-xl);             /* 큰 그림자 */
```

### 애니메이션

```css
transition: 
  background var(--duration-fast) var(--easing-out),
  transform var(--duration-base) var(--easing-spring);

/* 지속 시간 */
/* var(--duration-fast)    150ms */
/* var(--duration-base)    250ms */
/* var(--duration-slow)    350ms */

/* 이징 */
/* var(--easing-out)       ease-out */
/* var(--easing-spring)    튀는 효과 */
```

### Z-Index

```css
z-index: var(--z-dropdown);      /* 1000 */
z-index: var(--z-modal);         /* 1050 */
z-index: var(--z-tooltip);       /* 1070 */
z-index: var(--z-toast);         /* 1080 */
```

---

## 🎭 상태별 스타일링

### Hover 상태

```css
.element {
  background: var(--bg-elevated);
  transition: all var(--duration-fast) var(--easing-out);
}

.element:hover {
  background: var(--bg-hover);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}
```

### Focus 상태

```css
.input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 
    0 0 0 3px rgba(55, 120, 220, 0.1),
    var(--shadow-sm);
}
```

### Active 상태

```css
.button:active {
  background: var(--brand-active);
  box-shadow: var(--shadow-xs);
  transform: translateY(0);
}
```

### Disabled 상태

```css
.button:disabled {
  background: var(--color-gray-800);
  color: var(--text-disabled);
  cursor: not-allowed;
  opacity: 0.6;
}
```

---

## 🧩 레이아웃 패턴

### 컨테이너

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-8);
}
```

### 그리드

```css
.grid {
  display: grid;
  gap: var(--spacing-4);
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}
```

### 플렉스

```css
.flex {
  display: flex;
  gap: var(--spacing-4);
  align-items: center;
}
```

### 스택 (수직)

```css
.stack {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}
```

---

## 📱 반응형 디자인

```css
/* 모바일 우선 */
.element {
  padding: var(--spacing-4);
  font-size: var(--font-size-base);
}

/* 태블릿 (768px 이상) */
@media (min-width: 768px) {
  .element {
    padding: var(--spacing-6);
    font-size: var(--font-size-lg);
  }
}

/* 데스크탑 (1024px 이상) */
@media (min-width: 1024px) {
  .element {
    padding: var(--spacing-8);
    font-size: var(--font-size-xl);
  }
}
```

---

## ⚡ 최적화 팁

### 1. CSS 변수 재사용

```css
/* 나쁜 예 */
.card {
  background: var(--color-gray-900);
  border: 1px solid var(--color-gray-800);
}

/* 좋은 예 */
.card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-primary);
}
```

### 2. 애니메이션 최적화

```css
/* GPU 가속 속성만 애니메이션 */
.element {
  transition: transform var(--duration-fast) var(--easing-out);
}

.element:hover {
  transform: translateY(-2px); /* GPU 가속 */
}
```

### 3. 시맨틱 토큰 우선 사용

```css
/* 나쁜 예 - 원본 색상 직접 사용 */
color: var(--color-gray-300);

/* 좋은 예 - 시맨틱 토큰 사용 */
color: var(--text-secondary);
```

---

## 🎨 커스터마이징

### 새로운 시맨틱 토큰 추가

```css
:root {
  /* 기존 토큰 기반으로 새 토큰 생성 */
  --bg-card-hover: var(--bg-hover);
  --text-muted: var(--text-tertiary);
  --border-light: var(--color-gray-850);
}
```

### 컴포넌트별 토큰

```css
:root {
  /* 버튼 */
  --button-padding-x: var(--spacing-6);
  --button-padding-y: var(--spacing-3);
  --button-radius: var(--radius-base);
  
  /* 카드 */
  --card-padding: var(--spacing-6);
  --card-radius: var(--radius-lg);
  --card-shadow: var(--shadow-md);
}
```

---

## 🐛 트러블슈팅

### OKLCH 색상이 표시되지 않음

**문제:** 오래된 브라우저에서 OKLCH 지원 안 됨

**해결:**
```css
/* 폴백 색상 추가 */
background: #5B21B6;                    /* 폴백 */
background: var(--color-primary-600);   /* OKLCH */
```

### 다크 테마가 적용되지 않음

**문제:** 시스템 설정이 라이트 모드

**해결:**
```html
<!-- 강제로 다크 테마 적용 -->
<html class="theme-dark">
```

### 폰트가 로드되지 않음

**해결:**
```html
<!-- CDN에서 Inter 폰트 로드 -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

---

## 📚 추가 리소스

- **데모 페이지:** `demo.html` 파일 참고
- **전체 분석:** `design-tokens-analysis-ko.md` 참고
- **원본 토큰:** `tokens.json.txt` 참고

---

## ✅ 체크리스트

프로젝트에 디자인 시스템을 적용할 때:

- [ ] `tokens.css` 파일 포함
- [ ] Inter 폰트 로드 (선택적)
- [ ] 기본 테마 설정 (다크/라이트)
- [ ] 시맨틱 토큰 사용 (`--bg-primary`, `--text-primary` 등)
- [ ] 애니메이션 이징 적용 (`--easing-spring` 등)
- [ ] 반응형 브레이크포인트 구현
- [ ] Z-Index 레이어링 준수

---

**다크 테마 기본으로 빠르고 세련된 UI를 만드세요! 🚀**
