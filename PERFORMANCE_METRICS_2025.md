# ZZIK 성능 메트릭 목표 (2025)

**버전:** 1.0  
**작성일:** 2025-11-11  
**목적:** Next.js 15 기반 성능 목표 설정 및 모니터링 계획

---

## 🎯 Executive Summary

### 핵심 목표
- **Lighthouse Score**: 전 항목 90+ 달성
- **Core Web Vitals**: Good 등급 100% 달성
- **API Response Time**: p95 < 500ms
- **Bundle Size**: < 250KB (gzipped)

### Next.js 15 목표
- **LCP**: < 2.5s (Largest Contentful Paint)
- **CLS**: < 0.07 (Cumulative Layout Shift)
- **TBT**: < 200ms (Total Blocking Time)

---

## 1️⃣ Lighthouse 목표 (90+ 필수)

### 성능 목표

```yaml
lighthouse_targets:
  performance: 95+
  accessibility: 95+
  best_practices: 95+
  seo: 95+
  pwa: 90+  # Optional for landing page
```

### 측정 방법

**1. 로컬 테스트**
```bash
# Chrome DevTools Lighthouse
# 1. Chrome 개발자 도구 열기 (F12)
# 2. Lighthouse 탭 선택
# 3. "Generate Report" 클릭

# CLI 사용
npm install -g lighthouse
lighthouse https://zzik.com --view
```

**2. CI/CD 통합**
```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push, pull_request]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            https://zzik-preview.vercel.app
          temporaryPublicStorage: true
          uploadArtifacts: true
```

**3. 모니터링 도구**
- **WebPageTest**: https://www.webpagetest.org
- **PageSpeed Insights**: https://pagespeed.web.dev
- **Vercel Analytics**: 자동 통합

---

## 2️⃣ Core Web Vitals (필수 지표)

### LCP (Largest Contentful Paint)

**목표: < 2.5s**

```
Good: 0-2.5s
Needs Improvement: 2.5-4.0s
Poor: > 4.0s
```

**최적화 전략:**

1. **Image Optimization**
```tsx
// src/app/[locale]/page.tsx
import Image from 'next/image';

<Image
  src="/hero.webp"
  alt="ZZIK Hero"
  width={1200}
  height={600}
  priority  // LCP 개선
  quality={90}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQ..."
/>
```

2. **Font Optimization**
```tsx
// src/app/[locale]/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin', 'korean'],
  display: 'swap',  // FOIT 방지
  preload: true
});
```

3. **Server Components 우선 사용**
```tsx
// 기본적으로 서버 컴포넌트
export default async function Page() {
  const data = await fetch('...');
  return <div>...</div>;
}

// 클라이언트 컴포넌트는 필요시만
'use client';
export function InteractiveComponent() {
  const [state, setState] = useState();
  // ...
}
```

### FID (First Input Delay) → INP (Interaction to Next Paint)

**목표: < 100ms (FID), < 200ms (INP)**

**최적화 전략:**

1. **JavaScript 최소화**
```javascript
// next.config.js
module.exports = {
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  swcMinify: true,
};
```

2. **Dynamic Import**
```tsx
// 큰 컴포넌트는 동적 로딩
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <Skeleton />,
  ssr: false  // 클라이언트만 렌더링
});
```

### CLS (Cumulative Layout Shift)

**목표: < 0.1**

**최적화 전략:**

1. **이미지에 명시적 크기 지정**
```tsx
<Image
  src="/image.jpg"
  width={800}
  height={600}
  // aspect ratio 예약
/>
```

2. **폰트 로딩 최적화**
```css
/* globals.css */
@font-face {
  font-family: 'CustomFont';
  font-display: swap;  /* FOIT 방지 */
  /* ... */
}
```

3. **Skeleton UI 사용**
```tsx
export function ProductCard({ loading }) {
  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }
  return <div>...</div>;
}
```

---

## 3️⃣ 커스텀 메트릭

### API Response Time

**목표:**
```yaml
api_performance:
  p50: < 200ms
  p95: < 500ms
  p99: < 1000ms
```

**측정 지점:**
- GPS 검증 API: `/api/gps/verify`
- 체크인 API: `/api/checkin`
- 매장 검색 API: `/api/stores/search`

**모니터링 코드:**
```typescript
// src/lib/api-client.ts
import { performance } from 'perf_hooks';

export async function apiRequest(url: string, options?: RequestInit) {
  const start = performance.now();
  
  try {
    const response = await fetch(url, options);
    const end = performance.now();
    const duration = end - start;
    
    // Send to analytics
    if (typeof window !== 'undefined') {
      window.gtag?.('event', 'api_call', {
        url,
        duration,
        status: response.status
      });
    }
    
    return response;
  } catch (error) {
    const end = performance.now();
    console.error('API Error:', { url, duration: end - start });
    throw error;
  }
}
```

### Bundle Size

**목표:**
```yaml
bundle_size:
  first_load_js: < 250KB (gzipped)
  total_js: < 500KB (gzipped)
  css: < 50KB (gzipped)
```

**측정 방법:**
```bash
# Build 후 자동 표시
npm run build

# 상세 분석
npm install -g webpack-bundle-analyzer
ANALYZE=true npm run build
```

**최적화 전략:**

1. **Tree Shaking**
```typescript
// ❌ 전체 라이브러리 import
import _ from 'lodash';

// ✅ 필요한 함수만 import
import { debounce } from 'lodash-es';
```

2. **Code Splitting**
```typescript
// next.config.js
module.exports = {
  experimental: {
    optimizePackageImports: ['lodash', 'react-icons']
  }
};
```

### Time to Interactive (TTI)

**목표: < 3.5s**

**측정 도구:**
- Lighthouse
- WebPageTest
- Chrome DevTools Performance

---

## 4️⃣ 모니터링 설정

### Vercel Analytics

**1. 설치**
```bash
npm install @vercel/analytics
```

**2. 통합**
```tsx
// src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### Sentry Performance Monitoring

**1. 설치**
```bash
npm install @sentry/nextjs
```

**2. 설정**
```javascript
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,  // 10% 샘플링
  integrations: [
    new Sentry.BrowserTracing({
      tracePropagationTargets: ['api.zzik.com'],
    }),
  ],
});
```

### Custom Real User Monitoring (RUM)

```typescript
// src/lib/rum.ts
export function reportWebVitals(metric: NextWebVitalsMetric) {
  const { id, name, label, value } = metric;
  
  // Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', name, {
      event_category: label === 'web-vital' ? 'Web Vitals' : 'Next.js custom metric',
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      event_label: id,
      non_interaction: true,
    });
  }
  
  // Custom backend
  fetch('/api/analytics/web-vitals', {
    method: 'POST',
    body: JSON.stringify({ name, value, id }),
    headers: { 'Content-Type': 'application/json' },
  });
}
```

```tsx
// src/app/[locale]/layout.tsx
export { reportWebVitals } from '@/lib/rum';
```

---

## 5️⃣ 성능 예산 (Performance Budget)

### JavaScript Budget

```yaml
javascript_budget:
  landing_page: 
    max_size: 250KB  # gzipped
    warning_threshold: 200KB
  
  dashboard_page:
    max_size: 400KB
    warning_threshold: 350KB
```

### Image Budget

```yaml
image_budget:
  hero_image:
    max_size: 200KB
    format: WebP or AVIF
    dimensions: 1920x1080
  
  thumbnails:
    max_size: 50KB
    format: WebP
    dimensions: 400x300
```

### Network Budget

```yaml
network_budget:
  total_requests: < 50
  total_size: < 2MB
  api_calls: < 10 (per page load)
```

---

## 6️⃣ 최적화 체크리스트

### 이미지 최적화

- [ ] **Next/Image 사용** (모든 이미지)
- [ ] **WebP/AVIF 포맷** (브라우저 지원에 따라)
- [ ] **Lazy Loading** (viewport 밖 이미지)
- [ ] **Priority 속성** (LCP 이미지에)
- [ ] **적절한 크기 조정** (srcset 자동 생성)

### 폰트 최적화

- [ ] **next/font 사용** (폰트 자동 최적화)
- [ ] **font-display: swap** (FOIT 방지)
- [ ] **로컬 폰트 서빙** (Google Fonts 대신)
- [ ] **subset 사용** (필요한 글리프만)

### JavaScript 최적화

- [ ] **Server Components 우선** (RSC)
- [ ] **Dynamic Import** (큰 컴포넌트)
- [ ] **Tree Shaking** (불필요한 코드 제거)
- [ ] **Code Splitting** (route-based)
- [ ] **Minification** (프로덕션 빌드)

### CSS 최적화

- [ ] **Tailwind JIT** (사용하지 않는 CSS 제거)
- [ ] **CSS Modules** (scope 격리)
- [ ] **Critical CSS Inline** (자동)
- [ ] **CSS Minification** (프로덕션 빌드)

### 캐싱 최적화

- [ ] **ISR (Incremental Static Regeneration)** (정적 페이지)
- [ ] **SWR (Stale-While-Revalidate)** (API 데이터)
- [ ] **CDN 캐싱** (Vercel Edge Network)
- [ ] **Browser Caching** (Cache-Control 헤더)

---

## 7️⃣ 성능 테스트 시나리오

### 로컬 테스트

```bash
# 1. 프로덕션 빌드
npm run build

# 2. 프로덕션 서버 실행
npm run start

# 3. Lighthouse 실행
lighthouse http://localhost:3001 --view
```

### Staging 테스트

```bash
# Vercel Preview 배포 후
lighthouse https://zzik-<hash>.vercel.app --view
```

### 프로덕션 테스트

```bash
# 주간 자동 테스트
lighthouse https://zzik.com --view
```

### 성능 회귀 테스트

```yaml
# .github/workflows/performance.yml
name: Performance Regression Test
on:
  pull_request:
    branches: [main]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build and Test
        run: |
          npm install
          npm run build
          npm run start &
          npx wait-on http://localhost:3001
      - name: Run Lighthouse
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: http://localhost:3001
          budgetPath: ./budget.json
          uploadArtifacts: true
```

**budget.json:**
```json
[
  {
    "path": "/*",
    "resourceSizes": [
      {
        "resourceType": "script",
        "budget": 250
      },
      {
        "resourceType": "image",
        "budget": 500
      },
      {
        "resourceType": "total",
        "budget": 2000
      }
    ],
    "resourceCounts": [
      {
        "resourceType": "third-party",
        "budget": 10
      }
    ]
  }
]
```

---

## 8️⃣ 알림 및 보고

### Slack 알림 (성능 저하 시)

```typescript
// src/lib/alert.ts
export async function sendPerformanceAlert(metric: string, value: number, threshold: number) {
  if (value > threshold) {
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      body: JSON.stringify({
        text: `⚠️ Performance Alert`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*${metric}* exceeded threshold\n*Value:* ${value}\n*Threshold:* ${threshold}`
            }
          }
        ]
      })
    });
  }
}
```

### 주간 성능 리포트

```markdown
# ZZIK 주간 성능 리포트 (2025-11-11)

## 요약
- Lighthouse Score: 94 (목표: 95+) ⚠️
- LCP: 2.3s (목표: <2.5s) ✅
- CLS: 0.08 (목표: <0.1) ✅
- API p95: 420ms (목표: <500ms) ✅

## 개선 필요 사항
1. JavaScript 번들 크기: 280KB (목표: 250KB)
   - 해결: lodash → lodash-es 교체

## 다음 주 목표
- [ ] Lighthouse Score 95+ 달성
- [ ] JavaScript 번들 250KB 이하
```

---

## 9️⃣ 참고 자료

### 공식 문서
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse Scoring](https://web.dev/performance-scoring/)

### 도구
- **Lighthouse**: https://github.com/GoogleChrome/lighthouse
- **WebPageTest**: https://www.webpagetest.org
- **Bundle Analyzer**: https://github.com/vercel/next.js/tree/canary/packages/next-bundle-analyzer

### 벤치마크
- **Next.js Showcase**: https://nextjs.org/showcase
- **Vercel Speed Insights**: https://vercel.com/analytics

---

**작성자**: Claude + Next.js 15 Research  
**검토**: CTO, DevOps Team  
**최종 업데이트**: 2025-11-11  
**다음 검토**: 매주 월요일
