# ZZIK Deployment Guide

## 🚀 Pre-Deployment Checklist

### 1. Environment Variables

#### Required for Production

**Landing Page (`landing/.env.production`)**

```bash
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=ZZIK
NEXT_PUBLIC_APP_URL=https://zzik.app

# Database (Vercel Postgres)
POSTGRES_URL=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...
POSTGRES_PRISMA_URL=postgresql://...

# Redis Cache (Vercel KV)
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...

# Authentication
JWT_SECRET=<generate-with-openssl-rand-hex-64>
JWT_EXPIRES_IN=7d
NEXTAUTH_URL=https://zzik.app
NEXTAUTH_SECRET=<generate-with-openssl-rand-hex-32>

# Blockchain (Base Network)
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_USDC_CONTRACT=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=<from-walletconnect.com>

# Maps
NEXT_PUBLIC_MAPBOX_TOKEN=<from-mapbox.com>
NEXT_PUBLIC_GOOGLE_MAPS_KEY=<from-console.cloud.google.com>

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_VERCEL_ANALYTICS=1

# Error Tracking
SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=<from-sentry.io>

# Logging
LOG_ENDPOINT=https://logs.zzik.app/ingest
LOG_LEVEL=INFO

# Rate Limiting
REDIS_URL=redis://...
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Email
SENDGRID_API_KEY=SG....
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@zzik.app

# Storage (Cloudflare R2)
R2_ACCOUNT_ID=<cloudflare-account-id>
R2_ACCESS_KEY_ID=<r2-access-key>
R2_SECRET_ACCESS_KEY=<r2-secret>
R2_BUCKET_NAME=zzik-assets

# Feature Flags
NEXT_PUBLIC_FEATURE_GPS_KALMAN_FILTER=true
NEXT_PUBLIC_FEATURE_WEB_VITALS=true
NEXT_PUBLIC_FEATURE_ERROR_BOUNDARY=true

# API Keys
INTERNAL_API_KEY=<generate-with-openssl-rand-hex-32>
WEBHOOK_SECRET=<generate-with-openssl-rand-hex-32>
```

#### How to Generate Secrets

```bash
# JWT Secret (64 characters)
openssl rand -hex 64

# NextAuth Secret (32 characters)
openssl rand -hex 32

# API Keys (32 characters)
openssl rand -hex 32
```

---

## 📦 Vercel Deployment

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Link Project

```bash
cd landing
vercel link
```

Follow the prompts:
- **Scope**: Select your organization
- **Link to existing project?**: Yes
- **Project name**: zzik-landing

### Step 4: Configure Environment Variables

```bash
# Add all environment variables
vercel env add NODE_ENV
vercel env add NEXT_PUBLIC_APP_NAME
# ... (repeat for all variables)

# Or import from .env.production
vercel env pull .env.production
```

### Step 5: Deploy to Production

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

### Step 6: Configure Custom Domain

```bash
vercel domains add zzik.app
vercel domains add www.zzik.app
```

---

## 🔧 Vercel Project Settings

### Build & Development Settings

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm ci`
- **Development Command**: `npm run dev`

### Root Directory

- Set to `landing` (not root)

### Node.js Version

- **Version**: 18.x

### Environment Variables

Configure in Vercel Dashboard:
- **Production**: Used for production deployments
- **Preview**: Used for branch/PR deployments
- **Development**: Used for local development

### Regions

- **Primary Region**: ICN1 (Seoul) - for Korean users
- **Edge Network**: Global CDN

---

## 🗄️ Database Setup (Vercel Postgres)

### Create Database

```bash
# Install Vercel Postgres SDK
npm install @vercel/postgres

# Create database via Vercel CLI
vercel postgres create zzik-production
```

### Run Migrations

```bash
# Connect to database
vercel postgres connect

# Run schema
psql -h <host> -U <user> -d <database> -f schema.sql
```

### Schema (PostgreSQL)

```sql
-- Users table
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  wallet_address VARCHAR(42) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE,
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Places table
CREATE TABLE places (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address JSONB NOT NULL,
  wifi_ssids TEXT[],
  vouchers JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Check-ins table
CREATE TABLE check_ins (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id),
  place_id VARCHAR(255) REFERENCES places(id),
  status VARCHAR(20) NOT NULL,
  gps_integrity JSONB NOT NULL,
  location JSONB NOT NULL,
  wifi_data JSONB,
  voucher_issued JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vouchers table
CREATE TABLE vouchers (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id),
  place_id VARCHAR(255) REFERENCES places(id),
  check_in_id VARCHAR(255) REFERENCES check_ins(id),
  type VARCHAR(20) NOT NULL,
  value DECIMAL(10, 2) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'active',
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  redeemed_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_check_ins_user_id ON check_ins(user_id);
CREATE INDEX idx_check_ins_place_id ON check_ins(place_id);
CREATE INDEX idx_check_ins_created_at ON check_ins(created_at);
CREATE INDEX idx_vouchers_user_id ON vouchers(user_id);
CREATE INDEX idx_vouchers_status ON vouchers(status);
CREATE INDEX idx_places_location ON places USING GIST (
  ll_to_earth(latitude, longitude)
);
```

---

## 💾 Redis Setup (Vercel KV)

### Create KV Store

```bash
# Via Vercel CLI
vercel kv create zzik-cache
```

### Configure Environment Variables

Vercel will automatically add:
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

---

## 📊 Monitoring Setup

### Vercel Analytics

```bash
# Already enabled via NEXT_PUBLIC_VERCEL_ANALYTICS=1
```

### Sentry Error Tracking

1. Create project at [sentry.io](https://sentry.io)
2. Get DSN and Auth Token
3. Add to Vercel environment variables:
   - `SENTRY_DSN`
   - `SENTRY_AUTH_TOKEN`

### Web Vitals Monitoring

Already integrated in `lib/web-vitals.ts`:
- Sends to `/api/analytics` endpoint
- Tracks LCP, FID, CLS, TTFB, FCP, INP

---

## 🔒 Security Checklist

- [ ] All secrets generated with `openssl rand -hex`
- [ ] JWT_SECRET is unique and not default
- [ ] NEXTAUTH_SECRET is set
- [ ] Database credentials are secure
- [ ] API keys have proper scopes
- [ ] Rate limiting is enabled
- [ ] CORS is properly configured
- [ ] Security headers are set (via `middleware.ts`)
- [ ] Environment variables are not committed to git
- [ ] `.env*` files are in `.gitignore`

---

## 🧪 Pre-Deploy Testing

```bash
# Run all tests
npm run test

# Type checking
npm run type-check

# Linting
npm run lint

# Build locally
npm run build

# Test production build locally
npm run start
```

---

## 📱 Mobile App Deployment (Expo)

### iOS (App Store)

```bash
cd mobile
eas build --platform ios --profile production
eas submit --platform ios
```

### Android (Google Play)

```bash
cd mobile
eas build --platform android --profile production
eas submit --platform android
```

---

## 🔄 CI/CD Pipeline

GitHub Actions automatically:
1. ✅ Runs tests on PR
2. ✅ Type checks
3. ✅ Lints code
4. ✅ Builds application
5. ✅ Security audit
6. ✅ Deploys preview for PRs
7. ✅ Deploys to production on merge to `main`

### Required GitHub Secrets

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `NEXT_PUBLIC_MAPBOX_TOKEN`
- `LHCI_GITHUB_APP_TOKEN` (optional, for Lighthouse CI)

---

## 📈 Post-Deployment

### Verify Health

```bash
curl https://zzik.app/api/health
```

Expected response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "version": "1.0.0",
    "environment": "production"
  }
}
```

### Monitor Logs

```bash
# View real-time logs
vercel logs zzik-landing --follow

# Filter by function
vercel logs zzik-landing --output=api/check-in
```

### Check Performance

- **Vercel Analytics**: https://vercel.com/dashboard/analytics
- **Web Vitals**: https://zzik.app/api/analytics
- **Sentry**: https://sentry.io/organizations/zzik

---

## 🚨 Rollback Procedure

### Instant Rollback via Vercel Dashboard

1. Go to Vercel Dashboard → Deployments
2. Find previous successful deployment
3. Click "..." → "Promote to Production"

### Via CLI

```bash
# List recent deployments
vercel ls

# Rollback to specific deployment
vercel rollback <deployment-url>
```

---

## 📞 Support Contacts

- **Vercel Support**: support@vercel.com
- **Sentry Support**: support@sentry.io
- **Team Lead**: [Add contact]

---

## 📝 Deployment History

| Date | Version | Deployer | Notes |
|------|---------|----------|-------|
| 2024-01-15 | 1.0.0 | Initial | Production launch |

---

## 🔍 Troubleshooting

### Build Fails

```bash
# Check build logs
vercel logs --output=build

# Clear cache and rebuild
vercel build --force
```

### Environment Variables Not Loading

```bash
# Pull latest environment variables
vercel env pull

# Verify variables
vercel env ls
```

### Database Connection Issues

```bash
# Test connection
vercel postgres connect

# Check connection string format
echo $POSTGRES_URL
```

---

**Last Updated**: 2024-01-15  
**Document Owner**: DevOps Team
