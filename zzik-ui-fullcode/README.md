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
