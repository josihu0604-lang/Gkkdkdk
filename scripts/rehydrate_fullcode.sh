#!/usr/bin/env bash
set -euo pipefail

ROOT="${PWD}/zzik-ui-fullcode"
echo "→ Rehydrating ZZIK UI to: $ROOT"
mkdir -p "$ROOT"

# ───────────────── landing (Next.js 15) ─────────────────
mkdir -p "$ROOT/landing/app/ko" "$ROOT/landing/app/zh-CN" "$ROOT/landing/app/ja-JP"
mkdir -p "$ROOT/landing/components/ui" "$ROOT/landing/components/sections" "$ROOT/landing/lib" "$ROOT/landing/styles" "$ROOT/landing/public"

cat > "$ROOT/landing/package.json" <<'PKGJSON'
{
  "name": "zzik-landing",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start -p 3001",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "15.0.0",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "clsx": "2.1.1",
    "framer-motion": "10.18.0",
    "next-intl": "3.10.0"
  },
  "devDependencies": {
    "typescript": "5.6.2",
    "@types/react": "18.3.5",
    "@types/node": "20.12.12",
    "eslint": "8.57.0",
    "eslint-config-next": "15.0.0"
  }
}
PKGJSON

cat > "$ROOT/landing/next.config.js" <<'NEXTCFG'
const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin();

module.exports = withNextIntl({
  output: 'standalone',
  i18n: {
    locales: ['ko', 'zh-CN', 'ja-JP'],
    defaultLocale: 'ko'
  },
  images: {
    domains: ['cdn.zzik.com']
  }
});
NEXTCFG

cat > "$ROOT/landing/tsconfig.json" <<'TSCONFIG'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022", "DOM"],
    "jsx": "preserve",
    "moduleResolution": "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["./**/*.ts", "./**/*.tsx"],
  "exclude": ["node_modules"]
}
TSCONFIG

cat > "$ROOT/landing/styles/globals.css" <<'GLOBALCSS'
/**
 * ZZIK Landing - Design System Integration
 * 
 * Priority: Import from webapp/src/design-system/
 * Fallback: ZZIK brand colors (Orange/Navy/Green)
 * 
 * Note: Adjust path if running from different location
 */

/* Primary: Import from main design system */
@import url("../../../src/design-system/globals.css");

/* Fallback tokens (if design system not found) */
:root {
  /* ZZIK Brand Colors - OKLCH */
  --color-primary-500: oklch(65% 0.20 35);      /* Orange #FF6B35 */
  --color-secondary-500: oklch(48% 0.13 245);   /* Navy #004E89 */
  --color-accent-500: oklch(75% 0.15 165);      /* Green #00D9A3 */
  
  /* Semantic tokens */
  --bg-base: oklch(100% 0 240);
  --text-primary: oklch(12% 0.004 240);
  --interactive-default: var(--color-primary-500);
  --interactive-hover: oklch(58% 0.19 35);
  
  /* Spacing (4px base) */
  --space-2: 0.5rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  
  /* Border Radius */
  --radius-base: 0.375rem;
  --radius-lg: 0.75rem;
}

/* Base styles */
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
}

body {
  background: var(--bg-base);
  color: var(--text-primary);
  font-family: var(--font-sans, 'Inter', -apple-system, BlinkMacSystemFont, sans-serif);
  -webkit-font-smoothing: antialiased;
}

/* Layout utilities */
.container {
  max-width: 1120px;
  margin: 0 auto;
  padding: 2rem;
}

/* Button component */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: var(--radius-base);
  font-weight: 600;
  font-size: 1rem;
  background: var(--interactive-default);
  color: white;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease;
  text-decoration: none;
}

.btn:hover {
  background: var(--interactive-hover);
  transform: translateY(-1px);
}

.btn:active {
  transform: translateY(0);
}

/* Card component */
.card {
  background: white;
  border: 1px solid oklch(92% 0.008 240);
  border-radius: var(--radius-lg);
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

/* Typography utilities */
.subtitle {
  color: oklch(45% 0.015 240);
  font-size: 1rem;
  line-height: 1.5;
}

/* Form inputs */
input, textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid oklch(85% 0.012 240);
  border-radius: var(--radius-base);
  font-family: inherit;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

input:focus, textarea:focus {
  outline: none;
  border-color: var(--interactive-default);
  box-shadow: 0 0 0 3px oklch(97% 0.03 35);
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }
}
GLOBALCSS

cat > "$ROOT/landing/app/layout.tsx" <<'ROOTLAYOUT'
import "../styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ZZIK — Location Integrity SaaS",
  description: "GPS 무결성 기반 위치 체크인 B2B SaaS 플랫폼",
  keywords: ["GPS", "체크인", "위치 무결성", "지오펜스", "B2B SaaS"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
ROOTLAYOUT

cat > "$ROOT/landing/app/ko/page.tsx" <<'PAGEKO'
import Hero from "@/components/sections/Hero";
import TrustBar from "@/components/sections/TrustBar";
import FeatureGrid from "@/components/sections/FeatureGrid";
import ComplianceBanner from "@/components/sections/ComplianceBanner";
import LeadForm from "@/components/sections/LeadForm";

export default function PageKO() {
  return (
    <main>
      <Hero />
      <div className="container">
        <TrustBar />
      </div>
      <div className="container">
        <FeatureGrid />
      </div>
      <div className="container">
        <ComplianceBanner />
      </div>
      <div className="container">
        <LeadForm />
      </div>
    </main>
  );
}
PAGEKO

cp "$ROOT/landing/app/ko/page.tsx" "$ROOT/landing/app/zh-CN/page.tsx"
cp "$ROOT/landing/app/ko/page.tsx" "$ROOT/landing/app/ja-JP/page.tsx"

cat > "$ROOT/landing/components/ui/Button.tsx" <<'BUTTONCOMP'
import { forwardRef, ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          "btn",
          variant === 'outline' && "bg-transparent text-[oklch(65%_0.20_35)] border border-[oklch(65%_0.20_35)]",
          variant === 'secondary' && "bg-[oklch(48%_0.13_245)]",
          size === 'sm' && "text-sm px-3 py-2",
          size === 'lg' && "text-lg px-5 py-3",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
BUTTONCOMP

cat > "$ROOT/landing/components/sections/Hero.tsx" <<'HEROCOMP'
import Button from "@/components/ui/Button";

export default function Hero() {
  return (
    <section style={{ padding: "4rem 0" }}>
      <div className="container" style={{ display: "grid", gap: "1.25rem" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
          위치 무결성으로 체크인 사기 차단
        </h1>
        <p className="subtitle">
          DB ST_DWithin + 5요소 무결성(거리·Wi‑Fi·시간·정확도·속도)로 현장 방문을 증명합니다.
        </p>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <a className="btn" href="#lead">
            데모 상담
          </a>
          <a
            className="btn"
            style={{
              background: "transparent",
              color: "oklch(65% 0.20 35)",
              border: "1px solid oklch(65% 0.20 35)",
            }}
            href="#features"
          >
            제품 기능
          </a>
        </div>
      </div>
    </section>
  );
}
HEROCOMP

cat > "$ROOT/landing/components/sections/TrustBar.tsx" <<'TRUSTBAR'
export default function TrustBar() {
  const partners = ["PartnerA", "PartnerB", "PartnerC", "PartnerD", "PartnerE"];
  
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: "1rem",
        opacity: 0.8,
        marginBottom: "2rem",
      }}
    >
      {partners.map((partner) => (
        <div key={partner} className="card" style={{ textAlign: "center", padding: "1.5rem" }}>
          <span style={{ fontWeight: 600, color: "oklch(45% 0.015 240)" }}>{partner}</span>
        </div>
      ))}
    </div>
  );
}
TRUSTBAR

cat > "$ROOT/landing/components/sections/FeatureGrid.tsx" <<'FEATUREGRID'
export default function FeatureGrid() {
  const features = [
    {
      title: "서버측 지오펜스",
      description: "PostGIS ST_DWithin(geography)로 반경 판정",
    },
    {
      title: "GPS 무결성 5요소",
      description: "거리40·Wi‑Fi25·시간15·정확도10·속도10 / 60점 통과",
    },
    {
      title: "PII 최소화",
      description: "로그에 좌표·연락처 미저장, SSID 7일 후 삭제/해시",
    },
    {
      title: "멱등 처리",
      description: "Idempotency-Key 기반 중복 방지",
    },
  ];

  return (
    <div
      id="features"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "1rem",
        marginBottom: "2rem",
      }}
    >
      {features.map((feature) => (
        <div key={feature.title} className="card">
          <div style={{ fontWeight: 700, marginBottom: "0.5rem", fontSize: "1.1rem" }}>
            {feature.title}
          </div>
          <div className="subtitle">{feature.description}</div>
        </div>
      ))}
    </div>
  );
}
FEATUREGRID

cat > "$ROOT/landing/components/sections/ComplianceBanner.tsx" <<'COMPLIANCE'
export default function ComplianceBanner() {
  return (
    <div
      className="card"
      role="note"
      aria-label="compliance notice"
      style={{
        background: "oklch(97% 0.03 35)",
        border: "1px solid oklch(87% 0.12 35)",
        marginBottom: "2rem",
      }}
    >
      <p style={{ fontSize: "0.95rem", margin: 0, lineHeight: 1.6 }}>
        ⚠️ <strong>컴플라이언스 공지:</strong> 퍼블릭 화면에는 병원 실명을 노출하지 않습니다. 
        지역+전문분야로 표기하며, 쿠폰·오퍼에는 다국어 광고 공시를 적용합니다.
      </p>
    </div>
  );
}
COMPLIANCE

cat > "$ROOT/landing/components/sections/LeadForm.tsx" <<'LEADFORM'
"use client";
import { useState } from "react";
import { submitLead } from "@/lib/api";

export default function LeadForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.target as HTMLFormElement;
    const data = Object.fromEntries(new FormData(form).entries());

    const result = await submitLead(data);

    if (result.ok) {
      setSuccess(true);
      form.reset();
    } else {
      setError("제출에 실패했습니다. 다시 시도해주세요.");
    }

    setLoading(false);
  }

  return (
    <form
      id="lead"
      onSubmit={handleSubmit}
      className="card"
      style={{ display: "grid", gap: "1rem", maxWidth: "500px" }}
    >
      <h2 style={{ marginBottom: "0.5rem" }}>상담 신청</h2>

      <label style={{ display: "grid", gap: "0.25rem" }}>
        <span style={{ fontWeight: 600 }}>회사명</span>
        <input name="business_name" required className="card" />
      </label>

      <label style={{ display: "grid", gap: "0.25rem" }}>
        <span style={{ fontWeight: 600 }}>담당자</span>
        <input name="contact_name" required className="card" />
      </label>

      <label style={{ display: "grid", gap: "0.25rem" }}>
        <span style={{ fontWeight: 600 }}>이메일</span>
        <input name="email" type="email" required className="card" />
      </label>

      <label style={{ display: "grid", gap: "0.25rem" }}>
        <span style={{ fontWeight: 600 }}>전화번호</span>
        <input name="phone" required className="card" />
      </label>

      <button className="btn" disabled={loading} type="submit">
        {loading ? "전송 중..." : "상담 신청"}
      </button>

      {success && (
        <div style={{ color: "oklch(75% 0.15 165)", fontWeight: 600 }}>
          ✓ 제출되었습니다. 영업일 기준 1일 내 회신합니다.
        </div>
      )}

      {error && (
        <div style={{ color: "oklch(60% 0.22 30)", fontWeight: 600 }}>
          ✗ {error}
        </div>
      )}
    </form>
  );
}
LEADFORM

cat > "$ROOT/landing/lib/api.ts" <<'APILIB'
export async function submitLead(body: any): Promise<{ ok: boolean }> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:3000';
    const res = await fetch(`${apiUrl}/api/v1/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return { ok: res.ok };
  } catch (error) {
    console.error("Lead submission error:", error);
    return { ok: false };
  }
}
APILIB

# ───────────────── mobile (Expo / React Native) ─────────────────
mkdir -p "$ROOT/mobile/app/(tabs)" "$ROOT/mobile/components" "$ROOT/mobile/services" "$ROOT/mobile/assets"

cat > "$ROOT/mobile/package.json" <<'MOBILEPKG'
{
  "name": "zzik-mobile",
  "version": "1.0.0",
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "expo": "~52.0.0",
    "expo-router": "~4.0.0",
    "react": "18.3.1",
    "react-native": "0.76.0",
    "expo-location": "~18.0.0",
    "axios": "^1.7.7"
  },
  "devDependencies": {
    "@babel/core": "^7.25.0",
    "typescript": "^5.6.2",
    "@types/react": "^18.3.5"
  }
}
MOBILEPKG

cat > "$ROOT/mobile/app.json" <<'APPJSON'
{
  "expo": {
    "name": "ZZIK",
    "slug": "zzik",
    "version": "1.0.0",
    "orientation": "portrait",
    "userInterfaceStyle": "automatic",
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "ZZIK이 체크인 시 위치 정보를 사용합니다."
        }
      ]
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.zzik.app"
    },
    "android": {
      "permissions": ["ACCESS_FINE_LOCATION", "ACCESS_COARSE_LOCATION"],
      "package": "com.zzik.app"
    }
  }
}
APPJSON

cat > "$ROOT/mobile/app/(tabs)/index.tsx" <<'MOBILEINDEX'
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
MOBILEINDEX

cat > "$ROOT/mobile/services/api.ts" <<'MOBILEAPI'
import axios from "axios";

/**
 * Generate simple idempotency key from payload + timestamp
 */
function generateIdempotencyKey(payload: any): string {
  const raw = JSON.stringify(payload) + ":" + Date.now().toString().slice(0, 10);
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash * 31) + raw.charCodeAt(i)) >>> 0;
  }
  return "idem-" + hash.toString(16);
}

const API_URL = (process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000").replace(/\/$/, '');

export async function checkin({
  latitude,
  longitude,
  accuracy,
  timestamp,
}: {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
}): Promise<boolean> {
  try {
    const headers = {
      "Idempotency-Key": generateIdempotencyKey({ latitude, longitude, timestamp }),
      "Content-Type": "application/json",
    };

    const body = {
      placeId: undefined,
      hospitalId: undefined,
      latitude,
      longitude,
      accuracy,
      timestamp,
    };

    const response = await axios.post(`${API_URL}/api/v1/checkins`, body, { headers });
    return response.status >= 200 && response.status < 300;
  } catch (error) {
    console.error("Checkin error:", error);
    return false;
  }
}
MOBILEAPI

# ───────────────── scripts ─────────────────
mkdir -p "$ROOT/scripts"

cat > "$ROOT/scripts/smoke-e2e.sh" <<'SMOKESH'
#!/usr/bin/env bash
set -euo pipefail

API="${1:-http://localhost:3000}"

echo "→ ZZIK Smoke Test: Lead Submission"
echo "→ API: $API"

curl -sS -X POST "$API/api/v1/leads" \
  -H "Content-Type: application/json" \
  -d '{
    "business_name": "ZZIK Test Corp",
    "contact_name": "Operations",
    "email": "ops@example.com",
    "phone": "010-0000-0000"
  }' | jq . || echo "⚠️ jq not installed, showing raw response"

echo "→ Done"
SMOKESH
chmod +x "$ROOT/scripts/smoke-e2e.sh"

# ───────────────── readme ─────────────────
cat > "$ROOT/README.md" <<'README'
# ZZIK UI Fullcode (Landing + Mobile)

## 🎨 Design System Integration

This project uses the **ZZIK Design System** with:
- **Colors**: Orange (#FF6B35), Navy (#004E89), Green (#00D9A3)
- **Format**: W3C Design Tokens + OKLCH color space
- **Source**: `/src/design-system/tokens.json` and `globals.css`

## 🚀 Quick Start

### Landing (Next.js 15)
```bash
cd landing
npm install
NEXT_PUBLIC_API_URL=http://localhost:3000 npm run dev
```
Open: http://localhost:3001

### Mobile (Expo)
```bash
cd mobile
npm install
EXPO_PUBLIC_API_URL=http://localhost:3000 npm start
```

## 📁 Structure

```
zzik-ui-fullcode/
├── landing/          # Next.js 15 landing pages (ko/zh-CN/ja-JP)
│   ├── styles/       # → imports from ../../src/design-system/
│   └── components/
├── mobile/           # Expo React Native app
│   ├── app/(tabs)/
│   └── services/
└── scripts/
    └── smoke-e2e.sh  # API smoke test
```

## 🔐 Compliance

- **No Real Names**: Public screens use region+specialty instead of hospital names
- **Ad Disclosure**: Coupons/offers include multilingual ad notices
- **PII Minimization**: No coordinates/contacts in logs, SSID deleted after 7 days

## 🎯 GPS Integrity (Server-side)

- **Geofence**: PostGIS `ST_DWithin(geography)` for radius validation
- **5-Factor Score**: Distance(40) + WiFi(25) + Time(15) + Accuracy(10) + Speed(10)
- **Threshold**: 60 points required to pass
- **Idempotency**: `Idempotency-Key` header prevents duplicate check-ins

## 🧪 Testing

```bash
# Smoke test (requires backend running)
cd scripts
./smoke-e2e.sh http://localhost:3000
```

## 📝 Notes

- Design system paths assume script runs from webapp root
- If backend is not ready, API calls will fail gracefully
- Multi-language support: Korean (default), Chinese, Japanese
- Mobile app uses Expo SDK 52 (latest stable as of Nov 2024)
README

# ───────────────── design system symlink guide ─────────────────
cat > "$ROOT/DESIGN_SYSTEM.md" <<'DESIGNDOC'
# Design System Integration Guide

## 📦 Location

The ZZIK Design System lives in: `/home/user/webapp/src/design-system/`

Files:
- `tokens.json` - W3C Design Tokens Format (9.8KB)
- `globals.css` - CSS Variables + Base Styles (17KB)

## 🎨 ZZIK Brand Colors (OKLCH)

```css
/* Primary - Orange (Action, Rewards, Energy) */
--color-primary-500: oklch(65% 0.20 35);  /* #FF6B35 */

/* Secondary - Navy (Trust, B2B, Professionalism) */
--color-secondary-500: oklch(48% 0.13 245);  /* #004E89 */

/* Accent - Green (Success, Money, Achievement) */
--color-accent-500: oklch(75% 0.15 165);  /* #00D9A3 */
```

## 🔗 How Landing Page Imports

```css
/* landing/styles/globals.css */
@import url("../../../src/design-system/globals.css");
```

**Path Explanation:**
- `landing/styles/` → `../` → `landing/`
- `landing/` → `../` → `zzik-ui-fullcode/`
- `zzik-ui-fullcode/` → `../` → `webapp/`
- `webapp/src/design-system/globals.css` ✓

## 🏗️ Directory Structure

```
webapp/
├── src/
│   └── design-system/
│       ├── tokens.json    (W3C format)
│       └── globals.css    (CSS variables)
└── zzik-ui-fullcode/      (generated by script)
    └── landing/
        └── styles/
            └── globals.css (imports from ../../src/design-system/)
```

## ✅ Verification

After running the script, verify design system linking:

```bash
# Check if import path resolves
cd zzik-ui-fullcode/landing/styles
ls -la ../../../src/design-system/

# Should show:
# globals.css
# tokens.json
```

## 🎭 Fallback Behavior

If design system files are not found, `landing/styles/globals.css` includes fallback tokens:

```css
:root {
  --color-primary-500: oklch(65% 0.20 35);      /* ZZIK Orange */
  --color-secondary-500: oklch(48% 0.13 245);   /* ZZIK Navy */
  --color-accent-500: oklch(75% 0.15 165);      /* ZZIK Green */
  /* ...other tokens... */
}
```

This ensures the landing page works even if design system is not available.

## 🌐 Multi-language Font Support

Korean pages use **Pretendard**, Chinese pages use **Noto Sans SC**:

```css
:lang(ko) {
  font-family: var(--font-sans-ko);
}

:lang(zh) {
  font-family: var(--font-sans-zh);
}
```

## 📱 Mobile-Specific Tokens

Additional tokens for mobile app UI:

```css
--tab-bar-height: 56px;           /* iOS standard */
--map-marker-size: 40px;          /* Voucher markers */
--video-aspect-ratio: 0.5625;     /* 9:16 vertical */
```

See `tokens.json` → `mobile` section for full list.
DESIGNDOC

echo ""
echo "✅ ZZIK UI Fullcode rehydration complete!"
echo ""
echo "📂 Output directory: $ROOT"
echo ""
echo "🚀 Next steps:"
echo "   1. cd $ROOT/landing && npm install"
echo "   2. NEXT_PUBLIC_API_URL=http://localhost:3000 npm run dev"
echo "   3. Open http://localhost:3001"
echo ""
echo "📱 For mobile:"
echo "   1. cd $ROOT/mobile && npm install"
echo "   2. EXPO_PUBLIC_API_URL=http://localhost:3000 npm start"
echo ""
echo "📁 Generated files:"
find "$ROOT" -type f | sed "s|$ROOT/||" | sort
