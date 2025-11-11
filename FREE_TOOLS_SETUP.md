# ZZIK 무료 도구 설정 가이드

**작성일**: 2025-11-11  
**목표**: 100% 무료 도구로 MVP 개발 환경 구축  
**예상 시간**: 2-3시간

---

## 📋 체크리스트

### Phase 1: 개발 환경 (30분)
- [ ] VS Code 확장 설치
- [ ] Continue.dev 설정
- [ ] Tabnine 설치

### Phase 2: GitHub & MCP (30분)
- [ ] GitHub Personal Access Token 발급
- [ ] Claude Desktop Config 설정
- [ ] GitHub MCP 테스트

### Phase 3: 데이터베이스 (45분)
- [ ] Supabase 프로젝트 생성
- [ ] PostGIS 확장 활성화
- [ ] 초기 스키마 생성

### Phase 4: 배포 인프라 (30분)
- [ ] Vercel 계정 생성
- [ ] GitHub 연동
- [ ] 환경 변수 설정

---

## 🛠️ Phase 1: 개발 환경

### 1. VS Code 확장 설치

```bash
# 필수 확장
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension bradlc.vscode-tailwindcss
code --install-extension Prisma.prisma
code --install-extension ms-vscode.vscode-typescript-next

# AI 도구 (무료)
code --install-extension TabNine.tabnine-vscode
code --install-extension Continue.continue
```

### 2. Continue.dev 설정

**설정 파일 생성**:
```bash
mkdir -p ~/.continue
cat > ~/.continue/config.json << 'EOF'
{
  "models": [
    {
      "title": "Claude (Free Trial)",
      "provider": "free-trial",
      "model": "claude-3-sonnet"
    }
  ],
  "tabAutocompleteModel": {
    "title": "Starcoder",
    "provider": "ollama",
    "model": "starcoder:3b"
  },
  "contextProviders": [
    {
      "name": "code",
      "params": {}
    },
    {
      "name": "diff",
      "params": {}
    },
    {
      "name": "terminal",
      "params": {}
    }
  ]
}
EOF
```

**사용 방법**:
- `Cmd/Ctrl + I`: 인라인 코드 수정
- `Cmd/Ctrl + L`: 채팅 열기
- `Cmd/Ctrl + Shift + R`: 코드베이스 인덱싱

---

## 🔧 Phase 2: GitHub & MCP

### 1. GitHub Personal Access Token 발급

1. https://github.com/settings/tokens/new 접속
2. Note: "ZZIK MCP Access"
3. Expiration: 90 days
4. 권한 선택:
   - ✅ repo (전체)
   - ✅ read:org
   - ✅ workflow
5. "Generate token" 클릭
6. **토큰 복사 (다시 볼 수 없음)**

### 2. Claude Desktop Config 설정

```bash
# macOS
mkdir -p ~/Library/Application\ Support/Claude
cat > ~/Library/Application\ Support/Claude/claude_desktop_config.json << 'EOF'
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "YOUR_TOKEN_HERE"
      }
    }
  }
}
EOF

# Linux
mkdir -p ~/.config/Claude
cat > ~/.config/Claude/claude_desktop_config.json << 'EOF'
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "YOUR_TOKEN_HERE"
      }
    }
  }
}
EOF
```

**토큰 교체**:
```bash
# macOS
sed -i '' 's/YOUR_TOKEN_HERE/ghp_실제토큰/' ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Linux
sed -i 's/YOUR_TOKEN_HERE/ghp_실제토큰/' ~/.config/Claude/claude_desktop_config.json
```

### 3. MCP 테스트

Claude Desktop 재시작 후:
```
User: "ZZIK repo의 README 파일을 읽어줘"
Claude: [MCP를 통해 파일 읽기]
```

---

## 💾 Phase 3: Supabase 설정

### 1. Supabase 프로젝트 생성

1. https://supabase.com 접속
2. "Start your project" 클릭
3. GitHub으로 로그인
4. "New project" 클릭
5. 프로젝트 설정:
   - Name: `zzik-mvp`
   - Database Password: **강력한 비밀번호** (저장 필수)
   - Region: `Northeast Asia (Seoul)`
   - Pricing Plan: **Free** (500MB DB, 5GB bandwidth)
6. "Create new project" 클릭 (약 2분 소요)

### 2. PostGIS 확장 활성화

Supabase Dashboard → SQL Editor → New query:
```sql
-- PostGIS 확장 (지리 데이터 처리)
CREATE EXTENSION IF NOT EXISTS postgis;

-- UUID 생성
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 암호화
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

### 3. 초기 스키마 생성

```sql
-- Partners (프랜차이즈 본사, 병원)
CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT CHECK (type IN ('franchise', 'hospital')),
  business_name TEXT NOT NULL,
  display_name TEXT,  -- 공개 표시명 (지명형)
  monthly_fee INTEGER NOT NULL,
  status TEXT CHECK (status IN ('active', 'paused', 'terminated')) DEFAULT 'active',
  contract_start DATE,
  contract_end DATE,
  address TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Places (매장 위치)
CREATE TABLE places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  priority INTEGER DEFAULT 50 CHECK (priority BETWEEN 0 AND 100),
  radius INTEGER DEFAULT 50 CHECK (radius BETWEEN 20 AND 200),
  active BOOLEAN DEFAULT true,
  wifi_ssid_hash TEXT,  -- WiFi SSID 해시 (검증용)
  features TEXT[],  -- ["외국인 친화", "중국어 가능"]
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_places_location ON places USING GIST(location);
CREATE INDEX idx_places_priority ON places (priority DESC, active);
CREATE INDEX idx_places_partner ON places (partner_id);

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  nationality TEXT,  -- ISO 3166-1 alpha-2 (KR, CN, JP, US)
  language TEXT DEFAULT 'ko',  -- ko, zh, ja, en
  tier INTEGER DEFAULT 1 CHECK (tier BETWEEN 1 AND 5),
  total_checkins INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_users_email ON users (email);

-- Check-ins (GPS 검증)
CREATE TABLE checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  place_id UUID REFERENCES places(id),
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  gps_accuracy FLOAT NOT NULL,
  
  -- SSID 해싱 (7일 후 원본 삭제)
  wifi_ssid_hash TEXT,
  wifi_ssid_raw TEXT,  -- 7일 후 NULL 처리
  raw_data_expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
  
  -- 검증 점수 (100점 만점)
  distance_score INTEGER CHECK (distance_score BETWEEN 0 AND 40),
  accuracy_score INTEGER CHECK (accuracy_score BETWEEN 0 AND 30),
  wifi_score INTEGER CHECK (wifi_score BETWEEN 0 AND 30),
  integrity_score INTEGER GENERATED ALWAYS AS (
    distance_score + accuracy_score + wifi_score
  ) STORED,
  
  verified BOOLEAN DEFAULT false,
  device_id_hash TEXT,  -- 기기 ID 해시
  
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_checkins_user ON checkins (user_id);
CREATE INDEX idx_checkins_place ON checkins (place_id);
CREATE INDEX idx_checkins_created ON checkins (created_at DESC);
CREATE INDEX idx_checkins_expires ON checkins (raw_data_expires_at) 
  WHERE wifi_ssid_raw IS NOT NULL;

-- Coupons
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES partners(id),
  name TEXT NOT NULL,
  value INTEGER NOT NULL CHECK (value <= 49000),  -- 과세최저한
  tier_requirement INTEGER DEFAULT 1,
  expires_in_days INTEGER DEFAULT 30,
  terms TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User Coupons (발급된 쿠폰)
CREATE TABLE user_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  coupon_id UUID REFERENCES coupons(id),
  checkin_id UUID REFERENCES checkins(id),  -- 획득 경로
  issued_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  status TEXT CHECK (status IN ('active', 'used', 'expired')) DEFAULT 'active'
);

CREATE INDEX idx_user_coupons_user ON user_coupons (user_id);
CREATE INDEX idx_user_coupons_status ON user_coupons (status) WHERE status = 'active';
```

### 4. Row Level Security (RLS) 설정

```sql
-- Partners: 소유자만 수정 가능
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners are viewable by everyone" 
  ON partners FOR SELECT 
  USING (status = 'active');

CREATE POLICY "Partners can update own data" 
  ON partners FOR UPDATE 
  USING (auth.uid() = owner_id);  -- owner_id 컬럼 추가 필요

-- Users: 본인 데이터만 접근
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
  ON users FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON users FOR UPDATE 
  USING (auth.uid() = id);

-- Check-ins: 본인 데이터만 조회
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own checkins" 
  ON checkins FOR SELECT 
  USING (auth.uid() = user_id);
```

### 5. Supabase MCP 연동

Supabase Dashboard → Settings → API:
- Project URL: `https://xxx.supabase.co`
- anon public key: `eyJhbGc...` (복사)
- service_role key: `eyJhbGc...` (복사, **절대 노출 금지**)

Claude Desktop Config에 추가:
```json
{
  "mcpServers": {
    "github": { ... },
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server"],
      "env": {
        "SUPABASE_URL": "https://xxx.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "eyJhbGc..."
      }
    }
  }
}
```

---

## 🚀 Phase 4: Vercel 배포

### 1. Vercel 계정 생성

1. https://vercel.com 접속
2. "Sign Up" → GitHub으로 로그인
3. 팀 생성: "ZZIK" (Hobby Plan, 무료)

### 2. 로컬 Vercel CLI 설정

```bash
npm i -g vercel

# 로그인
vercel login

# 프로젝트 연동 (랜딩 페이지)
cd /home/user/webapp/landing
vercel link
# → Select scope: ZZIK
# → Link to existing project? No
# → Project name: zzik-landing

# 환경 변수 설정
vercel env add NEXT_PUBLIC_API_URL production
# → http://api.zzik.com (추후 변경)

vercel env add NEXT_PUBLIC_SUPABASE_URL production
# → https://xxx.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# → eyJhbGc...

# 배포
vercel --prod
```

### 3. 자동 배포 설정

Vercel Dashboard → zzik-landing → Settings → Git:
- ✅ Automatic deployments from `main` branch
- ✅ Preview deployments from pull requests

---

## 📦 Phase 5: 프로젝트 구조 생성

### 1. 디렉토리 구조
```bash
cd /home/user/webapp

mkdir -p {landing,mobile,backend,scripts,docs}
mkdir -p design-system
mv tokens.css tokens.json.txt design-system/
```

### 2. 환경 변수 템플릿
```bash
cat > .env.template << 'EOF'
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # 서버만

# API
API_BASE_URL=http://localhost:3000

# Mapbox
MAPBOX_ACCESS_TOKEN=pk.xxx

# OpenWeatherMap (선택)
OPENWEATHER_API_KEY=xxx
EOF
```

---

## 🧪 테스트

### 1. MCP GitHub 테스트
```
User: "ZZIK repo의 파일 목록을 보여줘"
Claude: [MCP로 ls 명령 실행]
```

### 2. MCP Supabase 테스트
```
User: "partners 테이블 스키마를 보여줘"
Claude: [MCP로 DESCRIBE partners 실행]
```

### 3. Continue.dev 테스트
1. VS Code에서 `Cmd/Ctrl + I`
2. "React 컴포넌트 생성: Button with primary/secondary variants"
3. 코드 자동 생성 확인

---

## 💰 비용 요약

| 도구 | 무료 한도 | 실제 비용 |
|------|-----------|----------|
| **GitHub** | Private repo 무제한 | ₩0 |
| **Supabase** | 500MB, 5GB bandwidth | ₩0 |
| **Vercel** | 100GB bandwidth, 6,000 build 분 | ₩0 |
| **Continue.dev** | 무제한 | ₩0 |
| **Tabnine** | 기본 자동완성 | ₩0 |
| **Claude** | Free tier 제한적 | ₩0 (Pro 권장: $20/월) |
| **합계** | | **₩0** |

---

## 🎯 다음 단계

- [x] 법률 문서 교정
- [x] 재무 모델 현실화
- [x] Mapbox 구현 교정
- [x] 무료 도구 설정 가이드
- [ ] UI 템플릿 실행 (rehydrate_fullcode.sh)
- [ ] 첫 커밋 & PR 생성

---

**작성자**: Claude  
**예상 소요 시간**: 2-3시간  
**난이도**: ⭐⭐☆☆☆ (초급-중급)
