#!/usr/bin/env bash
set -euo pipefail

ROOT="${PWD}/zzik-ui-fullcode"
echo "→ Rehydrating to: $ROOT"
mkdir -p "$ROOT"

# ───────────────── landing (Next.js 15) ─────────────────
mkdir -p "$ROOT/landing/app/ko" "$ROOT/landing/app/zh-CN" "$ROOT/landing/app/ja-JP"
mkdir -p "$ROOT/landing/components/ui" "$ROOT/landing/components/sections" "$ROOT/landing/lib" "$ROOT/landing/styles" "$ROOT/landing/public"

cat > "$ROOT/landing/package.json" <<'EOF'
{
  "name": "zzik-landing",
  "version": "1.0.0",
  "private": true,
  "scripts": { "dev": "next dev -p 3001", "build": "next build", "start": "next start -p 3001", "lint": "next lint", "type-check": "tsc --noEmit" },
  "dependencies": {
    "next": "15.0.0",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "clsx": "2.1.1",
    "framer-motion": "10.18.0",
    "next-intl": "3.10.0"
  },
  "devDependencies": { "typescript": "5.6.2", "@types/react": "18.3.5", "@types/node": "20.12.12", "eslint": "8.57.0", "eslint-config-next": "15.0.0" }
}
EOF

cat > "$ROOT/landing/next.config.js" <<'EOF'
const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin();
module.exports = withNextIntl({
  output: 'standalone',
  i18n: { locales: ['ko','zh-CN','ja-JP'], defaultLocale: 'ko' },
  images: { domains: ['cdn.zzik.com'] }
});
EOF

cat > "$ROOT/landing/tsconfig.json" <<'EOF'
{
  "compilerOptions": {
    "target": "ES2022", "module": "ESNext", "lib": ["ES2022","DOM"],
    "jsx": "react-jsx", "moduleResolution": "Bundler", "strict": true,
    "baseUrl": ".", "paths": { "@/*": ["./*"] }
  }, "include": ["./**/*.ts","./**/*.tsx"]
}
EOF

cat > "$ROOT/landing/styles/globals.css" <<'EOF'
/* 우선 repo 루트의 디자인 시스템을 가져옴 */
@import "../../design-system/globals.css";
/* 토큰 파일이 없는 환경을 위한 최소 폴백 */
:root {
  --bg-base: oklch(100% 0 240);
  --text-primary: oklch(12% 0.004 240);
  --interactive-default: oklch(60% 0.20 290);
  --interactive-hover: oklch(50% 0.18 290);
}
html,body { height: 100% }
body { background: var(--bg-base); color: var(--text-primary); font-family: Inter, system-ui, sans-serif }
.container { max-width: 1120px; margin: 0 auto; padding: 2rem }
.btn {
  display:inline-flex; align-items:center; justify-content:center; gap:.5rem;
  padding:.75rem 1rem; border-radius:.5rem; font-weight:600;
  background:var(--interactive-default); color:white; transition:background-color .2s ease;
}
.btn:hover { background:var(--interactive-hover) }
.card { background: white; border: 1px solid oklch(92% 0.008 240); border-radius:.75rem; padding:1rem }
.subtitle { color: oklch(45% 0.015 240) }
EOF

cat > "$ROOT/landing/app/layout.tsx" <<'EOF'
import "./styles/globals.css";
export const metadata = { title: "ZZIK — Location Integrity SaaS", description: "GPS 무결성 기반 B2B SaaS" };
export default function RootLayout({children}:{children:React.ReactNode}) {
  return (<html lang="ko"><body>{children}</body></html>);
}
EOF

cat > "$ROOT/landing/app/ko/page.tsx" <<'EOF'
import Hero from "@/components/sections/Hero";
import TrustBar from "@/components/sections/TrustBar";
import FeatureGrid from "@/components/sections/FeatureGrid";
import ComplianceBanner from "@/components/sections/ComplianceBanner";
import LeadForm from "@/components/sections/LeadForm";

export default function PageKO() {
  return (
    <main>
      <Hero />
      <div className="container"><TrustBar /></div>
      <div className="container"><FeatureGrid /></div>
      <div className="container"><ComplianceBanner /></div>
      <div className="container"><LeadForm /></div>
    </main>
  );
}
EOF

cp "$ROOT/landing/app/ko/page.tsx" "$ROOT/landing/app/zh-CN/page.tsx"
cp "$ROOT/landing/app/ko/page.tsx" "$ROOT/landing/app/ja-JP/page.tsx"

cat > "$ROOT/landing/components/ui/Button.tsx" <<'EOF'
import { forwardRef, ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";
type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary'|'outline', size?: 'sm'|'md'|'lg' };
export const Button = forwardRef<HTMLButtonElement, Props>(({className,variant='primary',size='md',...props},ref)=>(
  <button ref={ref} className={clsx(
    "btn",
    variant==='outline' && "bg-transparent text-[oklch(50%_0.18_290)] border border-[oklch(50%_0.18_290)]",
    size==='sm' && "text-sm px-3 py-2", size==='lg' && "text-lg px-5 py-3",
    className)} {...props} />
));
Button.displayName='Button';
export default Button;
EOF

cat > "$ROOT/landing/components/sections/Hero.tsx" <<'EOF'
import Button from "@/components/ui/Button";
export default function Hero(){
  return (
    <section style={{padding:"4rem 0"}}>
      <div className="container" style={{display:"grid",gap:"1.25rem"}}>
        <h1 style={{fontSize:"2.5rem",fontWeight:800,letterSpacing:"-0.02em"}}>위치 무결성으로 체크인 사기 차단</h1>
        <p className="subtitle">DB ST_DWithin + 5요소 무결성(거리·Wi‑Fi·시간·정확도·속도)로 현장 방문을 증명합니다.</p>
        <div style={{display:"flex",gap:".75rem"}}>
          <a className="btn" href="#lead">데모 상담</a>
          <a className="btn" style={{background:"transparent",color:"oklch(50% 0.18 290)",border:"1px solid oklch(50% 0.18 290)"}} href="#features">제품 기능</a>
        </div>
      </div>
    </section>
  );
}
EOF

cat > "$ROOT/landing/components/sections/TrustBar.tsx" <<'EOF'
export default function TrustBar(){
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:"1rem",opacity:.8}}>
      {["PartnerA","PartnerB","PartnerC","PartnerD","PartnerE"].map(x=>
        <div key={x} className="card" style={{textAlign:"center"}}>{x}</div>
      )}
    </div>
  );
}
EOF

cat > "$ROOT/landing/components/sections/FeatureGrid.tsx" <<'EOF'
export default function FeatureGrid(){
  const items = [
    {t:"서버측 지오펜스",d:"PostGIS ST_DWithin(geography)로 반경 판정"},
    {t:"GPS 무결성 5요소",d:"거리40·Wi‑Fi25·시간15·정확도10·속도10 / 60점 통과"},
    {t:"PII 최소화",d:"로그에 좌표·연락처 미저장, SSID 7일 후 삭제/해시"},
    {t:"멱등 처리",d:"Idempotency-Key 기반 중복 방지"},
  ];
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:"1rem"}}>
      {items.map(i=>(
        <div key={i.t} className="card">
          <div style={{fontWeight:700,marginBottom:".25rem"}}>{i.t}</div>
          <div className="subtitle">{i.d}</div>
        </div>
      ))}
    </div>
  );
}
EOF

cat > "$ROOT/landing/components/sections/ComplianceBanner.tsx" <<'EOF'
export default function ComplianceBanner(){
  return (
    <div className="card" role="note" aria-label="compliance">
      <p style={{fontSize:".95rem"}}>
        퍼블릭 화면에는 병원 실명을 노출하지 않습니다. 지역+전문분야로 표기하며, 쿠폰·오퍼에는 다국어 광고 공시를 적용합니다.
      </p>
    </div>
  );
}
EOF

cat > "$ROOT/landing/components/sections/LeadForm.tsx" <<'EOF'
"use client";
import { useState } from "react";
import { submitLead } from "@/lib/api";
export default function LeadForm(){
  const [loading,setLoading]=useState(false);
  const [ok,setOk]=useState(false);
  async function onSubmit(e:React.FormEvent){
    e.preventDefault(); setLoading(true);
    const form = e.target as HTMLFormElement;
    const data = Object.fromEntries(new FormData(form).entries());
    const r = await submitLead(data);
    setOk(r.ok); setLoading(false);
  }
  return (
    <form id="lead" onSubmit={onSubmit} className="card" style={{display:"grid",gap:".5rem"}}>
      <label>회사명<input name="business_name" required className="card" /></label>
      <label>담당자<input name="contact_name" required className="card" /></label>
      <label>이메일<input name="email" type="email" required className="card" /></label>
      <label>전화번호<input name="phone" required className="card" /></label>
      <button className="btn" disabled={loading}>{loading?"전송 중":"상담 신청"}</button>
      {ok && <div className="subtitle">제출되었습니다. 영업일 기준 1일 내 회신합니다.</div>}
    </form>
  );
}
EOF

cat > "$ROOT/landing/lib/api.ts" <<'EOF'
export async function submitLead(body:any){
  const res = await fetch(process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/,'') + "/api/v1/leads",{
    method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(body)
  }).catch(()=>({ok:false}));
  return res ?? { ok:false };
}
EOF

# ───────────────── mobile (Expo / React Native) ─────────────────
mkdir -p "$ROOT/mobile/app/(tabs)" "$ROOT/mobile/components" "$ROOT/mobile/services" "$ROOT/mobile/assets"

cat > "$ROOT/mobile/package.json" <<'EOF'
{
  "name": "zzik-mobile",
  "version": "1.0.0",
  "main": "expo-router/entry",
  "scripts": { "start":"expo start","android":"expo start --android","ios":"expo start --ios","web":"expo start --web" },
  "dependencies": {
    "expo": "~51.0.0",
    "expo-router": "~3.5.0",
    "react": "18.2.0",
    "react-native": "0.74.3",
    "expo-location": "~17.0.1",
    "axios": "^1.7.2"
  },
  "devDependencies": { "@babel/core": "^7.25.0", "typescript": "^5.6.2", "@types/react": "^18.3.5" }
}
EOF

cat > "$ROOT/mobile/app.json" <<'EOF'
{
  "expo": {
    "name": "ZZIK",
    "slug": "zzik",
    "version": "1.0.0",
    "orientation": "portrait",
    "userInterfaceStyle": "automatic",
    "plugins": [["expo-location", { "locationAlwaysAndWhenInUsePermission": "Allow ZZIK to use your location for check-ins." }]],
    "ios": { "supportsTablet": true },
    "android": { "permissions": ["ACCESS_FINE_LOCATION","ACCESS_COARSE_LOCATION"] }
  }
}
EOF

cat > "$ROOT/mobile/app/(tabs)/index.tsx" <<'EOF'
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
EOF

cat > "$ROOT/mobile/services/api.ts" <<'EOF'
import axios from "axios";

function idemKey(payload:any){ // 간단 멱등 키
  const raw = JSON.stringify(payload) + ":" + Date.now().toString().slice(0,9);
  let h=0; for(let i=0;i<raw.length;i++){ h=(h*31 + raw.charCodeAt(i))>>>0; }
  return "idem-"+h.toString(16);
}

const API = (process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000").replace(/\/$/,'');

export async function checkin({ latitude, longitude, accuracy, timestamp }:{
  latitude:number; longitude:number; accuracy:number; timestamp:string;
}):Promise<boolean>{
  try{
    const headers = { "Idempotency-Key": idemKey({latitude,longitude,timestamp}) };
    const body = { placeId: undefined, hospitalId: undefined, latitude, longitude, accuracy, timestamp };
    const res = await axios.post(API+"/api/v1/checkins", body, { headers });
    return res.status >= 200 && res.status < 300 && !!res.data;
  }catch{ return false; }
}
EOF

# ───────────────── scripts ─────────────────
mkdir -p "$ROOT/scripts"

cat > "$ROOT/scripts/smoke-e2e.sh" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
API="${1:-http://localhost:3000}"
echo "→ Smoke: lead submission"
curl -sS -X POST "$API/api/v1/leads" -H "Content-Type: application/json" \
 -d '{"business_name":"ZZIK","contact_name":"Ops","email":"ops@example.com","phone":"010-0000-0000"}' | jq .
echo "→ Done"
EOF
chmod +x "$ROOT/scripts/smoke-e2e.sh"

# ───────────────── readme ─────────────────
cat > "$ROOT/README.md" <<'EOF'
# ZZIK UI Fullcode (Landing + Mobile)

## Run
# Landing
cd landing && npm i && NEXT_PUBLIC_API_URL=http://localhost:3000 npm run dev -p 3001
# Mobile
cd ../mobile && npm i && EXPO_PUBLIC_API_URL=http://localhost:3000 npm run start

## Notes
- UI는 design-system/globals.css, tokens.json을 우선 참조. 색·간격·그리드는 토큰 기준. 
- 퍼블릭 화면은 병원 실명을 노출하지 않고 지역+전문분야로 표기.
- 서버는 DB ST_DWithin(geography) + 5요소 무결성(60점 통과)을 전제로 동작.
EOF

echo "→ Done. Directory ready:"
find "$ROOT" -maxdepth 3 -type f | sed "s|$ROOT/||"
